/**
 * The locale set — the single place that knows which languages ship.
 *
 * This module deliberately imports nothing: the middleware runs on the edge
 * and the error boundary is a client component, and both of them need to
 * answer "is this a locale?" without dragging the two dictionaries into their
 * bundle. `lib/content/index.ts` re-exports everything here, so a component
 * can keep importing from the barrel.
 */

/** Every locale the site ships. Order matters: the first is the fallback. */
export const locales = ["en", "id"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = locales[0];

export function isLocale(value: string | undefined | null): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
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
 * The `hreflang` map for one locale-free path: every locale that ships, plus
 * `x-default` pointing at the fallback.
 *
 * Derived from the locale tuple rather than written out by hand, so adding a
 * third language cannot leave a page pairing only two of them.
 */
export function localeAlternates(path = "/"): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = localizedPath(locale, path);
  }
  alternates["x-default"] = localizedPath(defaultLocale, path);
  return alternates;
}

/**
 * The locale a visitor should land on, given an `Accept-Language` header.
 *
 * Quality values decide first and declaration order breaks ties, so
 * `en;q=0.4, id;q=0.9` resolves to `id` and `fr, id` resolves to `id` (the
 * unsupported tag is skipped, not used as a signal for English).
 */
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
