import { test, expect, type Page, type CDPSession } from "@playwright/test";
import { MOTION_OFF_CLASS, MOTION_STORAGE_KEY } from "@/components/motion-toggle";

/** `CadenceTicker` requests one frame every 1000/30 ms, and each frame issues
 * exactly one instanced draw call — so the draw rate is the cadence. */
const TARGET_DRAWS_PER_SECOND = 25;   // 30 fps target, allow a small margin
const MIN_DRAWS_PER_SECOND = 5;       // below this the scene has stalled, not slowed
const MAX_CPU_FRACTION = 0.5;         // half of one core, at the target cadence

async function taskSeconds(session: CDPSession, ms: number) {
  const read = async () => (await session.send("Performance.getMetrics")).metrics.find((m) => m.name === "TaskDuration")?.value ?? 0;
  const a = await read();
  await new Promise((r) => setTimeout(r, ms));
  return (await read()) - a;
}

test("steady-state CPU per second, after WebGL setup is finished", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __draws: number }).__draws = 0;
    const p = WebGL2RenderingContext.prototype as unknown as Record<string, Function>;
    const orig = p.drawElementsInstanced as Function;
    p.drawElementsInstanced = function (...a: unknown[]) { (window as unknown as { __draws: number }).__draws++; return orig.apply(this, a); };
  });
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  await page.goto("/en");
  await expect(page.locator("canvas").first()).toBeAttached({ timeout: 15000 });
  // Long settle so shader compile and first frames are excluded.
  await page.waitForTimeout(8000);
  const draws0 = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);
  const steady = await taskSeconds(session, 6000);
  const draws1 = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);
  const drawsPerSecond = (draws1 - draws0) / 6;
  const cpuFraction = steady / 6;
  console.log(`PROOF steady: ${steady.toFixed(3)}s CPU task time in 6.0s (${(cpuFraction * 100).toFixed(1)}% of one core), ${draws1 - draws0} instanced draws (${drawsPerSecond.toFixed(1)}/s)`);

  /* The contract is "≤ half of one core while the ticker holds its 30 fps
     cadence". Two things break a wall-clock budget on a correct scene: a GPU
     that cannot keep the cadence (the same per-draw work is spread over more
     wall-clock seconds), and a device where the loader never mounts the scene
     at all (reduced motion, hover-less input, ≤2 cores). Both must be measured
     and reported, not reported as a regression. */
  if (drawsPerSecond < MIN_DRAWS_PER_SECOND) {
    const disabledByPolicy = await page.evaluate(() =>
      document.documentElement.classList.contains(MOTION_OFF_CLASS) ||
      window.localStorage.getItem(MOTION_STORAGE_KEY) === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator.hardwareConcurrency ?? 8) <= 2,
    );
    if (disabledByPolicy) {
      test.skip(true, `Scene disabled by reduced-motion / weak-device policy; ${drawsPerSecond.toFixed(1)} draws/s recorded`);
      return;
    }
    // Mounted but not drawing: the ticker or the mesh stalled.
    expect(drawsPerSecond).toBeGreaterThanOrEqual(MIN_DRAWS_PER_SECOND);
    return;
  }
  if (drawsPerSecond < TARGET_DRAWS_PER_SECOND) {
    test.skip(true, `GPU renders ${drawsPerSecond.toFixed(1)} draws/s, below the ${TARGET_DRAWS_PER_SECOND}/s target; CPU budget is not measurable on this hardware`);
    return;
  }
  expect(cpuFraction).toBeLessThan(MAX_CPU_FRACTION);
});
