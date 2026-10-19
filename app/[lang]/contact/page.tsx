import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent, isLocale, type Locale } from "@/lib/content";
import { ContactForm } from "@/components/contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const content = getContent(lang);

  return {
    title: "Contact",
    description: `Get in touch with ${content.site.name}. Available for select projects.`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = getContent(lang as Locale);

  return (
    <main className="min-h-screen bg-[#F6F1E8] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <div className="mb-4 inline-block rounded-full bg-[#F0E3D0] px-4 py-1.5 text-sm font-medium text-[#C8853F]">
            Now in public beta
          </div>
          <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight text-[#1F2421] md:text-5xl">
            Get in <em className="italic text-[#C8853F]">touch</em>
          </h1>
          <p className="text-lg text-[#8A8A80]">
            Available for select projects. Looking for design systems, performance work, or interfaces that demand precision.
          </p>
        </header>

        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_12px_rgba(42,39,35,0.08)] md:p-12">
          <ContactForm />
        </div>

        <footer className="mt-8 text-center text-sm text-[#8A8A80]">
          <p>
            Prefer email? Reach me directly at{" "}
            <a
              href={`mailto:${content.site.email}`}
              className="font-medium text-[#C8853F] underline decoration-[#C8853F]/30 underline-offset-2 transition-colors hover:text-[#A86B2C] hover:decoration-[#A86B2C]/50"
            >
              {content.site.email}
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
