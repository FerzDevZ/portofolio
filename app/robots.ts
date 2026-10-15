import type { MetadataRoute } from "next";
import { defaultLocale, getContent, resolveSiteUrl } from "@/lib/content";

/** Everything here is public, so the only job is pointing at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl(getContent(defaultLocale).site.url);

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
