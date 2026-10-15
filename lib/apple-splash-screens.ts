/**
 * iOS launch images, in two appearances.
 *
 * iOS picks a startup image by matching a media query against the exact
 * viewport and pixel ratio of the device that is launching the app, so every
 * supported size needs its own PNG, in both palettes. These entries mirror the
 * assets generated in `public/splash` — add a device here and regenerate the
 * artwork with `python3 scripts/generate-splash.py`.
 *
 * ## Why the light entries come first
 *
 * Two facts about iOS decide the order, and both are easy to get wrong:
 *
 * 1. An unmatched media query is not "the first entry" — per Media Queries
 *    Level 4, an unrecognised feature makes the whole query `not all`, which
 *    matches nothing. If every entry carried `(prefers-color-scheme: light)`,
 *    a device that does not evaluate that feature would match none of them and
 *    launch on a white screen (web.dev documents the white-screen fallback).
 *    So the plain entries below must stay, unconditionally, as the catch-all.
 *
 * 2. Selection happens when the app is installed, not on every launch. WebKit
 *    bug 259328 reports that the startup image chosen at install is kept after
 *    the system appearance changes, so a reader who switches to light mode
 *    later keeps the splash they installed with. That is a WebKit limitation,
 *    not something these tags can work around.
 *
 * Given a light query and a plain entry that both match, which one iOS takes is
 * not documented. Light-first is the order that degrades safely either way: if
 * the first match wins, the light variant is used; if the most specific or the
 * last match were to win, the fallback is today's dark splash rather than a
 * missing one.
 */
type SplashDevice = {
  cssWidth: number;
  cssHeight: number;
  devicePixelRatio: number;
};

const splashDevices: SplashDevice[] = [
  // iPhone
  { cssWidth: 320, cssHeight: 568, devicePixelRatio: 2 },
  { cssWidth: 375, cssHeight: 667, devicePixelRatio: 2 },
  { cssWidth: 375, cssHeight: 812, devicePixelRatio: 3 },
  { cssWidth: 390, cssHeight: 844, devicePixelRatio: 3 },
  { cssWidth: 393, cssHeight: 852, devicePixelRatio: 3 },
  { cssWidth: 402, cssHeight: 874, devicePixelRatio: 3 },
  { cssWidth: 414, cssHeight: 736, devicePixelRatio: 3 },
  { cssWidth: 414, cssHeight: 896, devicePixelRatio: 2 },
  { cssWidth: 414, cssHeight: 896, devicePixelRatio: 3 },
  { cssWidth: 428, cssHeight: 926, devicePixelRatio: 3 },
  { cssWidth: 430, cssHeight: 932, devicePixelRatio: 3 },
  { cssWidth: 440, cssHeight: 956, devicePixelRatio: 3 },
  // iPad
  { cssWidth: 744, cssHeight: 1133, devicePixelRatio: 2 },
  { cssWidth: 768, cssHeight: 1024, devicePixelRatio: 2 },
  { cssWidth: 810, cssHeight: 1080, devicePixelRatio: 2 },
  { cssWidth: 820, cssHeight: 1180, devicePixelRatio: 2 },
  { cssWidth: 834, cssHeight: 1112, devicePixelRatio: 2 },
  { cssWidth: 834, cssHeight: 1194, devicePixelRatio: 2 },
  { cssWidth: 1024, cssHeight: 1366, devicePixelRatio: 2 },
  { cssWidth: 1032, cssHeight: 1376, devicePixelRatio: 2 },
];

export type SplashScreen = {
  href: string;
  media: string;
};

function buildSplashScreens(
  palette: "dark" | "light",
  appearanceQuery: string | null,
): SplashScreen[] {
  return splashDevices.map(({ cssWidth, cssHeight, devicePixelRatio }) => ({
    // The dark artwork keeps its original file name: it is the one every
    // already-installed home screen already references.
    href: `/splash/apple-splash-${
      palette === "light" ? "light-" : ""
    }${cssWidth * devicePixelRatio}x${cssHeight * devicePixelRatio}.png`,
    media: [
      "screen",
      `(device-width: ${cssWidth}px)`,
      `(device-height: ${cssHeight}px)`,
      `(-webkit-device-pixel-ratio: ${devicePixelRatio})`,
      "(orientation: portrait)",
      ...(appearanceQuery === null ? [] : [appearanceQuery]),
    ].join(" and "),
  }));
}

export const appleSplashScreens: SplashScreen[] = [
  ...buildSplashScreens("light", "(prefers-color-scheme: light)"),
  ...buildSplashScreens("dark", null),
];
