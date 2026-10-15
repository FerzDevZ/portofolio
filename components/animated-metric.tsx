"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Animated metric counter — the leading KPI ("61%", "3.2×", …) counts up the
 * first time it enters the viewport.
 *
 * Parse rules, deliberately conservative:
 * - Only numeric content animates ("61%", "3.2×", "12"); prose never does.
 * - The numeric part tweens in rAF with the site curve; any affix
 *   (%, ×, +) is preserved verbatim and re-attached after the tween.
 * - `tabular-nums` on the host keeps digit widths fixed, so the row does
 *   not jitter while the number rises.
 * - Under `prefers-reduced-motion` the final value is set immediately.
 * - Fires once (IO disconnects) — no replay on scroll-back, matching
 *   the reveal contract everywhere else on the site.
 */
export function AnimatedMetric({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const metricRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const metricElement = metricRef.current;
    if (!metricElement) return;

    /* Value grammar: optional leading sign, digits with one decimal dot,
       then any tail (% or suffix letters/×…). "61%", "3.2×", "12" animate;
       "Shipped" renders as plain text. */
    const numericMatch = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!numericMatch) return;

    const [, numericPart = "", affix = ""] = numericMatch;
    const target = Number(numericPart);
    const decimals = numericPart.includes(".")
      ? (numericPart.split(".")[1] ?? "").length
      : 0;

    /* Reduced motion: skip the tween entirely, paint the endpoint. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frameId: number | null = null;
    const startedAt = performance.now();
    const durationMs = 1100;

    const renderMetric = (progressRatio: number) => {
      /* Site curve: cubic-bezier(0.22, 0.7, 0.3, 1) approximated — fast
         start, long settle. Simpler than constructing an actual bezier:
         a cubic ease-out reads identically at this duration. */
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const current = target * eased;
      metricElement.textContent = `${current.toFixed(decimals)}${affix}`;
    };

    const tickCounter = (now: number) => {
      const progressRatio = Math.min((now - startedAt) / durationMs, 1);
      renderMetric(progressRatio);
      frameId =
        progressRatio < 1 ? window.requestAnimationFrame(tickCounter) : null;
    };

    const startCounter = () => {
      frameId = window.requestAnimationFrame(tickCounter);
    };

    const intersectionObserver = new IntersectionObserver(
      (observerEntries) => {
        for (const observerEntry of observerEntries) {
          if (observerEntry.isIntersecting) {
            startCounter();
            intersectionObserver.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );
    intersectionObserver.observe(metricElement);

    return () => {
      intersectionObserver.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      /* Final state on unmount, so an interrupted tween never freezes mid-
         number (navigation snapshot, HMR, tab close). */
      metricElement.textContent = value;
    };
  }, [value]);

  return (
    <span
      ref={metricRef}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {value}
    </span>
  );
}

/**
 * TiltPanel — pointer-tracked 3D tilt for the featured work panel. The
 * sibling of the certificate tilt, with depth layers: the inner grid slides
 * on `translateZ(-14px)` and the metric sinks forward on `+26px`, so
 * hover reads as a true diorama rather than one rotating plane.
 *
 * Uses CSS custom properties (--tilt-x / --tilt-y) written per pointer
 * move; the transform declarations live in CSS, so the component never
 * needs to serialise a transform string.
 */
export function TiltPanel({
  children,
  classNameWrapper = "",
}: {
  children: ReactNode;
  classNameWrapper?: string;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const panelElement = panelRef.current;
    if (!panelElement) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const readPanelPointer = (pointerEvent: PointerEvent) => {
      const panelRect = panelElement.getBoundingClientRect();
      const xRatio = (pointerEvent.clientX - panelRect.left) / panelRect.width;
      const yRatio = (pointerEvent.clientY - panelRect.top) / panelRect.height;
      const clampedX = Math.min(Math.max(xRatio, 0), 1);
      const clampedY = Math.min(Math.max(yRatio, 0), 1);

      panelElement.style.setProperty("--tilt-x", `${(0.5 - clampedY) * 4}`);
      panelElement.style.setProperty("--tilt-y", `${(clampedX - 0.5) * 6}`);
      panelElement.style.setProperty("--tilt-gx", `${(clampedX * 100).toFixed(1)}%`);
      panelElement.style.setProperty("--tilt-gy", `${(clampedY * 100).toFixed(1)}%`);
    };

    const resetPanelTilt = () => {
      panelElement.style.setProperty("--tilt-x", "0");
      panelElement.style.setProperty("--tilt-y", "0");
    };

    panelElement.addEventListener("pointermove", readPanelPointer, {
      passive: true,
    });
    panelElement.addEventListener("pointerleave", resetPanelTilt);
    return () => {
      panelElement.removeEventListener("pointermove", readPanelPointer);
      panelElement.removeEventListener("pointerleave", resetPanelTilt);
      resetPanelTilt();
    };
  }, []);

  return (
    <div ref={panelRef} className={`tilt-panel ${classNameWrapper}`}>
      {children}
    </div>
  );
}
