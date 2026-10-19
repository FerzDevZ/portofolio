import { NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog";
import { getContent, resolveSiteUrl } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/locale";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const locale = lang as Locale;
  const content = getContent(locale);
  const siteUrl = resolveSiteUrl(content.site.url);
  const posts = getBlogPosts(locale);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(content.site.name)} - Blog</title>
    <link>${siteUrl}/${lang}/blog</link>
    <description>${escapeXml(content.site.description)}</description>
    <language>${lang === "id" ? "id-ID" : "en-US"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/${lang}/feed.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/${lang}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/${lang}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags ? post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ") : ""}
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}
