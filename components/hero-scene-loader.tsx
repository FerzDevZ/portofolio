"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Loads the hero WebGL scene only where it should exist:
 * - `ssr: false` via a client boundary (a server component cannot);
 * - only on hover-capable, motion-OK devices;
 * - only after the browser is idle, so the poster and LCP content always
 *   win the first-paint race;
 * - unmounted while the hero is scrolled away, which stops the render loop.
 *
 * Any exit (no WebGL, weak device, reduced motion) keeps the CSS poster —
 * the hero is never blank on its own.
 */

const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
});

type SceneDecision = "loading" | "active" | "poster";

function decideSceneSupport(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return false;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  /* Weak-device heuristic: few cores usually also means integrated GPU
     under thermal/threading pressure. The poster still reads beautifully
     against these machines. */
  if ((navigator.hardwareConcurrency ?? 8) <= 2) {
    return false;
  }

  try {
    const probeCanvas = document.createElement("canvas");
    const webglContext =
      probeCanvas.getContext("webgl2") ??
      probeCanvas.getContext("webgl");
    return webglContext !== null;
  } catch {
    return false;
  }
}

export function HeroSceneLoader() {
  const [sceneState, setSceneState] = useState<SceneDecision>("loading");
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const mountIdleLoader = (idleId: number) => {
      window.cancelIdleCallback?.(idleId);
    };

    const scheduleScene = () => {
      if (!decideSceneSupport()) {
        setSceneState("poster");
        return;
      }

      /* requestIdleCallback where the browser has it; a small timeout as the
         portable fallback. Either way: never during the initial paint. */
      const idleWindow = window as Window & {
        requestIdleCallback?: (callback: () => void) => number;
      };
      if (typeof idleWindow.requestIdleCallback === "function") {
        idleWindow.requestIdleCallback(() => setSceneState("active"));
      } else {
        window.setTimeout(() => setSceneState("active"), 350);
      }
    };

    scheduleScene();

    return () => {
      mountIdleLoader(0);
    };
  }, []);

  /* When the hero scrolls fully out of view, unmount the Canvas so the
     GPU stops rendering a scene nobody sees. */
  useEffect(() => {
    if (sceneState !== "active") return;

    const heroWatcher = new IntersectionObserver(
      (observerEntries) => {
        for (const observerEntry of observerEntries) {
          setHeroVisible(observerEntry.isIntersecting);
        }
      },
      { threshold: 0 },
    );
    const heroAnchor = document.getElementById("top");
    if (heroAnchor) heroWatcher.observe(heroAnchor);

    return () => heroWatcher.disconnect();
  }, [sceneState]);

  return (
    <div aria-hidden="true" className="hero-scene-slot">
      {sceneState === "active" && heroVisible ? <HeroScene /> : null}
      {/* The poster always sits under the canvas (scene renders absolutely
          on top), so the visible hand-off is instant whatever the network. */}
      <div className="hero-scene-poster" />
    </div>
  );
}
