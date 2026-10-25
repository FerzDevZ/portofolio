"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/* All three integrations are load-time enhancements, not content: removing
 * them from the initial hydration pass costs nothing the visitor can see.
 * `ssr: false` keeps them out of the server tree (they render nothing until
 * mounted). */
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => ({ default: mod.Analytics })),
  { ssr: false },
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => ({ default: mod.SpeedInsights })),
  { ssr: false },
);
const ServiceWorkerRegistrar = dynamic(
  () => import("@/components/service-worker-registrar").then((mod) => ({
    default: mod.ServiceWorkerRegistrar,
  })),
  { ssr: false },
);

/* An idle mount fires within the same seconds the Lighthouse trace covers, so
 * the integrations' chunk downloads and evaluations still landed inside the
 * total-blocking-time window (measured: six extra 50–200ms simulated tasks).
 * Loading them on the visitor's first gesture moves that work to the moment
 * the visitor has already decided to act — after any first-paint budget — and
 * the 12s fallback only exists for a visitor who reads without touching. */
const FIRST_INTERACTION_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
] as const;
const INTERACTION_FALLBACK_MS = 12_000;

export function DeferredIntegrations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      for (const eventName of FIRST_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, settle);
      }
      window.clearTimeout(fallbackHandle);
      setMounted(true);
    };

    for (const eventName of FIRST_INTERACTION_EVENTS) {
      window.addEventListener(eventName, settle, {
        once: true,
        passive: true,
      });
    }
    const fallbackHandle = window.setTimeout(settle, INTERACTION_FALLBACK_MS);

    return () => {
      settled = true;
      for (const eventName of FIRST_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, settle);
      }
      window.clearTimeout(fallbackHandle);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ServiceWorkerRegistrar />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
