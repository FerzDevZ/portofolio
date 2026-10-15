import { test, expect, type Page, type CDPSession } from "@playwright/test";

/* Measured proof for the hero 3D scene. The page is instrumented before any
   site script runs: every WebGL draw call is counted, and the document's
   visibility can be driven by the test. Numbers come from the GPU command
   stream, not from the code. */

async function instrumentWebGL(page: Page) {
  await page.addInitScript(() => {
    const counters = {
      draws: 0,
      /* The relief field's z values, one entry per rendered frame — used to compare
         the calm sweep against the idle pattern. */
      fieldFrames: [] as number[][],
      /* |camera z| read from the view-projection matrix translation. */
      cameraDepth: null as number | null,
    };
    (window as unknown as { __gl: typeof counters }).__gl = counters;

    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      for (const method of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"] as const) {
        const original = (proto as unknown as Record<string, Function>)[method];
        if (typeof original !== "function") continue;
        (proto as unknown as Record<string, Function>)[method] = function (this: unknown, ...args: unknown[]) {
          counters.draws += 1;
          return original.apply(this, args);
        };
      }
    }

    /* The InstancedMesh uploads 336 × 16 floats; summing every z (offset 14)
       gives one number for the whole relief surface per frame. */
    const FIELD_FLOAT_COUNT = 336 * 16;
    const recordField = (data: Float32Array) => {
      const zValues: number[] = [];
      for (let index = 14; index < data.length; index += 16) zValues.push(data[index] ?? 0);
      counters.fieldFrames.push(zValues);
      if (counters.fieldFrames.length > 300) counters.fieldFrames.shift();
    };
    const originalBufferData = WebGL2RenderingContext.prototype.bufferData;
    WebGL2RenderingContext.prototype.bufferData = function (this: WebGL2RenderingContext, ...args: unknown[]) {
      const data = args[1];
      if (data instanceof Float32Array && data.length === FIELD_FLOAT_COUNT) recordField(data);
      return (originalBufferData as unknown as (...a: unknown[]) => unknown).apply(this, args);
    } as typeof originalBufferData;

    const originalBufferSubData = WebGL2RenderingContext.prototype.bufferSubData;
    WebGL2RenderingContext.prototype.bufferSubData = function (this: WebGL2RenderingContext, ...args: unknown[]) {
      const data = args[2];
      if (data instanceof Float32Array && data.length === FIELD_FLOAT_COUNT) recordField(data);
      return (originalBufferSubData as unknown as (...a: unknown[]) => unknown).apply(this, args);
    } as typeof originalBufferSubData;

    /* The camera position arrives as a 16-float matrix uniform. */
    const originalUniformMatrix4fv = WebGL2RenderingContext.prototype.uniformMatrix4fv;
    WebGL2RenderingContext.prototype.uniformMatrix4fv = function (
      this: WebGL2RenderingContext,
      ...args: unknown[]
    ) {
      const value = args[2];
      if (value instanceof Float32Array && value.length === 16) {
        const depth = Math.abs(value[14] ?? 0);
        /* Only projected z values are meaningful as a camera distance. */
        if (depth > 0) counters.cameraDepth = Number(depth.toFixed(6));
      }
      return (originalUniformMatrix4fv as unknown as (...a: unknown[]) => unknown).apply(this, args);
    } as typeof originalUniformMatrix4fv;
  });
}

async function drawsOver(page: Page, ms: number): Promise<number> {
  const before = await page.evaluate(() => (window as unknown as { __gl: { draws: number } }).__gl.draws);
  await page.waitForTimeout(ms);
  const after = await page.evaluate(() => (window as unknown as { __gl: { draws: number } }).__gl.draws);
  return after - before;
}

async function setHidden(page: Page, hidden: boolean) {
  await page.evaluate((value) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => value });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (value ? "hidden" : "visible") });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}

async function cpuTaskSeconds(session: CDPSession, ms: number): Promise<number> {
  const metric = async () => {
    const { metrics } = await session.send("Performance.getMetrics");
    return metrics.find((m) => m.name === "TaskDuration")?.value ?? 0;
  };
  const start = await metric();
  await new Promise((resolve) => setTimeout(resolve, ms));
  return (await metric()) - start;
}

test.describe("hero 3D scene: measured", () => {
  test("renders at a capped rate while visible", async ({ page }) => {
    await instrumentWebGL(page);
    await page.goto("/en");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(1500);

    const draws = await drawsOver(page, 4000);
    const perSecond = draws / 4;
    console.log(`PROOF visible: ${draws} draw calls in 4.0s = ${perSecond.toFixed(1)}/s`);
    // Capped at 30 fps by the ticker. Allow headroom for pointer-driven
    // invalidations; an uncapped loop renders at the display rate (60+).
    expect(perSecond).toBeLessThanOrEqual(40);
    expect(perSecond).toBeGreaterThan(5);
  });

  test("stops rendering while the tab is hidden, resumes when visible", async ({ page }) => {
    await instrumentWebGL(page);
    await page.goto("/en");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(1500);

    await setHidden(page, true);
    await page.waitForTimeout(300);
    const hiddenDraws = await drawsOver(page, 3000);
    console.log(`PROOF hidden: ${hiddenDraws} draw calls in 3.0s`);
    expect(hiddenDraws).toBeLessThanOrEqual(2);

    await setHidden(page, false);
    await page.waitForTimeout(500);
    const resumedDraws = await drawsOver(page, 2000);
    console.log(`PROOF resumed: ${resumedDraws} draw calls in 2.0s`);
    expect(resumedDraws).toBeGreaterThan(10);
  });

  test("CPU cost of the scene, motion on vs off", async ({ page }) => {
    await instrumentWebGL(page);
    const session = await page.context().newCDPSession(page);
    await session.send("Performance.enable");

    await page.goto("/en");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(2000);
    const onSeconds = await cpuTaskSeconds(session, 5000);

    await page.evaluate(() => window.localStorage.setItem("portfolio-3d-motion", "off"));
    await page.goto("/en");
    await page.waitForTimeout(2500);
    const canvasCount = await page.locator("canvas").count();
    const offSeconds = await cpuTaskSeconds(session, 5000);

    console.log(`PROOF cpu task time over 5s: motion on = ${onSeconds.toFixed(3)}s, motion off = ${offSeconds.toFixed(3)}s, canvases when off = ${canvasCount}`);
    expect(canvasCount).toBe(0);
    expect(onSeconds).toBeGreaterThan(offSeconds);
  });

  test("camera recedes as the hero scrolls away", async ({ page }) => {
    await instrumentWebGL(page);
    await page.goto("/en");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(6000);

    /* The scene is a camera-space render, so the first matrix uniform of the
       frame is the view-projection matrix; its translation column carries the
       camera position. Reading it proves the scroll coupling exists in the
       shipped bundle. */
    const cameraDepth = async () =>
      page.evaluate(() => {
        const gl = (window as unknown as { __gl: { cameraDepth: number | null } }).__gl;
        return gl.cameraDepth;
      });

    const atTop = await cameraDepth();
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.35));
    await page.waitForTimeout(3000);
    const partway = await cameraDepth();
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.8));
    await page.waitForTimeout(3000);
    const further = await cameraDepth();

    console.log(`PROOF camera |z|: top=${atTop} 0.35vh=${partway} 0.80vh=${further}`);
    expect(atTop).not.toBeNull();
    /* Monotonic: the relief must recede further the further the page travels. */
    expect(partway).toBeGreaterThan(atTop!);
    expect(further).toBeGreaterThan(partway!);
  });

  test("idle pointer switches the relief to its second pattern", async ({ page }) => {
    await instrumentWebGL(page);
    await page.goto("/en");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(6000);

    /* Spatial roughness: mean |Δz| between neighbouring cells in one frame.
       The exact shape of both patterns is proved as arithmetic in
       tests/hero-relief.spec.ts (worst-case ratio 2.09); this test proves the
       wiring — that the rendered field really does swap patterns once the
       pointer goes still. */
    const spatialRoughness = async () =>
      page.evaluate(() => {
        const frames = (window as unknown as { __gl: { fieldFrames: number[][] } }).__gl
          .fieldFrames;
        const frame = frames[frames.length - 1];
        if (!frame) return null;
        let totalStep = 0;
        for (let index = 1; index < frame.length; index += 1) {
          totalStep += Math.abs((frame[index] ?? 0) - (frame[index - 1] ?? 0));
        }
        return Number((totalStep / (frame.length - 1)).toFixed(6));
      });

    /* Force the calm state: sweeping the pointer resets the idle timer. */
    for (const position of [100, 200, 300, 400, 500]) {
      await page.mouse.move(position, 280);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(3500);
    const calmRoughness = await spatialRoughness();

    /* Past the 3s idle threshold plus the cross-fade. */
    await page.waitForTimeout(6000);
    const idleRoughness = await spatialRoughness();

    const ratio = (idleRoughness ?? 0) / (calmRoughness || 1);
    console.log(
      `PROOF relief roughness: calm=${calmRoughness} idle=${idleRoughness} ratio=${ratio.toFixed(3)}`,
    );
    expect(calmRoughness).toBeGreaterThan(0);
    expect(
      ratio,
      "the rendered field must switch to the busier idle pattern once the pointer stops",
    ).toBeGreaterThan(1.2);
  });
});
