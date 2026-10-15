import Link from "next/link";
import {
  formatTemplate,
  localizedPath,
  type Locale,
  type PortfolioContent,
} from "@/lib/content";

type LanguageSwitchProps = {
  /** The locale currently rendered — the switch offers the other one. */
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
 * Switches to the other locale without leaving the page.
 *
 * A server component with no state: the two locales are static routes, so the
 * switch is a plain `<Link>` to the same path under the other prefix — which
 * also means it works before hydration and gets prefetched.
 *
 * The name of the target language is written in that language (a dictionary
 * value, not a lookup): someone who cannot read the current translation should
 * still recognise the one they want. The pill carries the code only, because
 * the header has no room for a language name on a phone; the menu row spells
 * it out.
 */
export function LanguageSwitch({
  locale,
  ui,
  currentPath = "/",
  variant = "pill",
  onNavigate,
}: LanguageSwitchProps) {
  const otherLocale: Locale = locale === "id" ? "en" : "id";
  const otherLanguageName = ui.languageSwitchHint;
  const actionLabel = formatTemplate(ui.languageSwitchTemplate, {
    language: otherLanguageName,
  });

  if (variant === "menuRow") {
    return (
      <Link
        href={localizedPath(otherLocale, currentPath)}
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
          {otherLocale}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={localizedPath(otherLocale, currentPath)}
      onClick={onNavigate}
      aria-label={actionLabel}
      title={actionLabel}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-line bg-panel/60 px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
    >
      {otherLocale}
    </Link>
  );
}
