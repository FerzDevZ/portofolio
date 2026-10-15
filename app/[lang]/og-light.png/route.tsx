import { defaultLocale, getContent, isLocale, locales } from "@/lib/content";
import { ogContentType, ogPalettes, renderOgCard } from "@/lib/og-card";

/**
 * The light share card, at `/<locale>/og-light.png`.
 *
 * The folder carries the extension so the URL does: several preview consumers
 * are happier with a path that ends in an image extension than with an
 * extensionless one, and the `Content-Type` below is what actually matters.
 *
 * This is deliberately *not* wired into `og:image`. A social crawler fetches
 * the metadata once and caches it by URL, with no knowledge of the viewer's
 * colour scheme, so pointing `og:image` here would force this palette on
 * everyone — including dark-mode readers. It exists so the light card can be
 * shared deliberately, or referenced by a page that runs in light mode.
 */
export const dynamic = "force-static";

/** Pre-rendered per locale, so the route is a static asset, not a function. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  const content = getContent(isLocale(lang) ? lang : defaultLocale);

  const response = renderOgCard(ogPalettes.light, content);
  response.headers.set("Content-Type", ogContentType);
  response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  return response;
}
