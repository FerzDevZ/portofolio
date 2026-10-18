/* ------------------------------------------------------------------ */
/* The relief field's palette, read from the live theme tokens.        */
/*                                                                     */
/* The cubes used to be a hard-coded slate (#3a4152). That measured    */
/* 9.25:1 against the light canvas but only 1.98:1 against the dark    */
/* one, so on the dark theme — the default — the whole 3D layer read   */
/* as faint noise instead of a relief. Reading the tokens instead      */
/* keeps the field equally legible in both themes, and means the       */
/* scene re-colours the moment the visitor switches theme.             */
/* ------------------------------------------------------------------ */

import * as THREE from "three";

/** sRGB channels from an `oklch(...)` custom property, via a 1×1 canvas. */
function readTokenChannels(tokenName: string, fallback: string): string {
  const rawToken = getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();
  if (!rawToken) return fallback;

  try {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const context = probe.getContext("2d");
    if (!context) return fallback;
    /* Chromium keeps `oklch()` verbatim in getComputedStyle, so the value has
       to be painted before its sRGB channels can be read back. */
    context.fillStyle = rawToken;
    context.fillRect(0, 0, 1, 1);
    const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
    return `#${[red, green, blue].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return fallback;
  }
}

export type ReliefPalette = {
  cubeColor: THREE.Color;
  emissiveColor: THREE.Color;
  lightIntensity: number;
  ambientIntensity: number;
};

/**
 * Builds the palette for the current theme.
 *
 * The cube tone is derived from `--color-raised` (the theme's own "lifted
 * surface" step) nudged brighter, so the field sits a clear step above the
 * canvas in either theme rather than being pinned to one theme's value. The
 * key light also strengthens on the dark theme, where a flat directional
 * light leaves the box faces nearly identical.
 */
export function readReliefPalette(): ReliefPalette {
  const isLightTheme =
    document.documentElement.getAttribute("data-theme") === "light";

  const raisedChannels = readTokenChannels(
    "--color-raised",
    isLightTheme ? "#ffffff" : "#2b3341",
  );

  const cubeColor = new THREE.Color(raisedChannels);
  /* `ambientLight` multiplies the material colour, so the base has to sit well
     above the surface token for the rendered cubes to land near the target.
     These multipliers were tuned against rendered pixels, not theory: the
     dark-theme target is roughly rgb(92,97,106), which measures about 3:1
     against the canvas — visible as an object rather than as texture. */
  const lift = isLightTheme ? 1.0 : 3.1;
  cubeColor.multiplyScalar(lift);
  cubeColor.offsetHSL(0, 0, isLightTheme ? 0 : 0.02);

  const emissiveChannels = readTokenChannels(
    "--color-accent",
    isLightTheme ? "#2b5fa8" : "#5b8fd6",
  );
  const emissiveColor = new THREE.Color(emissiveChannels).multiplyScalar(0.18);

  return {
    cubeColor,
    emissiveColor,
    /* The key light has to carry most of the shading on a near-black canvas,
       where a modest ambient leaves the box faces indistinguishable. */
    lightIntensity: isLightTheme ? 0.75 : 1.35,
    ambientIntensity: isLightTheme ? 0.6 : 1.15,
  };
}

/** Watches `data-theme` on <html> and calls back whenever it changes. */
export function watchThemeChanges(onThemeChange: () => void): () => void {
  const themeObserver = new MutationObserver(onThemeChange);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => themeObserver.disconnect();
}