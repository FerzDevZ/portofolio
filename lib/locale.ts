/**
 * The locale sets — the single place that knows which languages exist and
 * which of them the site actually publishes.
 *
 * This module deliberately imports nothing: the middleware runs on the edge
 * and the error boundary is a client component, and both of them need to
 * answer "is this a locale?" without dragging the two dictionaries into their
 * bundle. `lib/content/index.ts` re-exports everything here, so a component
 * can keep importing from the barrel.
 *
 * Two sets, on purpose:
 *
 * - `locales` is the **type universe**: every language that has a compiled
 *   dictionary satisfying `PortfolioContent`. It exists so `Record<Locale, …>`
 *   mappings (the dictionary barrel, the error copy, the 404 boundary) are
 *   exhaustive, and so a translator can land a dictionary before it ships.
 * - `publishedLocales` is the **routing set**: what `generateStaticParams`
 *   renders, what `hreflang` advertises, what the sitemap lists, and what the
 *   middleware will accept or redirect a visitor to.
 *
 * Splitting them is what keeps a skeleton dictionary honest. `lib/content/ja.ts`
 * is prep-only placeholder copy; while it lived in the routing set, `/ja` was a
 * fully linked page rendering `[Japanese headline to be translated]`, the
 * sitemap advertised it to crawlers in three languages, and the blog routes —
 * which only have en/id articles — answered `/ja/blog` with an internal
 * `NoFallbackError`. Moving a language into `publishedLocales` is now a
 * one-line change, and it is the last step of adding one, after the dictionary
 * is translated.
 */

/** Every locale with a dictionary. Order matters: the first is the fallback. */
export const locales = ["en", "id", "ja"] as const;

export type Locale = (typeof locales)[number];

/** The locales the site publishes routes for, in fallback order. */
export const publishedLocales = ["en", "id"] as const satisfies readonly Locale[];

export type PublishedLocale = (typeof publishedLocales)[number];

export const defaultLocale: PublishedLocale = publishedLocales[0];

/** True for any locale with a dictionary, published or still being translated. */
export function isLocale(value: string | undefined | null): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

/**
 * True only for a locale the site ships routes for.
 *
 * This is the predicate routing uses: a stale `NEXT_LOCALE=ja` cookie or an
 * `Accept-Language: ja` must not send a visitor to a page that does not exist.
 */
export function isPublishedLocale(
  value: string | undefined | null,
): value is PublishedLocale {
  return (
    typeof value === "string" &&
    (publishedLocales as readonly string[]).includes(value)
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
 * The `hreflang` map for one locale-free path: every *published* locale, plus
 * `x-default` pointing at the fallback.
 *
 * Derived from the published tuple rather than written out by hand, so adding
 * a third language cannot leave a page pairing only two of them — and so an
 * unpublished dictionary can never be advertised to a crawler.
 */
export function localeAlternates(path = "/"): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of publishedLocales) {
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
 *
 * Only published locales can be resolved to: `ja` has a dictionary but no
 * routes, so a Japanese browser lands on the fallback rather than on a 404.
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
    if (isPublishedLocale(baseLanguage)) return baseLanguage;
  }
  return defaultLocale;
}
