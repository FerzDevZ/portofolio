import { test, expect, type Page } from "@playwright/test";

/* Permanent proof for the hero relief's palette.
 *
 * The scene used to paint its cubes a hard-coded slate (#3a4152), which
 * measured 9.25:1 against the light canvas but only 1.98:1 against the dark
 * one — on the default (dark) theme the whole 3D layer read as faint noise
 * instead of a relief. It now derives its colours from the live theme tokens
 * in `lib/relief-palette.ts`, so both themes stay legible and a theme switch
 * re-colours the field in place.
 *
 * Two promises follow, and both are asserted from the rendered page rather
 * than from the source, because a colour picked from the code says nothing
 * about what the lighting actually bakes onto the cubes:
 *
 *   1. the rendered relief clears a contrast floor against the canvas in BOTH
 *      themes, and
 *   2. flipping `data-theme` while the scene is mounted changes the cubes'
 *      own tone, proving the scene re-reads the tokens instead of freezing on
 *      the palette it mounted with. */

/** The strip of the canvas that samples the relief itself in both themes and
 *  at both viewports.
 *
 *  Measured, not assumed. The hero canvas is 1440×931 CSS px on desktop but
 *  320×1416 on a 320px phone, so one fractional window lands on different
 *  content in each. The previous window (x 21–51%, y 85–97%) held the relief
 *  on desktop and the scrolling stack marquee at 320px, where its object
 *  sample collapsed to ~5% of the strip and read anywhere between 1.31 and
 *  2.17 from frame to frame — it was measuring moving copy, not the cubes.
 *  This window reads 2.16–2.17 in all four combinations, with 16–37% of its
 *  pixels differing from the modal background (the cube faces) and the canvas
 *  as that background. */
const RELIEF_STRIP = { x0: 0.05, x1: 0.3, y0: 0.88, y1: 1 };

const VIEWPORT = (project: string) =>
  project === "mobile-320" ? { width: 320, height: 640 } : { width: 1440, height: 900 };

/** Contrast ratio between two `#rrggbb` tones, over relative luminance. */
function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lumaA = relativeLuminance(hexA);
  const lumaB = relativeLuminance(hexB);
  const [higher, lower] = lumaA >= lumaB ? [lumaA, lumaB] : [lumaB, lumaA];
  return (higher + 0.05) / (lower + 0.05);
}

/** Reads the resolved sRGB hex of an `oklch(...)` token through the browser's
 *  own colour conversion — Chromium keeps `oklch()` verbatim in
 *  `getComputedStyle`, so the token has to be painted before its channels can
 *  be read back. */
async function readTokenHex(page: Page, tokenName: string): Promise<string> {
  return page.evaluate((token) => {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const context = probe.getContext("2d");
    if (!context) throw new Error("2d context unavailable");
    context.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    context.fillRect(0, 0, 1, 1);
    const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
    return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }, tokenName);
}

/** Statistics of one canvas strip, decoded inside the page (screenshot buffer
 *  -> Image -> 2D canvas -> getImageData) so no PNG decoder is needed in
 *  Node, and the same bucketing the old probe used. */
type StripStats = { bgL: string; objL: string; contrast: string };

async function stripStats(page: Page, b64: string): Promise<StripStats> {
  /* Playwright hands the page function exactly ONE argument, so the screenshot
     and the strip travel together as a single object: `(b64, strip) => …` is
     not a valid PageFunction and fails typecheck with TS2769 + TS7006. */
  return page.evaluate(
    ({ b64, strip }) =>
      new Promise<StripStats>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const cv = document.createElement("canvas");
          cv.width = img.naturalWidth;
          cv.height = img.naturalHeight;
          const ctx = cv.getContext("2d");
          if (!ctx) return reject(new Error("2d context unavailable"));
          ctx.drawImage(img, 0, 0);
          const { width, height } = cv;
          const data = ctx.getImageData(0, 0, width, height).data;

          const luma = (r: number, g: number, b: number) => {
            const lin = (c: number) => {
              const s = c / 255;
              return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          };

          const x0 = Math.round(strip.x0 * width);
          const y0 = Math.round(strip.y0 * height);
          const x1 = Math.round(strip.x1 * width);
          const y1 = Math.round(strip.y1 * height);

          const bucket = (r: number, g: number, b: number) => ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
          const buckets = new Map<number, number>();
          const channel = (index: number): number => data[index] ?? 0;
          const all: { r: number; g: number; b: number; l: number }[] = [];
          for (let y = y0; y < y1; y += 1) {
            for (let x = x0; x < x1; x += 1) {
              const i = (y * width + x) * 4;
              const r = channel(i), g = channel(i + 1), b = channel(i + 2);
              const sample = { r, g, b, l: luma(r, g, b) };
              all.push(sample);
              const key = bucket(r, g, b);
              buckets.set(key, (buckets.get(key) ?? 0) + 1);
            }
          }
          let modalKey = -1;
          let modalCount = 0;
          for (const [key, count] of buckets.entries()) {
            if (count > modalCount) { modalCount = count; modalKey = key; }
          }
          let sr = 0, sg = 0, sb = 0, sn = 0;
          for (const sample of all) {
            if (bucket(sample.r, sample.g, sample.b) === modalKey) { sr += sample.r; sg += sample.g; sb += sample.b; sn += 1; }
          }
          const bgL = sn ? luma(sr / sn, sg / sn, sb / sn) : 0;
          const objects = all.filter((sample) => Math.abs(sample.l - bgL) > 0.015);
          const sorted = objects.map((sample) => sample.l).sort((a, b) => a - b);
          const objL = sorted.length ? sorted[Math.floor(sorted.length / 2)] ?? bgL : bgL;
          const hi = Math.max(bgL, objL), lo = Math.min(bgL, objL);
          resolve({
            bgL: bgL.toFixed(4),
            objL: objL.toFixed(4),
            contrast: ((hi + 0.05) / (lo + 0.05)).toFixed(3),
          });
        };
        img.onerror = () => reject(new Error("failed to decode the screenshot"));
        img.src = "data:image/png;base64," + b64;
      }),
    { b64, strip: RELIEF_STRIP },
  );
}

/** The relief breathes: the idle wave moves the cubes, so a single frame
 *  captures one phase of the animation. Combined with the DOM copy painted
 *  over the canvas (the marquee, the headline), one frame can sample copy
 *  instead of the field — at 320px that once read 1.52. Sampling several
 *  frames across a wave period and keeping the WORST one makes the assertion
 *  independent of the phase the screenshot happens to catch. */
async function worstStripStats(page: Page, frames = 3, gapMs = 400): Promise<StripStats> {
  const samples: StripStats[] = [];
  for (let index = 0; index < frames; index += 1) {
    const shot = await page.locator("canvas").first().screenshot();
    samples.push(await stripStats(page, shot.toString("base64")));
    if (index < frames - 1) await page.waitForTimeout(gapMs);
  }
  return samples.reduce((worst, sample) =>
    Number(sample.contrast) < Number(worst.contrast) ? sample : worst,
  );
}

/** Waits until the relief canvas is actually mounted (dynamic import plus the
 *  idle callback the loader defers to). */
async function waitForReliefCanvas(page: Page) {
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 25_000 });
}

test.describe("hero relief palette", () => {
  for (const theme of ["dark", "light"] as const) {
    test(`the ${theme} relief renders cubes distinguishable from the canvas`, async ({ page }, testInfo) => {
      await page.setViewportSize(VIEWPORT(testInfo.project.name));
      await page.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);

      /* Relative: the suite's own webServer (playwright.config.ts) owns the
         port. A hard-coded host:port only passes on a machine where somebody
         started that server by hand, and fails in CI. */
      await page.goto("/en");
      await waitForReliefCanvas(page);
      /* The theme comes from the pre-paint script reading localStorage. If that
         script stops honouring the key, the page stays on the default palette
         and every number below would describe the dark theme while the test
         claims to prove the light one — green, and wrong. */
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.waitForTimeout(2_500);

      /* 3 frames across one wave period, worst contrast wins: the assertion
         must hold no matter which phase the screenshot lands in. */
      const stats = await worstStripStats(page);
      const canvasHex = await readTokenHex(page, "--color-canvas");
      const raisedHex = await readTokenHex(page, "--color-raised");

      console.log(
        `PROOF relief palette ${theme}: canvas=${canvasHex} raised=${raisedHex} strip bgL=${stats.bgL} objL=${stats.objL} contrast=${stats.contrast}`,
      );

      /* The hard-coded slate measured 1.98:1 against the dark canvas as a
         bare material, and the lighting it shipped with dimmed it further;
         1.80 sits below today's 2.16 rendering so a small re-tune stays green,
         but above what that slate would have produced when lit. */
      expect(Number(stats.contrast)).toBeGreaterThan(1.80);
      expect(stats.bgL).not.toBe(stats.objL);
    });
  }

  test("flipping the theme re-colours the mounted scene", async ({ page }, testInfo) => {
      await page.setViewportSize(VIEWPORT(testInfo.project.name));
      await page.addInitScript(() => localStorage.setItem("portfolio-theme", "dark"));

      /* Relative: the suite's own webServer (playwright.config.ts) owns the
         port. A hard-coded host:port only passes on a machine where somebody
         started that server by hand, and fails in CI. */
      await page.goto("/en");
      await waitForReliefCanvas(page);
      await page.waitForTimeout(2_500);

      const darkShot = await page.locator("canvas").first().screenshot();
      const darkStats = await stripStats(page, darkShot.toString("base64"));

      /* A live switch, exactly as the theme toggle performs it: the scene
         watches `data-theme` with a MutationObserver, so no reload or
         localStorage read must happen for the cubes to re-colour. */
      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
      await page.waitForTimeout(2_000);

      const lightShot = await page.locator("canvas").first().screenshot();
      const lightStats = await stripStats(page, lightShot.toString("base64"));

      console.log(
        `PROOF relief re-colour: strip objL ${darkStats.objL} -> ${lightStats.objL}`,
      );

      /* The cubes must change tone: a scene that froze on the dark palette
         would keep its old lit colour even though the DOM tokens flipped. */
      expect(Number(lightStats.objL)).not.toBeCloseTo(Number(darkStats.objL), 2);
      /* The light theme's cubes are the brighter of the two. */
      expect(Number(lightStats.objL)).toBeGreaterThan(Number(darkStats.objL));
      /* The canvas survived the switch rather than unmounting on re-render. */
      await expect(page.locator("canvas").first()).toBeVisible();
  });
});
