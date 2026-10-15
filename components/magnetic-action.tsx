"use client";

import { useEffect, useRef } from "react";

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
    <a
      ref={magnetRef}
      href={href}
      className={`magnetic-action ${className ?? ""}`.trim()}
    >
      {children}
    </a>
  );
}
