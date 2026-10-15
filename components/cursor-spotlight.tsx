"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor halo — one soft radial blob that trails the pointer with lag,
 * Linear/Vercel-style. Desktop pointer devices only (never on touch), and
 * fully inert under `prefers-reduced-motion`.
 *
 * Rendering is a single `transform: translate3d` write per rAF frame on an
 * element that never touches layout: no reflow, one compositor surface.
 * Its opacity stays in the 4% range so it can never glare at text and never
 * hurts AA contrast — pure atmosphere.
 */
export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /* Gates, checked once per mount — a coarse pointer and a device that
       asks for less motion never get the listener at all. */
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!hoverCapable.matches || reducedMotion.matches) return;

    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    /* Target = the pointer; current = what the blob has caught up to.
       The gap between the two is what makes it trail rather than stick. */
    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let frameId: number | null = null;

    const stepSpotlight = () => {
      /* 0.14 lerp: about half a second to catch up, slow enough to read as
         a shadow, quick enough to never feel broken. */
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;

      spotlight.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;

      /* Keep only while the blob is still moving; when it has effectively
         arrived, stop ticking and wait for the next pointer event instead of
         burning rAF frames forever. */
      const arrived =
        Math.abs(targetX - currentX) < 0.4 && Math.abs(targetY - currentY) < 0.4;
      frameId = arrived ? null : window.requestAnimationFrame(stepSpotlight);
    };

    const scheduleSpotlight = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(stepSpotlight);
    };

    const readPointer = (pointerEvent: PointerEvent) => {
      targetX = pointerEvent.clientX;
      targetY = pointerEvent.clientY;
      scheduleSpotlight();
    };

    /* The element itself is centred on its own origin via CSS (a fixed-size
       halo with translate offsets), so the pointer coords go straight in. */
    window.addEventListener("pointermove", readPointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", readPointer);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      ref={spotlightRef}
      className="cursor-spotlight"
    />
  );
}

/**
 * Magnetic CTA — the button gently leans toward the pointer while it is
 * nearby, and springs back when it leaves. Best-effort decorative motion:
 * the anchor's role, hit area, and focus behaviour are untouched, and the
 * effect is only attached where both hover and fine pointers exist.
 */
export function MagneticAction({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const magnetRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const magnet = magnetRef.current;
    if (!magnet) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const maxPullPx = 6;

    /* Pointer proximity is sensed on the section around the button, so it
       starts leaning before the cursor is over its hit box. Parent is the
       hero action row. */
    const proximityZone = magnet.parentElement;
    if (!proximityZone) return;

    const readMagnetTarget = (pointerEvent: PointerEvent) => {
      const magnetRect = magnet.getBoundingClientRect();
      const zoneRect = proximityZone.getBoundingClientRect();
      const centerX = magnetRect.left + magnetRect.width / 2;
      const centerY = magnetRect.top + magnetRect.height / 2;

      const deltaX = pointerEvent.clientX - centerX;
      const deltaY = pointerEvent.clientY - centerY;

      /* Range gating: full strength at the button, tapering to nothing at
         the edge of the action row — no hard pop at the zone boundary. */
      const zoneRadius = Math.max(zoneRect.width / 2, 220);
      const distance = Math.hypot(deltaX, deltaY);
      if (distance > zoneRadius) {
        magnet.style.transform = "";
        return;
      }

      const falloff = 1 - Math.min(distance / zoneRadius, 1);
      const pullX = deltaX * 0.18 * falloff;
      const pullY = deltaY * 0.18 * falloff;

      const clampedPullX = Math.max(-maxPullPx, Math.min(maxPullPx, pullX));
      const clampedPullY = Math.max(-maxPullPx, Math.min(maxPullPx, pullY));

      magnet.style.transform = `translate3d(${clampedPullX.toFixed(1)}px, ${clampedPullY.toFixed(1)}px, 0)`;
    };

    const releaseMagnet = () => {
      magnet.style.transform = "";
    };

    proximityZone.addEventListener("pointermove", readMagnetTarget, {
      passive: true,
    });
    proximityZone.addEventListener("pointerleave", releaseMagnet);
    return () => {
      proximityZone.removeEventListener("pointermove", readMagnetTarget);
      proximityZone.removeEventListener("pointerleave", releaseMagnet);
      releaseMagnet();
    };
  }, []);

  return (
    <a ref={magnetRef} href={href} className={className}>
      {children}
    </a>
  );
}
