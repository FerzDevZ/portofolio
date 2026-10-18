"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Section reveal: children fade up the first time they enter the viewport.
 *
 * Design contract:
 * - Without JS nothing is ever hidden: the base `.reveal-section` state is
 *   fully visible. Only after hydration does the component "arm" itself
 *   (opacity 0) and the next intersection plays the entrance — so
 *   server-rendered HTML and no-JS clients never see blank sections.
 * - IntersectionObserver, not a scroll listener: zero work on the scroll
 *   thread; the browser decides when the threshold is crossed.
 * - Fires once, then disconnects — revisiting a section never re-animates.
 * - Animation targets transform and opacity only; `prefers-reduced-motion`
 *   is collapsed to 0.01ms by the global rule in globals.css.
 */
export function RevealSection({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isArmed, setIsArmed] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    const observedSection = sectionRef.current;
    if (!observedSection) return;

    const intersectionObserver = new IntersectionObserver(
      (observerEntries) => {
        for (const observerEntry of observerEntries) {
          if (observerEntry.isIntersecting) {
            setHasRevealed(true);
            intersectionObserver.disconnect();
          }
        }
      },
      /* The threshold keeps a section that sits half in view at page load
         from animating: it reveals only once a real part of it scrolls in.
         It is also the end of the scroll-timeline range in `globals.css` —
         changing one without the other cuts the entrance in half. */
      { threshold: 0.12 },
    );

    /* Arm after mount: hides the section only when JS is confirmed live and
       the section has not been seen yet. Elements already on screen at load
       intersect within the first observer callback, so they reappear on the
       same frame the entrance would have played. */
    setIsArmed(true);
    intersectionObserver.observe(observedSection);
    return () => intersectionObserver.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`reveal-section ${
        isArmed && !hasRevealed ? "reveal-section--armed" : ""
      } ${hasRevealed ? "reveal-section--in" : ""} ${className}`}
      style={
        delayMs > 0
          ? ({ "--reveal-delay": `${delayMs}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
