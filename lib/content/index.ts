import type { Locale, PortfolioContent } from "@/lib/content/types";
import { content as englishContent } from "@/lib/content/en";
import { content as indonesianContent } from "@/lib/content/id";

export type {
  Capability,
  CaseMetric,
  CaseStep,
  CaseStudy,
  Certificate,
  Experience,
  Locale,
  MetaRow,
  NavItem,
  PortfolioContent,
  Project,
  SocialLink,
} from "@/lib/content/types";

/** Every locale the site ships. Order matters: the first is the fallback. */
export const locales = ["en", "id"] as const;

export const defaultLocale: Locale = "en";

const dictionaryByLocale: Record<Locale, PortfolioContent> = {
  en: englishContent,
  id: indonesianContent,
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "id";
}

/** The complete, ready-to-render content for one locale. */
export function getContent(locale: Locale): PortfolioContent {
  return dictionaryByLocale[locale];
}

/**
 * Prefixes a site-relative path with its locale.
 *
 * `localizedPath("id", "/projects/atlas")` → `/id/projects/atlas`, and
 * `localizedPath("en", "/")` → `/en`. Every internal link goes through here so
 * a locale can never be dropped by a hand-written href.
 */
export function localizedPath(locale: Locale, path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

/**
 * Fills `{token}` placeholders in a dictionary template.
 *
 * Dictionary strings stay plain data (they are read from server components and
 * serialised into the RSC payload), so interpolation is a separate step rather
 * than a function stored in the dictionary.
 */
export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, token: string) => {
    const replacement = values[token];
    return replacement === undefined ? placeholder : String(replacement);
  });
}

/**
 * The absolute origin the site claims to live at.
 *
 * Canonical links, `hreflang`, the sitemap, `robots.txt` and the JSON-LD graph
 * all need an absolute origin, and no deployment knows its own domain until the
 * host says so: `VERCEL_PROJECT_PRODUCTION_URL` is exactly that answer on
 * Vercel, and it names the production domain even inside a preview build —
 * which is what a canonical link should point at anyway. `NEXT_PUBLIC_SITE_URL`
 * wins when it is set, so a custom domain can be pinned without touching code,
 * and the dictionary's own constant is the last resort: local development and
 * any host that tells us nothing.
 */
export function resolveSiteUrl(fallbackUrl: string): string {
  const withoutTrailingSlash = (value: string) => value.replace(/\/+$/, "");

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) return withoutTrailingSlash(configuredUrl);

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionHost) {
    return `https://${withoutTrailingSlash(vercelProductionHost)}`;
  }

  return withoutTrailingSlash(fallbackUrl);
}

/** The locale a visitor should land on, given an Accept-Language header. */
export function resolveLocaleFromAcceptLanguage(
  acceptLanguageHeader: string | null,
): Locale {
  if (!acceptLanguageHeader) return defaultLocale;

  const candidates = acceptLanguageHeader
    .split(",")
    .map((part, order) => {
      const [tag = "", ...options] = part.trim().split(";");
      const qualityOption = options.find((option) =>
        option.trim().startsWith("q="),
      );
      const quality = qualityOption
        ? Number(qualityOption.trim().slice(2))
        : 1;
      return { tag: tag.toLowerCase(), quality, order };
    })
    .filter(({ tag, quality }) => tag !== "*" && quality > 0)
    .sort(
      (candidateA, candidateB) =>
        candidateB.quality - candidateA.quality ||
        candidateA.order - candidateB.order,
    );

  for (const { tag } of candidates) {
    const baseLanguage = tag.split("-")[0];
    if (isLocale(baseLanguage)) return baseLanguage;
  }
  return defaultLocale;
}
