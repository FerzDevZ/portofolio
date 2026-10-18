import type { PortfolioContent } from "@/lib/content/types";
import {
  defaultLocale,
  isLocale,
  localeAlternates,
  locales,
  localizedPath,
  resolveLocaleFromAcceptLanguage,
  type Locale,
} from "@/lib/locale";
import { content as englishContent } from "@/lib/content/en";
import { content as indonesianContent } from "@/lib/content/id";

export type {
  Capability,
  CaseMetric,
  CaseStep,
  CaseStudy,
  Certificate,
  Experience,
  MetaRow,
  NavItem,
  PortfolioContent,
  Project,
  SocialLink,
} from "@/lib/content/types";

/**
 * Re-exported from `lib/locale.ts` so a component can keep importing from the
 * barrel while the middleware and the error boundary import the dictionary-free
 * module directly.
 */
export {
  defaultLocale,
  isLocale,
  localeAlternates,
  locales,
  localizedPath,
  resolveLocaleFromAcceptLanguage,
  type Locale,
};

const dictionaryByLocale: Record<Locale, PortfolioContent> = {
  en: englishContent,
  id: indonesianContent,
};

/** The complete, ready-to-render content for one locale. */
export function getContent(locale: Locale): PortfolioContent {
  return dictionaryByLocale[locale];
}

/**
 * Every page the site publishes, as locale-free paths, in the order the work
 * section presents them.
 *
 * One list feeds `generateStaticParams` and the sitemap. They used to read
 * different arrays (`featuredProject + projects` in one place, `projects` in
 * the other), which is exactly how the featured case study fell out of the
 * sitemap once already.
 */
export function contentRoutes(locale: Locale = defaultLocale): string[] {
  const content = getContent(locale);
  return [
    "/",
    ...[content.featuredProject, ...content.projects].map(
      (project) => project.href,
    ),
  ];
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

  /* A configured origin is used verbatim, so it has to be a URL: the layout
     feeds this into `new URL()` for `metadataBase`, and a value without a
     scheme (`example.com`) throws a `TypeError` from a line that never names
     the environment variable that caused it. Failing here, with the variable's
     name in the message, is the difference between a five-second fix and a
     stack trace in a minified server bundle. */
  const readOrigin = (rawValue: string, envName: string): string => {
    const candidate = withoutTrailingSlash(rawValue);
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("unsupported protocol");
      }
      return candidate;
    } catch {
      throw new Error(
        `${envName} must be an absolute http(s) URL, e.g. https://example.com — received "${rawValue}".`,
      );
    }
  };

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    return readOrigin(configuredUrl, "NEXT_PUBLIC_SITE_URL");
  }

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionHost) {
    return `https://${withoutTrailingSlash(vercelProductionHost)}`;
  }

  return withoutTrailingSlash(fallbackUrl);
}
