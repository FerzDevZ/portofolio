import { notFound } from "next/navigation";
import { getContent, isLocale } from "@/lib/content";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { Capabilities, Experience } from "@/components/capabilities";
import { Certificates } from "@/components/certificates";
import { Contact, Footer } from "@/components/contact";
import { CursorLabel } from "@/components/cursor-label";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = getContent(lang);

  return (
    <>
      <Header
        locale={content.locale}
        nav={content.nav}
        site={content.site}
        ui={content.ui}
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
