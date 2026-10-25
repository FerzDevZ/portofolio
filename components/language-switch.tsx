import Link from "next/link";
import {
  formatTemplate,
  localizedPath,
  publishedLocales,
  type Locale,
  type PortfolioContent,
} from "@/lib/content";

type LanguageSwitchProps = {
  /** The locale currently rendered — the switch offers the others. */
  locale: Locale;
  /** Only the two strings this control renders, not the whole dictionary. */
  ui: Pick<
    PortfolioContent["ui"],
    "languageSwitchTemplate" | "languageSwitchHint"
  >;
  /** Locale-free path to stay on, e.g. `/` or `/projects/atlas`. */
  currentPath?: string;
  /** `pill` for the header cluster, `menuRow` for the mobile panel. */
  variant?: "pill" | "menuRow";
  /** Called after a tap, so the mobile panel can close itself. */
  onNavigate?: () => void;
};

/**
 * Switches to another locale without leaving the page.
 *
 * A server component with no state: the locales are static routes, so the
 * switch is a plain `<Link>` to the same path under the other prefix — which
 * also means it works before hydration and gets prefetched.
 *
 * The candidates come from `publishedLocales` rather than a hand-written
 * pair, so publishing a third locale cannot leave this switch swapping the
 * wrong two. With exactly one other locale (today: en ↔ id) the control is a
 * single one-tap swap whose label is the target language's own name —
 * someone who cannot read the current translation should still recognise the
 * one they want. With several, each additional locale renders beside it as
 * its code; the full menu treatment is a design decision to make when a
 * third locale actually ships.
 */
export function LanguageSwitch({
  locale,
  ui,
  currentPath = "/",
  variant = "pill",
  onNavigate,
}: LanguageSwitchProps) {
  const otherLocales = publishedLocales.filter(
    (candidate) => candidate !== locale,
  );
  const [firstOtherLocale, ...furtherLocales] = otherLocales;

  if (firstOtherLocale === undefined) {
    /* A single published locale has nothing to switch to; the component
       renders nothing rather than a link to the page it is already on. */
    return null;
  }

  const otherLanguageName = ui.languageSwitchHint;
  const actionLabel = formatTemplate(ui.languageSwitchTemplate, {
    language: otherLanguageName,
  });

  if (variant === "menuRow") {
    return (
      <>
        <Link
          href={localizedPath(firstOtherLocale, currentPath)}
          onClick={onNavigate}
          aria-label={actionLabel}
          title={actionLabel}
          className="flex items-center justify-between gap-4 py-3.5 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
        >
          {otherLanguageName}
          <span
            aria-hidden="true"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
          >
            {firstOtherLocale}
          </span>
        </Link>
        {furtherLocales.map((furtherLocale) => (
          <Link
            key={furtherLocale}
            href={localizedPath(furtherLocale, currentPath)}
            onClick={onNavigate}
            aria-label={formatTemplate(ui.languageSwitchTemplate, {
              language: furtherLocale,
            })}
            className="flex items-center justify-between gap-4 py-3.5 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            {furtherLocale}
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
            >
              {furtherLocale}
            </span>
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      <Link
        href={localizedPath(firstOtherLocale, currentPath)}
        onClick={onNavigate}
        aria-label={actionLabel}
        title={actionLabel}
        className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-line bg-panel/60 px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
      >
        {firstOtherLocale}
      </Link>
      {furtherLocales.map((furtherLocale) => (
        <Link
          key={furtherLocale}
          href={localizedPath(furtherLocale, currentPath)}
          onClick={onNavigate}
          aria-label={formatTemplate(ui.languageSwitchTemplate, {
            language: furtherLocale,
          })}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-line bg-panel/60 px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
        >
          {furtherLocale}
        </Link>
      ))}
    </>
  );
}
