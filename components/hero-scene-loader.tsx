"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MOTION_OFF_CLASS, MOTION_STORAGE_KEY } from "@/components/motion-toggle";

/**
 * Loads the hero WebGL scene only where it should exist:
 * - `ssr: false` via a client boundary (a server component cannot);
 * - only on hover-capable, motion-OK devices;
 * - only after the browser is idle, so the poster and LCP content always
 *   win the first-paint race;
 * - unmounted while the hero is scrolled away, which stops the render loop.
 *
 * The support decision is re-made whenever the visitor flips the footer
 * switch, so "3D motion off" stops the loop instead of hiding a canvas that
 * keeps rendering behind `display: none`.
 *
 * Any exit (no WebGL, weak device, reduced motion, switch off) keeps the CSS
 * poster — the hero is never blank on its own.
 */

const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
});

type SceneDecision = "loading" | "active" | "poster";

function decideSceneSupport(): boolean {
  if (typeof window === "undefined") return false;
  /* The visitor switched 3D off in the footer: keep the poster. */
  if (document.documentElement.classList.contains(MOTION_OFF_CLASS)) {
    return false;
  }
  if (window.localStorage.getItem(MOTION_STORAGE_KEY) === "off") return false;
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
    if (!webglContext) return false;
    /* Release the probe immediately. Every `decide()` run — mount, each
       mutation of <html>'s class, each `storage` event — used to take one slot
       out of the browser's WebGL context quota (about 16 per page) and keep it
       forever, which can end with the *scene's* context being evicted. */
    webglContext.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function HeroSceneLoader() {
  const [sceneState, setSceneState] = useState<SceneDecision>("loading");
  const [heroVisible, setHeroVisible] = useState(true);
  /* Whether the scene is allowed right now. Kept separate from `sceneState`
     so a policy change can cancel a pending idle callback and unmount the
     canvas without re-running the visibility observer. */
  const [sceneAllowed, setSceneAllowed] = useState(false);

  useEffect(() => {
    const decide = () => setSceneAllowed(decideSceneSupport());
    decide();

    /* Two writers can change the answer after mount: the footer switch (a
       class on <html>) and another tab (the storage key). Watching both is
       what turns the switch into an actual off switch. */
    const classObserver = new MutationObserver(decide);
    classObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const followStorage = (storageEvent: StorageEvent) => {
      if (storageEvent.key === MOTION_STORAGE_KEY) decide();
    };
    window.addEventListener("storage", followStorage);

    return () => {
      classObserver.disconnect();
      window.removeEventListener("storage", followStorage);
    };
  }, []);

  useEffect(() => {
    if (!sceneAllowed) {
      setSceneState("poster");
      return;
    }

    /* Keep the handle of whichever idle callback was scheduled, so a policy
       change before it fires cancels it instead of switching a scene on. */
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const activate = () => setSceneState("active");

    /* requestIdleCallback where the browser has it; a small timeout as the
       portable fallback. Either way: never during the initial paint. */
    if (typeof idleWindow.requestIdleCallback === "function") {
      idleHandle = idleWindow.requestIdleCallback(activate);
    } else {
      timeoutHandle = window.setTimeout(activate, 350);
    }

    return () => {
      if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
    };
  }, [sceneAllowed]);

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
      {/* The poster paints behind the canvas (`.hero-scene-poster` carries
          `z-index: 0`, the frame `z-index: 1`), so it is the first paint and
          the fallback whenever the scene never mounts or loses its context. */}
      <div className="hero-scene-poster" />
    </div>
  );
}
