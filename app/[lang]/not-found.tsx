import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { NotFoundView, type NotFoundCopy } from "@/components/not-found-view";

/**
 * Localised 404 boundary for the `[lang]` segment.
 *
 * Next renders a not-found boundary from an error shell: the response carries
 * the 404 status and the layout's metadata, and this component travels in the
 * RSC payload and hydrates into the full document (lang, font variables, theme
 * script).
 *
 * This file must stay free of dynamic APIs. `headers()`/`cookies()` here would
 * not only make the 404 dynamic — it would opt the whole `[lang]` subtree into
 * dynamic rendering, because the boundary is part of that segment's route
 * module. Measured on this repo: with `headers()` 10 routes are prerendered and
 * no `en.html`/`id.html` is written; without it, 24 routes are, the HTML is
 * cacheable, and `canonical`/`hreflang`/`og:*` stay inside `<head>`. The locale
 * is therefore resolved from the path in `NotFoundView` instead.
 *
 * Both dictionaries are read here, on the server, and only the narrow slice
 * each locale needs crosses into the client component — the boundary cannot
 * know which one will be used until it sees the URL.
 */
function buildCopy(locale: Locale): NotFoundCopy {
  const content = getContent(locale);
  const labels = content.ui.notFound;

  return {
    locale,
    skipLabel: content.ui.skipToContent,
    brandAriaLabel: `${content.site.name} — ${labels.back}`,
    siteName: content.site.name,
    initials: content.site.initials,
    languageSwitchUi: {
      languageSwitchTemplate: content.ui.languageSwitchTemplate,
      languageSwitchHint: content.ui.languageSwitchHint,
    },
    themeLabels: {
      themeToggleTemplate: content.ui.themeToggleTemplate,
      themeSystem: content.ui.themeSystem,
      themeLight: content.ui.themeLight,
      themeDark: content.ui.themeDark,
      themeHint: content.ui.themeHint,
    },
    notFound: labels,
    copyrightTemplate: content.footer.copyrightTemplate,
    /* Fixed at build time, exactly like the footer's; `CopyrightLine` corrects
       it after mount when the calendar has moved past the build year. */
    buildYear: new Date().getFullYear(),
  };
}

export default function NotFound() {
  return (
    <NotFoundView
      copy={{
        en: buildCopy("en"),
        id: buildCopy("id"),
        /* Placeholder copy until the Japanese dictionary ships; the strings
           resolve from `lib/content/ja.ts` exactly like the pages do. */
        ja: buildCopy("ja"),
      }}
    />
  );
}
