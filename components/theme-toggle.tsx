"use client";

import { useCallback, useEffect, useState } from "react";
import { formatTemplate, type PortfolioContent } from "@/lib/content";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

/**
 * Every string the toggle can show, taken straight from the dictionary's `ui`
 * block. The state names stay lowercase there so they read correctly inside
 * the label template ("Theme: system" / "Tema: sistem"); the pill capitalises
 * them in CSS, which is the one transformation that is the same in both
 * languages.
 */
export type ThemeToggleLabels = Pick<
  PortfolioContent["ui"],
  | "themeToggleTemplate"
  | "themeSystem"
  | "themeLight"
  | "themeDark"
  | "themeHint"
>;

/** Which dictionary key names each state, so the labels stay data. */
const stateLabelKey: Record<
  Theme,
  "themeSystem" | "themeLight" | "themeDark"
> = {
  system: "themeSystem",
  light: "themeLight",
  dark: "themeDark",
};

const STORAGE_KEY = "portfolio-theme";
const MANAGED_THEME_COLOR_ID = "theme-color-managed";

/** Chromium keeps `oklch()` verbatim in getComputedStyle, so the token has to
 *  paint onto a canvas before its sRGB value can be read — the same sampling
 *  the viewport metadata hexes were derived with. */
function readCanvasHex(): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const canvasToken = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-canvas")
    .trim();
  if (!canvasToken) return null;
  context.fillStyle = canvasToken;
  context.fillRect(0, 0, 1, 1);
  /* `noUncheckedIndexedAccess` types every slot as possibly undefined, so the
     channels carry explicit zero defaults. */
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function resolveSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function nextInCycle(currentTheme: Theme): Theme {
  return currentTheme === "system"
    ? "light"
    : currentTheme === "light"
      ? "dark"
      : "system";
}

/**
 * Applies the theme to the document.
 *
 * `data-theme` carries the resolved palette (what the stylesheet reads);
 * `data-theme-preference` keeps the tri-state choice visible for debugging.
 * A runtime `theme-color` meta is appended last so the manual choice also
 * repaints the mobile browser chrome — the static media-scoped metas in the
 * layout can only follow the system preference.
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const resolved = theme === "system" ? resolveSystemTheme() : theme;
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-preference", theme);

  let chromeMeta = document.getElementById(
    MANAGED_THEME_COLOR_ID,
  ) as HTMLMetaElement | null;
  if (!chromeMeta) {
    chromeMeta = document.createElement("meta");
    chromeMeta.id = MANAGED_THEME_COLOR_ID;
    chromeMeta.name = "theme-color";
    document.head.appendChild(chromeMeta);
  }
  const canvasHex = readCanvasHex();
  if (canvasHex) chromeMeta.content = canvasHex;
}

export function ThemeToggle({ labels }: { labels: ThemeToggleLabels }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  /* Only stable references (module functions and setState) are touched, so
     the callback never needs to be re-created. */
  const cycleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = nextInCycle(currentTheme);
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    const initialTheme = readStoredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystemChange = () => {
      if (readStoredTheme() === "system") applyTheme("system");
    };
    systemTheme.addEventListener("change", followSystemChange);

    /* Ctrl/Cmd+Shift+L rather than the usual T: browsers reserve
       Ctrl+Shift+T for "reopen closed tab" and never deliver it to the
       page, so a T-chord here would silently do nothing. */
    const handleKeyboardShortcut = (keyboardEvent: KeyboardEvent) => {
      const isChordPress =
        (keyboardEvent.ctrlKey || keyboardEvent.metaKey) &&
        keyboardEvent.shiftKey &&
        keyboardEvent.key.toLowerCase() === "l";
      if (!isChordPress) return;
      keyboardEvent.preventDefault();
      cycleTheme();
    };
    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      systemTheme.removeEventListener("change", followSystemChange);
      window.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, [cycleTheme]);

  /* Before mount the document follows the system preference, so that is the
     honest state to render — and it is stable, so the button does not change
     width under the pointer on hydration. */
  const labelKey = stateLabelKey[mounted ? theme : "system"];
  const currentThemeLabel = formatTemplate(labels.themeToggleTemplate, {
    state: labels[labelKey],
  });

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-full border border-line bg-panel/60 px-2 text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink sm:px-2.5"
      aria-label={currentThemeLabel}
      title={`${currentThemeLabel} — ${labels.themeHint}`}
    >
      {!mounted ? (
        /* Same box as the icons below, so the first paint cannot shift. */
        <span aria-hidden="true" className="h-3.5 w-3.5" />
      ) : theme === "system" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      ) : theme === "light" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span className="hidden text-xs capitalize sm:inline">
        {labels[labelKey]}
      </span>
    </button>
  );
}
