import { describe, it, expect } from "vitest";
import {
  calmWave,
  kineticWave,
  blendIdle,
  meanSpacialActivity,
  FIELD_COLUMNS,
  FIELD_ROWS,
  IDLE_BLEND_RATE,
} from "./hero-relief";

describe("hero-relief", () => {
  describe("calmWave", () => {
    it("returns a number for valid inputs", () => {
      const result = calmWave(0.5, 0.5, 1.0);
      expect(typeof result).toBe("number");
      expect(Number.isFinite(result)).toBe(true);
    });

    it("produces different values for different positions", () => {
      const elapsed = 1.0;
      const wave1 = calmWave(0.0, 0.0, elapsed);
      const wave2 = calmWave(0.5, 0.5, elapsed);
      const wave3 = calmWave(1.0, 1.0, elapsed);

      expect(wave1).not.toBe(wave2);
      expect(wave2).not.toBe(wave3);
    });

    it("produces different values over time", () => {
      const x = 0.5;
      const y = 0.5;
      const wave1 = calmWave(x, y, 0.0);
      const wave2 = calmWave(x, y, 1.0);
      const wave3 = calmWave(x, y, 2.0);

      expect(wave1).not.toBe(wave2);
      expect(wave2).not.toBe(wave3);
    });

    it("stays within reasonable bounds", () => {
      for (let i = 0; i < 100; i++) {
        const x = Math.random();
        const y = Math.random();
        const elapsed = Math.random() * 10;
        const wave = calmWave(x, y, elapsed);

        expect(wave).toBeGreaterThanOrEqual(-2);
        expect(wave).toBeLessThanOrEqual(2);
      }
    });
  });

  describe("kineticWave", () => {
    it("returns a number for valid inputs", () => {
      const result = kineticWave(0.5, 0.5, 1.0);
      expect(typeof result).toBe("number");
      expect(Number.isFinite(result)).toBe(true);
    });

    it("produces different values for different positions", () => {
      const elapsed = 1.0;
      const wave1 = kineticWave(0.0, 0.0, elapsed);
      const wave2 = kineticWave(0.5, 0.5, elapsed);
      const wave3 = kineticWave(1.0, 1.0, elapsed);

      expect(wave1).not.toBe(wave2);
      expect(wave2).not.toBe(wave3);
    });

    it("produces different values over time", () => {
      const x = 0.5;
      const y = 0.5;
      const wave1 = kineticWave(x, y, 0.0);
      const wave2 = kineticWave(x, y, 1.0);
      const wave3 = kineticWave(x, y, 2.0);

      expect(wave1).not.toBe(wave2);
      expect(wave2).not.toBe(wave3);
    });

    it("stays within reasonable bounds", () => {
      for (let i = 0; i < 100; i++) {
        const x = Math.random();
        const y = Math.random();
        const elapsed = Math.random() * 10;
        const wave = kineticWave(x, y, elapsed);

        expect(wave).toBeGreaterThanOrEqual(-2);
        expect(wave).toBeLessThanOrEqual(2);
      }
    });

    it("has higher spatial frequency than calmWave", () => {
      const elapsed = 1.0;
      const calmActivity = meanSpacialActivity(calmWave, elapsed);
      const kineticActivity = meanSpacialActivity(kineticWave, elapsed);

      expect(kineticActivity).toBeGreaterThan(calmActivity);
    });
  });

  describe("blendIdle", () => {
    it("blends toward 1 when pointer is idle", () => {
      const result = blendIdle(0.0, true);
      expect(result).toBeGreaterThan(0.0);
      expect(result).toBeLessThan(1.0);
      expect(result).toBeCloseTo(IDLE_BLEND_RATE, 10);
    });

    it("blends toward 0 when pointer is not idle", () => {
      const result = blendIdle(1.0, false);
      expect(result).toBeLessThan(1.0);
      expect(result).toBeGreaterThan(0.0);
      expect(result).toBeCloseTo(1.0 - IDLE_BLEND_RATE, 10);
    });

    it("maintains current blend when already at target", () => {
      expect(blendIdle(1.0, true)).toBeCloseTo(1.0, 5);
      expect(blendIdle(0.0, false)).toBeCloseTo(0.0, 5);
    });

    it("converges toward target over multiple frames", () => {
      let blend = 0.0;
      for (let i = 0; i < 100; i++) {
        blend = blendIdle(blend, true);
      }
      expect(blend).toBeCloseTo(1.0, 1);

      blend = 1.0;
      for (let i = 0; i < 100; i++) {
        blend = blendIdle(blend, false);
      }
      expect(blend).toBeCloseTo(0.0, 1);
    });

    it("uses exponential smoothing", () => {
      const blend1 = blendIdle(0.5, true);
      const blend2 = blendIdle(blend1, true);
      const blend3 = blendIdle(blend2, true);

      const delta1 = blend1 - 0.5;
      const delta2 = blend2 - blend1;
      const delta3 = blend3 - blend2;

      expect(delta1).toBeGreaterThan(delta2);
      expect(delta2).toBeGreaterThan(delta3);
    });
  });

  describe("meanSpacialActivity", () => {
    it("returns a positive number", () => {
      const activity = meanSpacialActivity(calmWave, 1.0);
      expect(typeof activity).toBe("number");
      expect(activity).toBeGreaterThan(0);
    });

    it("measures calmWave activity", () => {
      const activity1 = meanSpacialActivity(calmWave, 0.0);
      const activity2 = meanSpacialActivity(calmWave, Math.PI);

      expect(activity1).toBeGreaterThan(0);
      expect(activity2).toBeGreaterThan(0);
    });

    it("measures kineticWave activity", () => {
      const activity1 = meanSpacialActivity(kineticWave, 0.0);
      const activity2 = meanSpacialActivity(kineticWave, Math.PI);

      expect(activity1).toBeGreaterThan(0);
      expect(activity2).toBeGreaterThan(0);
    });

    it("produces consistent results for same elapsed time", () => {
      const elapsed = 2.5;
      const activity1 = meanSpacialActivity(calmWave, elapsed);
      const activity2 = meanSpacialActivity(calmWave, elapsed);

      expect(activity1).toBe(activity2);
    });

    it("kineticWave consistently shows higher activity than calmWave", () => {
      const samples = 20;
      for (let i = 0; i < samples; i++) {
        const elapsed = (i / samples) * Math.PI * 2;
        const calmActivity = meanSpacialActivity(calmWave, elapsed);
        const kineticActivity = meanSpacialActivity(kineticWave, elapsed);

        expect(kineticActivity).toBeGreaterThan(calmActivity);
      }
    });

    it("handles edge case at time zero", () => {
      const activity = meanSpacialActivity(calmWave, 0.0);
      expect(activity).toBeGreaterThan(0);
      expect(Number.isFinite(activity)).toBe(true);
    });
  });

  describe("wave function integration", () => {
    it("blending between calm and kinetic produces intermediate values", () => {
      const x = 0.5;
      const y = 0.5;
      const elapsed = 1.0;

      const calm = calmWave(x, y, elapsed);
      const kinetic = kineticWave(x, y, elapsed);
      const blend = 0.5;

      const interpolated = calm * (1 - blend) + kinetic * blend;

      expect(Math.abs(interpolated - calm)).toBeLessThan(Math.abs(kinetic - calm));
      expect(Math.abs(interpolated - kinetic)).toBeLessThan(Math.abs(kinetic - calm));
    });

    it("grid dimensions are positive integers", () => {
      expect(FIELD_COLUMNS).toBeGreaterThan(0);
      expect(FIELD_ROWS).toBeGreaterThan(0);
      expect(Number.isInteger(FIELD_COLUMNS)).toBe(true);
      expect(Number.isInteger(FIELD_ROWS)).toBe(true);
    });

    it("idle blend rate is between 0 and 1", () => {
      expect(IDLE_BLEND_RATE).toBeGreaterThan(0);
      expect(IDLE_BLEND_RATE).toBeLessThan(1);
    });
  });
});
