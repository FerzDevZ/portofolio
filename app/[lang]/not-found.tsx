import Link from "next/link";
import { headers } from "next/headers";
import { getContent, isLocale, localizedPath } from "@/lib/content";
import type { Locale } from "@/lib/content/types";
import { SkipLink } from "@/components/skip-link";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/contact";

/**
 * Localised 404 boundary for the `[lang]` segment.
 *
 * Next renders a not-found boundary from an error shell: the response carries
 * the 404 status and the layout's metadata, and this component travels in the
 * RSC payload and hydrates into the full document (lang, font variables, theme
 * script). The language comes from the `x-locale` header the middleware
 * forwards for prefixed paths, so a boundary that never sees `params` can
 * still speak the visitor's language.
 */
export default async function NotFound() {
  const headerList = await headers();
  const headerLocale = headerList.get("x-locale");
  const locale: Locale = isLocale(headerLocale) ? headerLocale : "en";
  const content = getContent(locale);
  const labels = content.ui.notFound;

  return (
    <>
      <SkipLink label={content.ui.skipToContent} />
      <header className="safe-area-header border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href={localizedPath(locale)}
            className="flex items-center gap-2.5"
            aria-label={`${content.site.name} — ${labels.back}`}
          >
            <span className="font-mono text-sm tracking-widest text-ink">{content.site.initials}</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitch locale={locale} ui={content.ui} />
            <ThemeToggle labels={content.ui} />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-5 sm:px-8">
        <article className="py-20 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {labels.figure}
          </p>
          <h1 className="mt-6 text-title text-ink">{labels.title}</h1>
          <p className="mt-5 max-w-xl mx-auto text-ink-muted">{labels.subtitle}</p>
          <Link href={localizedPath(locale)} className="btn btn-primary mt-9 inline-flex">
            {labels.back}
          </Link>
        </article>
      </main>
      <Footer content={content} />
    </>
  );
}
