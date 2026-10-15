import { defaultLocale, getContent, isLocale, locales } from "@/lib/content";
import {
  ogContentType,
  ogPalettes,
  ogSize,
  renderOgAlt,
  renderOgCard,
} from "@/lib/og-card";

/**
 * Canonical Open Graph card, generated at build time by Next — one per locale,
 * because the card carries real copy (the role, the availability line, the
 * credential) and a crawler should find it in the language of the page it is
 * previewing.
 *
 * It stays the dark card on purpose: `og:image` is one URL with no appearance
 * semantics, so there is no light variant to switch to — see the note in
 * `lib/og-card.tsx`. The light card lives at `/<locale>/og-light.png` for
 * sharing into light contexts by hand.
 *
 * There is no `alt` export: one file serves both locales, and a module-level
 * constant cannot vary per segment. The alt text is emitted through
 * `generateImageMetadata` below, which receives the segment's params.
 */
export const size = ogSize;
export const contentType = ogContentType;

/**
 * Prerendered for both locales at build time. Declared here rather than
 * inherited: a metadata image in a dynamic segment is otherwise generated on
 * every crawler fetch, which would make the one asset a social platform is
 * guaranteed to ask for the only uncached route on the site.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  /* `__metadata_id__` is part of this route's params because the image is
     described by `generateImageMetadata`; both halves have to be enumerated
     for the route to be treated as static. */
  return locales.map((lang) => ({ lang, __metadata_id__: "card" }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const content = getContent(isLocale(lang) ? lang : defaultLocale);

  return [
    {
      id: "card",
      alt: renderOgAlt(content),
      size: ogSize,
      contentType: ogContentType,
    },
  ];
}

export default async function LocaleOpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const content = getContent(isLocale(lang) ? lang : defaultLocale);

  return renderOgCard(ogPalettes.dark, content);
}
