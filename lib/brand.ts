/**
 * Brand constants that more than one file has to agree on.
 *
 * Both values used to be duplicated by hand — the canvas hexes in the viewport
 * metadata, the manifest and a comment in `globals.css`, and the storage key in
 * the pre-paint theme script and in `ThemeToggle`. Nothing tied the copies
 * together, so changing `--color-canvas` or renaming the key silently left one
 * of the two consumers behind. They live here now, and both sides import them.
 *
 * The hexes are the resolved sRGB values of `--color-canvas` in each scheme.
 * They were sampled in the browser (Chromium keeps `oklch()` verbatim in
 * `getComputedStyle`, so the token has to paint onto a canvas before it can be
 * read) — re-sample with the same method if the token moves.
 */
export const canvasHex = {
  dark: "#050709",
  /* The light canvas is the "day paper" token `oklch(0.963 0.009 85)`,
     sampled through Chromium's own conversion — see the method note above. */
  light: "#f5f2ec",
} as const;

/** The `localStorage` key holding the visitor's explicit theme choice. */
export const themeStorageKey = "portfolio-theme";
