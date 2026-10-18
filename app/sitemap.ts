import type { MetadataRoute } from "next";
import {
  contentRoutes,
  getContent,
  localeAlternates,
  locales,
  localizedPath,
  resolveSiteUrl,
  defaultLocale,
  type Locale,
} from "@/lib/content";

/**
 * The sitemap is the machine-readable half of the site's `hreflang` story.
 *
 * Every page is listed once per locale — both URLs deserve to be indexed in
 * their own right — and each entry names the other language as an alternate,
 * so a crawler pairs `/en/projects/atlas` with `/id/projects/atlas` instead of
 * treating one as a duplicate of the other. `x-default` points at the default
 * locale, which is also where the middleware sends a visitor whose
 * Accept-Language matches neither dictionary.
 *
 * The route list comes from `contentRoutes()`, the same function
 * `generateStaticParams` uses, so the sitemap cannot fall one array short of
 * the routes that actually exist.
 *
 * `lastModified` is deliberately absent. It used to be `new Date()`, which
 * restamped every URL on every deploy without a single page changing — a
 * freshness claim that was never true. Omitting it says "unknown", which is
 * the honest answer, and leaves the field for a future source that knows.
 */
function buildEntry(
  siteUrl: string,
  locale: Locale,
  path: string,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${localizedPath(locale, path)}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
    alternates: { languages: localeAlternates(path) },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl(getContent(defaultLocale).site.url);
  const paths = contentRoutes();

  return locales.flatMap((locale: Locale) =>
    paths.map((path) => buildEntry(siteUrl, locale, path)),
  );
}
