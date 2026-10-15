"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** How often the origin is re-probed while the chip is on screen. */
const REACHABILITY_PROBE_INTERVAL_MS = 15_000;

/** A probe that hangs must not still be pending when the next one starts. */
const REACHABILITY_PROBE_TIMEOUT_MS = 8_000;

type CacheStateReport = {
  type: "cache-state:report";
  servedFromCache: boolean;
};

function isCacheStateReport(report: unknown): report is CacheStateReport {
  if (typeof report !== "object" || report === null) return false;
  const candidate = report as { type?: unknown; servedFromCache?: unknown };
  return (
    candidate.type === "cache-state:report" &&
    typeof candidate.servedFromCache === "boolean"
  );
}

function subscribeToConnectivity(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function readBrowserConnectivity(): boolean {
  return navigator.onLine;
}

/**
 * The server has no connection to report, so it renders the online state and
 * the client adopts the real value on the first event or probe.
 */
function readBrowserConnectivityOnServer(): boolean {
  return true;
}

/**
 * Offline chip for the header.
 *
 * Two independent signals, because neither is sufficient on its own:
 * `navigator.onLine` is instant but describes the device's route, not the
 * origin — it stays `true` when a server is down, a captive portal is up, or
 * Wi-Fi is dead behind a live mobile interface. The service worker knows the
 * document was answered from the offline cache, which is the precise
 * "this page came from disk" signal, but it can only report it after the
 * navigation has already been served.
 *
 * The chip is always rendered and only toggles visibility, so the header row
 * reserves its width and the clock and menu button never move when the network
 * drops.
 */
export function OfflineIndicator({
  chipLabel,
  announcement,
}: {
  chipLabel: string;
  announcement: string;
}) {
  const browserReportsOnline = useSyncExternalStore(
    subscribeToConnectivity,
    readBrowserConnectivity,
    readBrowserConnectivityOnServer,
  );
  const [navigationServedFromCache, setNavigationServedFromCache] =
    useState(false);
  const [originReachable, setOriginReachable] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const askServiceWorker = () => {
      navigator.serviceWorker.controller?.postMessage({
        type: "cache-state:query",
      });
    };
    const readReport = (event: MessageEvent<unknown>) => {
      if (!isCacheStateReport(event.data)) return;
      setNavigationServedFromCache(event.data.servedFromCache);
    };

    navigator.serviceWorker.addEventListener("message", readReport);
    // A newly activated worker has not served this document, so its answer
    // would be the default one; only the worker that owns the page can report.
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      askServiceWorker,
    );
    askServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener("message", readReport);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        askServiceWorker,
      );
    };
  }, []);

  const showsOfflineState =
    !browserReportsOnline || navigationServedFromCache || !originReachable;

  /*
   * Both signals above go stale in the same direction: a page served from cache
   * keeps claiming it after the network returns. Probe the origin on the events
   * that mean something changed — and on an interval only while the chip is
   * showing — so recovery needs neither a reload nor a poll while online.
   */
  useEffect(() => {
    if (!showsOfflineState) return;

    let cancelled = false;

    const probeOrigin = async () => {
      const abortController = new AbortController();
      const timeoutId = window.setTimeout(
        () => abortController.abort(),
        REACHABILITY_PROBE_TIMEOUT_MS,
      );
      let originAnswered = false;
      try {
        // HEAD is not intercepted by the service worker, so this measures the
        // network path itself rather than the cache.
        await fetch(new URL("/", window.location.origin), {
          method: "HEAD",
          cache: "no-store",
          signal: abortController.signal,
        });
        originAnswered = true;
      } catch {
        originAnswered = false;
      } finally {
        window.clearTimeout(timeoutId);
      }
      if (cancelled) return;
      setOriginReachable(originAnswered);
      if (originAnswered) setNavigationServedFromCache(false);
    };

    void probeOrigin();
    const intervalId = window.setInterval(
      () => void probeOrigin(),
      REACHABILITY_PROBE_INTERVAL_MS,
    );
    const probeWhenVisible = () => {
      if (document.visibilityState === "visible") void probeOrigin();
    };
    document.addEventListener("visibilitychange", probeWhenVisible);
    window.addEventListener("online", probeOrigin);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", probeWhenVisible);
      window.removeEventListener("online", probeOrigin);
    };
  }, [showsOfflineState]);

  return (
    <>
      <span
        aria-hidden="true"
        className={`flex h-6 w-5 shrink-0 items-center justify-center gap-1.5 rounded-[4px] border border-line-strong font-mono text-signal transition-[opacity,visibility] duration-200 ease-out sm:w-auto sm:px-2 ${
          showsOfflineState ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 5.4a7 7 0 0 1 9 0"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M4.9 8.1a3.9 3.9 0 0 1 4.2 0"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M1.3 1.3 12.7 12.7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10.7" r="0.85" fill="currentColor" />
        </svg>
        {/* Icon alone on the narrowest phones: the label is what would not fit
            beside the brand at 320px. */}
        <span className="hidden text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:inline">
          {chipLabel}
        </span>
      </span>

      {/* The chip is decorative; this is the announced state. It stays mounted
          so the inserted text, not the element, is what gets read out. */}
      <span role="status" aria-live="polite" className="sr-only">
        {showsOfflineState ? announcement : ""}
      </span>
    </>
  );
}
