"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor label — a small pill that trails the pointer while it is over a
 * project row, reading "View" (or its locale equivalent). It replaces the
 * generic halo: one contextual affordance instead of ambient glow.
 *
 * Desktop pointer devices only, inert under reduced motion. Position is one
 * `translate3d` write per frame; the element never touches layout, and the
 * label text arrives from the dictionary, not from this component.
 */
export function CursorLabel({ label }: { label: string }) {
  const labelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!hoverCapable.matches || reducedMotion.matches) return;

    const labelElement = labelRef.current;
    if (!labelElement) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId: number | null = null;

    const stepLabel = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      labelElement.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;
      const arrived =
        Math.abs(targetX - currentX) < 0.3 && Math.abs(targetY - currentY) < 0.3;
      frameId = arrived ? null : window.requestAnimationFrame(stepLabel);
    };

    const scheduleLabel = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(stepLabel);
    };

    const followPointer = (pointerEvent: PointerEvent) => {
      targetX = pointerEvent.clientX + 16;
      targetY = pointerEvent.clientY + 16;
      scheduleLabel();
    };

    /* Visibility is driven by the row's hover state through a data attribute,
       so the label never shows over text the pointer is merely passing. */
    const showWhenOverRow = (pointerEvent: PointerEvent) => {
      const target = pointerEvent.target;
      const overRow =
        target instanceof Element && target.closest("[data-cursor-label]") !== null;
      labelElement.dataset.visible = overRow ? "true" : "false";
    };

    window.addEventListener("pointermove", followPointer, { passive: true });
    window.addEventListener("pointermove", showWhenOverRow, { passive: true });
    return () => {
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("pointermove", showWhenOverRow);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={labelRef}
      aria-hidden="true"
      data-visible="false"
      className="cursor-label"
    >
      {label}
    </div>
  );
}
