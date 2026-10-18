import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent, isLocale, localeAlternates, localizedPath } from "@/lib/content";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { Capabilities, Experience } from "@/components/capabilities";
import { Certificates } from "@/components/certificates";
import { Contact, Footer } from "@/components/contact";
import { CursorLabel } from "@/components/cursor-label";

/**
 * The home page owns its canonical and its `hreflang` pair.
 *
 * These used to live in the layout, which meant every URL under `[lang]` —
 * including the 404 boundary, which has no metadata of its own — inherited a
 * canonical pointing at the home page. A canonical is a statement about the
 * page it appears on, so it belongs to the page that has an identity.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return {
    alternates: {
      canonical: localizedPath(lang),
      languages: localeAlternates("/"),
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = getContent(lang);
  /* The header renders the nav, the clock and a handful of controls. Passing
     `content.site` and `content.ui` straight through typechecked — the types
     are structural, and a wider object satisfies a narrower one — but it
     serialised the e-mail, the description, the portrait alt text and the 404
     copy into the RSC payload of every page. These two literals are the exact
     slice `HeaderContent` declares. */
  const { notFound: notFoundCopy, ...headerUi } = content.ui;

  return (
    <>
      <Header
        locale={content.locale}
        nav={content.nav}
        site={{
          name: content.site.name,
          initials: content.site.initials,
          timezone: content.site.timezone,
        }}
        ui={headerUi}
      />
      <main id="main">
        <CursorLabel label={content.ui.cursorViewLabel} />
        <Hero content={content} />
        <Work content={content} />
        <Capabilities content={content} />
        <Experience content={content} />
        <Certificates certificates={content.certificates} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </>
  );
}
