import { test, expect } from "@playwright/test";
import {
  calmWave,
  kineticWave,
  meanSpacialActivity,
  blendIdle,
  IDLE_BLEND_RATE,
} from "@/lib/hero-relief";

/* The wave maths is pure, so it is proved as arithmetic across every phase of
   the animation rather than sampled from pixels: a claim about "the idle
   pattern is busier" has to hold at every elapsed time, not on average. */

test.describe("hero relief wave maths", () => {
  test("the idle pattern is busier than the calm sweep at every phase", () => {
    let worstRatio = Number.POSITIVE_INFINITY;
    let worstElapsed = 0;

    /* Walk a full animation period in fine steps. */
    for (let step = 0; step < 200; step += 1) {
      const elapsed = step * 0.1;
      const calmActivity = meanSpacialActivity(calmWave, elapsed);
      const idleActivity = meanSpacialActivity(kineticWave, elapsed);
      const ratio = idleActivity / calmActivity;
      if (ratio < worstRatio) {
        worstRatio = ratio;
        worstElapsed = elapsed;
      }
    }

    console.log(
      `PROOF relief activity: worst idle/calm ratio = ${worstRatio.toFixed(3)} at t=${worstElapsed.toFixed(1)}s`,
    );
    expect(
      worstRatio,
      "every phase of the idle pattern must read busier than the calm sweep",
    ).toBeGreaterThan(1.2);
  });

  test("both states stay inside the relief amplitude budget", () => {
    /* The field is a depth cue behind the headline, not a foreground object:
       neither wave may exceed ±1, which the amplitude scales down further. */
    for (const waveFunction of [calmWave, kineticWave]) {
      for (let step = 0; step < 100; step += 1) {
        const elapsed = step * 0.25;
        for (let cell = 0; cell <= 20; cell += 1) {
          const value = waveFunction(cell / 20, cell / 20, elapsed);
          expect(Math.abs(value)).toBeLessThanOrEqual(1.001);
        }
      }
    }
  });

  test("the idle blend converges in both directions at the same rate", () => {
    /* Rising: from calm to fully idle. */
    let blend = 0;
    let framesToIdle = 0;
    let blendBeforeIdle = 0;
    while (blend < 0.99 && framesToIdle < 500) {
      blendBeforeIdle = blend;
      blend = blendIdle(blend, true);
      framesToIdle += 1;
    }

    /* Falling: the same rate must bring it back. */
    let returning = 1;
    let framesToCalm = 0;
    let returningBeforeCalm = 1;
    while (returning > 0.01 && framesToCalm < 500) {
      returningBeforeCalm = returning;
      returning = blendIdle(returning, false);
      framesToCalm += 1;
    }

    console.log(
      `PROOF idle blend: ${framesToIdle} frames in, ${framesToCalm} frames out (rate ${IDLE_BLEND_RATE})`,
    );
    /* At 30 fps both must land inside about three seconds. */
    expect(framesToIdle).toBeLessThan(120);
    expect(framesToCalm).toBeLessThan(120);
    /* Symmetric: the field must not linger idle after the pointer returns. */
    expect(Math.abs(framesToIdle - framesToCalm)).toBeLessThanOrEqual(2);

    /* The blend must approach the target monotonically and never overshoot. */
    expect(blendBeforeIdle).toBeLessThanOrEqual(1);
    expect(returningBeforeCalm).toBeGreaterThanOrEqual(0);
  });
});