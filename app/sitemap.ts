import type { MetadataRoute } from "next";
import {
  defaultLocale,
  getContent,
  locales,
  localizedPath,
  resolveSiteUrl,
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
 */
function buildEntry(
  siteUrl: string,
  locale: Locale,
  path: string,
  lastModified: Date,
): MetadataRoute.Sitemap[number] {
  const languageAlternates: Record<string, string> = Object.fromEntries(
    locales.map((alternateLocale: Locale) => [
      alternateLocale,
      `${siteUrl}${localizedPath(alternateLocale, path)}`,
    ]),
  );
  languageAlternates["x-default"] = `${siteUrl}${localizedPath(defaultLocale, path)}`;

  return {
    url: `${siteUrl}${localizedPath(locale, path)}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
    alternates: { languages: languageAlternates },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl(getContent(defaultLocale).site.url);
  /* The case-study routes are identical in both dictionaries, so the default
     locale is the single source of truth for which paths exist. The featured
     project lives outside `projects` and is the site's most-linked case study,
     so it leads the list rather than being left out of the sitemap. */
  const caseStudyPaths = [
    getContent(defaultLocale).featuredProject.href,
    ...getContent(defaultLocale).projects.map((project) => project.href),
  ];
  const lastModified = new Date();

  return locales.flatMap((locale: Locale) =>
    ["/", ...caseStudyPaths].map((path) =>
      buildEntry(siteUrl, locale, path, lastModified),
    ),
  );
}
