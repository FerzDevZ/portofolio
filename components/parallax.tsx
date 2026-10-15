"use client";

import { useEffect } from "react";

/**
 * Scroll-driven parallax for the hero's two planes.
 *
 * The background grid slides down as you scroll (it recedes), and the portrait
 * drifts up slightly slower than the page (it floats). Both are pure
 * `translateY` writes in one rAF-throttled loop, so the browser never reflows.
 * `translate3d` promotes each layer to its own compositor surface.
 */
export function HeroParallax() {
  useEffect(() => {
    const gridLayer = document.querySelector<HTMLElement>("[data-parallax-grid]");
    const portraitLayer = document.querySelector<HTMLElement>("[data-parallax-portrait]");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let frameId: number | null = null;

    const readParallax = () => {
      frameId = null;
      if (prefersReducedMotion.matches) return;

      const scrollY = window.scrollY;
      if (scrollY > window.innerHeight * 1.2) return; // hero is far off-screen

      const gridOffset = scrollY * 0.12;
      const portraitOffset = scrollY * -0.05;

      if (gridLayer) {
        gridLayer.style.transform = `translate3d(0, ${gridOffset.toFixed(1)}px, 0)`;
      }
      if (portraitLayer) {
        portraitLayer.style.transform = `translate3d(0, ${portraitOffset.toFixed(1)}px, 0)`;
      }
    };

    const scheduleParallax = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(readParallax);
    };

    readParallax();
    window.addEventListener("scroll", scheduleParallax, { passive: true });
    window.addEventListener("resize", scheduleParallax);
    return () => {
      window.removeEventListener("scroll", scheduleParallax);
      window.removeEventListener("resize", scheduleParallax);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
