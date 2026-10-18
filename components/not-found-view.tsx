"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortfolioContent } from "@/lib/content";
import { localizedPath, type Locale } from "@/lib/locale";
import { CopyrightLine } from "@/components/copyright-line";
import { LanguageSwitch } from "@/components/language-switch";
import { SkipLink } from "@/components/skip-link";
import { ThemeToggle, type ThemeToggleLabels } from "@/components/theme-toggle";

/**
 * The strings the 404 needs, already resolved for one locale.
 *
 * Only the narrow slice travels: the boundary ships two of these objects (one
 * per locale) so the page can pick without knowing the locale at render time,
 * and neither of them may drag a whole dictionary across the RSC boundary.
 */
export type NotFoundCopy = {
  locale: Locale;
  skipLabel: string;
  brandAriaLabel: string;
  siteName: string;
  initials: string;
  languageSwitchUi: Pick<
    PortfolioContent["ui"],
    "languageSwitchTemplate" | "languageSwitchHint"
  >;
  themeLabels: ThemeToggleLabels;
  notFound: PortfolioContent["ui"]["notFound"];
  copyrightTemplate: string;
  buildYear: number;
};

/**
 * The localized 404 body.
 *
 * Next renders `not-found.tsx` as `<Component />` with no props, so the
 * boundary cannot learn its locale from `params`. Reading it from
 * `headers()` (the `x-locale` the middleware forwards) would work, but a
 * dynamic API anywhere in the `[lang]` tree opts *every* page in that tree
 * into dynamic rendering — measured: 10 prerendered routes with it, 24
 * without. The locale is therefore read from the path the visitor is already
 * on, which is the same trick `error.tsx` uses and costs nothing: the 404
 * document is hydrated from Next's error shell either way, so there is no
 * server-rendered variant to keep in sync.
 *
 * The footer is deliberately compact: the home page's footer exists to carry
 * the contact section and the 3D-motion switch, and this page has no 3D scene
 * to switch off. A way back, the language switch, the theme control and the
 * copyright line are what a visitor who mistyped a URL actually needs.
 */
export function NotFoundView({
  copy,
}: {
  copy: Record<Locale, NotFoundCopy>;
}) {
  const pathname = usePathname();
  const locale: Locale = pathname?.split("/")[1] === "id" ? "id" : "en";
  const activeCopy = copy[locale];
  const labels = activeCopy.notFound;

  return (
    <>
      <SkipLink label={activeCopy.skipLabel} />
      <header className="safe-area-header border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href={localizedPath(locale)}
            className="flex items-center gap-2.5"
            aria-label={activeCopy.brandAriaLabel}
          >
            <span className="font-mono text-sm tracking-widest text-ink">
              {activeCopy.initials}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitch locale={locale} ui={activeCopy.languageSwitchUi} />
            <ThemeToggle labels={activeCopy.themeLabels} />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-5 sm:px-8">
        <article className="py-20 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {labels.figure}
          </p>
          <h1 className="mt-6 text-title text-ink">{labels.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-ink-muted">{labels.subtitle}</p>
          <Link
            href={localizedPath(locale)}
            className="btn btn-primary mt-9 inline-flex"
          >
            {labels.back}
          </Link>
        </article>
      </main>
      <footer className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <div className="border-t border-line pt-6">
          <CopyrightLine
            template={activeCopy.copyrightTemplate}
            name={activeCopy.siteName}
            buildYear={activeCopy.buildYear}
          />
        </div>
      </footer>
    </>
  );
}
