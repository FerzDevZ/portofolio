import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getContent,
  isPublishedLocale,
  localeAlternates,
  localizedPath,
} from "@/lib/content";
import { ContactForm } from "@/components/contact-form";
import { Contact, splitEmail } from "@/components/contact";
import { CopyrightLine } from "@/components/copyright-line";
import { LanguageSwitch } from "@/components/language-switch";
import { PageLinks } from "@/components/page-links";
import { SkipLink } from "@/components/skip-link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * The standalone contact page — the same chrome and tokens as the blog and
 * case-study pages, with the server-action form as its centrepiece.
 *
 * It used to ship a second design language (a hard-coded paper palette,
 * serif display type, centred layout, English-only copy) that violated the
 * site's own rules: every colour must come from a token and every string
 * from the dictionary. The page now reads `content.contactPage` like every
 * other route, so `/id/contact` speaks Indonesian and the theme toggle
 * follows the visitor here too.
 *
 * The guard is `isPublishedLocale`, the same predicate every page-building
 * surface uses: a locale with a dictionary but no routes must 404, not
 * render placeholder copy.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isPublishedLocale(lang)) return {};
  const content = getContent(lang);

  return {
    title: content.contactPage.heading,
    description: content.contactPage.lede,
    alternates: {
      canonical: localizedPath(lang, "/contact"),
      languages: localeAlternates("/contact"),
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isPublishedLocale(lang)) notFound();

  const content = getContent(lang);
  const { contactPage, site, socials, contact } = content;
  const { localPart, domain } = splitEmail(site.email);

  return (
    <>
      <SkipLink label={content.ui.skipToContent} />

      <header className="safe-area-header border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <a
            href={localizedPath(lang)}
            className="flex items-center gap-2.5"
            aria-label={`${site.name} — ${contactPage.kicker}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-line-strong bg-panel font-mono text-[10px] font-medium text-ink">
              {site.initials}
            </span>
            <span className="text-sm font-medium tracking-tight text-ink">
              {site.name}
            </span>
          </a>
          <div className="flex items-center gap-4">
            <LanguageSwitch
              locale={content.locale}
              ui={content.ui}
              currentPath="/contact"
            />
            <ThemeToggle labels={content.ui} />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <header className="pt-16 sm:pt-20">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            {contactPage.kicker}
          </p>
          <h1 className="mt-6 text-display text-ink">{contactPage.heading}</h1>
          <p className="mt-6 max-w-xl text-lede text-ink-muted">
            {contactPage.lede}
          </p>
          <p className="mt-8 flex items-center gap-2 font-mono text-xs text-ink-faint">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-live shadow-[0_0_6px_var(--color-live)]"
            />
            {site.availability}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <section className="lg:col-span-7" aria-label={contactPage.formLabel}>
            <h2 className="border-b border-line pb-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              {contactPage.formLabel}
            </h2>
            <div className="mt-8 rounded-lg border border-line bg-panel p-6 shadow-[0_16px_48px_-24px_var(--color-shadow-soft)] sm:p-8">
              <ContactForm labels={contactPage} />
            </div>
          </section>

          <aside className="lg:col-span-5">
            <h2 className="border-b border-line pb-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              {contact.socialsLabel}
            </h2>
            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                {contactPage.preferEmail}
              </p>
              <a
                href={`mailto:${site.email}`}
                className="link-sweep mt-4 inline-block text-email text-ink [overflow-wrap:anywhere]"
              >
                {localPart}
                <wbr />
                {domain}
              </a>
            </div>
            <nav aria-label={contact.socialsLabel} className="mt-10">
              <ul className="border-t border-line">
                {socials.map((socialLink) => (
                  <li key={socialLink.label}>
                    <a
                      href={socialLink.href}
                      target={
                        socialLink.href.startsWith("mailto:")
                          ? undefined
                          : "_blank"
                      }
                      rel="noreferrer"
                      className="group flex flex-wrap items-center justify-between gap-y-1 border-b border-line py-4 transition-colors duration-150 hover:text-ink"
                    >
                      <span className="text-sm text-ink-muted transition-colors duration-150 group-hover:text-ink">
                        {socialLink.label}
                      </span>
                      <span className="ml-auto flex items-center gap-3 font-mono text-xs text-ink-faint">
                        {socialLink.handle}
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        >
                          <path
                            d="M3.5 8.5L8.5 3.5M4.5 3.5h4v4"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </main>

      <footer className="mt-10 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <PageLinks
            locale={content.locale}
            links={content.pageLinks}
            label={content.footer.pagesLabel}
          />
          <div className="mt-5 border-t border-line pt-5">
            <CopyrightLine
              template={content.footer.copyrightTemplate}
              name={content.site.name}
              buildYear={new Date().getFullYear()}
            />
          </div>
        </div>
      </footer>
    </>
  );
}
