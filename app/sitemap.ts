import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";
import {
  contentRoutes,
  getContent,
  localeAlternates,
  publishedLocales,
  localizedPath,
  resolveSiteUrl,
  defaultLocale,
  type Locale,
  type PublishedLocale,
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
 * The dictionary routes come from `contentRoutes()` — the home page and every
 * case study — and the pages a visitor can reach from the footer (blog,
 * contact, resume) are added explicitly. Articles are not dictionary entries:
 * they are MDX files, so they are enumerated from the filesystem per locale.
 *
 * Every URL listed here must also be indexable. That is why `/resume` carries
 * no `noindex` any more: a page linked from the footer of every page is a
 * public page, and a sitemap entry for a URL that tells crawlers to stay away
 * would contradict the page itself.
 *
 * The locale list comes from `publishedLocales`, so a dictionary that is still
 * placeholder text is never advertised.
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
  const staticPaths = [...contentRoutes(), "/blog", "/contact", "/resume"];

  return publishedLocales.flatMap((locale: PublishedLocale) => [
    ...staticPaths.map((path) => buildEntry(siteUrl, locale, path)),
    ...getBlogPosts(locale).map((post) =>
      buildEntry(siteUrl, locale, `/blog/${post.slug}`),
    ),
  ]);
}
