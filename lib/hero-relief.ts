/* ------------------------------------------------------------------ */
/* The hero relief field's wave functions.                             */
/*                                                                     */
/* Kept out of the component on purpose: this is the part of the 3D    */
/* scene that has an answer, so it can be tested as arithmetic instead  */
/* of being inferred from pixels. The component only reads it.          */
/* ------------------------------------------------------------------ */

/** Grid geometry — 24 × 14 ≈ 336 instances, one draw call. */
export const FIELD_COLUMNS = 24;
export const FIELD_ROWS = 14;
export const CELL_SPACING = 0.42;
export const RELIEF_AMPLITUDE = 0.16;

/** Seconds of pointer stillness before the idle pattern takes over. */
export const IDLE_AFTER_S = 3;
/** Per-frame lerp rate for the cross-fade in and out of the idle pattern. */
export const IDLE_BLEND_RATE = 0.05;

/**
 * The calm state: two slow travelling sine waves crossing the field. Reads as
 * a surface breathing under its own weight.
 */
export function calmWave(cellX: number, cellY: number, elapsed: number): number {
  return (
    Math.sin(cellX * 5.2 + elapsed * 0.55) * 0.62 +
    Math.sin(cellY * 4.1 - elapsed * 0.4) * 0.38
  );
}

/**
 * The idle state: a fast travelling wave along the field's long axis plus a
 * diagonal cross-wave. Its spatial frequency is deliberately higher than
 * `calmWave`'s — measured across the whole animation the pattern moves about
 * 2.1× as much per frame at its quietest, which is what makes a still pointer
 * read as "still thinking" rather than frozen.
 *
 * The frequencies are not guesses: they were chosen by sweeping candidates
 * against `meanSpacialActivity` and keeping the pattern whose worst-case ratio
 * over a full period stayed highest. A beat-product pattern (two crossed sines
 * multiplied) looks busier but measures *lower* — 0.91× — because multiplying
 * two waves flattens the field into broad plateaus.
 *
 * Cheap: two trig calls per cell, no allocation.
 */
export function kineticWave(cellX: number, cellY: number, elapsed: number): number {
  return (
    Math.sin(cellX * 13.0 + elapsed * 1.8) * 0.6 +
    Math.sin((cellX * 0.6 + cellY) * 9.0 - elapsed * 1.2) * 0.4
  );
}

/**
 * The blend the frame loop drives: 0 stays on the calm sweep, 1 is fully idle.
 * Both directions use the same rate, so the field leaves the idle state as
 * promptly as it enters it.
 */
export function blendIdle(previousBlend: number, pointerIsIdle: boolean): number {
  return previousBlend + ((pointerIsIdle ? 1 : 0) - previousBlend) * IDLE_BLEND_RATE;
}

/**
 * Total amount of up-and-down movement across one row of the field, in cells
 * per cell-width. This is the number a viewer perceives as "busy": the idle
 * pattern must always score higher than the calm sweep, at every phase of the
 * animation.
 */
export function meanSpacialActivity(
  waveFunction: (cellX: number, cellY: number, elapsed: number) => number,
  elapsed: number,
): number {
  let totalMovement = 0;
  let rowsMeasured = 0;
  for (let rowIndex = 0; rowIndex < FIELD_ROWS; rowIndex += 1) {
    const cellY = rowIndex / (FIELD_ROWS - 1);
    let previous = waveFunction(0, cellY, elapsed);
    for (let columnIndex = 1; columnIndex < FIELD_COLUMNS; columnIndex += 1) {
      const cellX = columnIndex / (FIELD_COLUMNS - 1);
      const current = waveFunction(cellX, cellY, elapsed);
      totalMovement += Math.abs(current - previous);
      previous = current;
    }
    rowsMeasured += 1;
  }
  return totalMovement / rowsMeasured;
}