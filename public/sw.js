/*
 * Offline shell for the portfolio.
 *
 * Navigation requests are network-first, so a deploy is visible on the next
 * load instead of being pinned to a stale cache; the fallback to the cached
 * shell only kicks in when the network actually fails. Hashed build output and
 * artwork are content-addressed, so those are served cache-first. Nothing
 * cross-origin, non-GET, or non-OK is ever stored.
 *
 * The two locale shells are precached separately because there is no such
 * thing as a language-neutral page here: `/en` and `/id` are two complete
 * static documents, and `/` is only a redirect into one of them.
 */

/* v2: the site became bilingual, so `/` is no longer a page — it redirects to
   a locale. A shell cache from v1 holds an English-only document under a URL
   that no longer renders, so the version is bumped and the old cache dropped
   on activate rather than migrated. */
const CACHE_NAME = "portfolio-shell-v2";

/* Whether the document on screen was answered from the offline cache.
   Module state is enough: the page asks for it the moment it boots, while the
   worker that served the navigation is still the one answering, so the value
   never has to outlive the worker. */
let servedNavigationFromCache = false;

/* Both locale shells, not `/`: that URL answers with a redirect, and a
   redirect is not something the Cache API stores. Each shell is a complete
   static document, so an offline visitor gets the page in their own language
   instead of a network error. */
const PRECACHE_URLS = [
  "/en",
  "/id",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
  "/apple-icon.png",
];

/* The SW cache is a separate store from the HTTP cache: it is legitimate to
   keep a response the origin marked `no-store` (Next marks every HTML page
   that way) because the SW decides when, and whether, to revalidate. */
function isStorable(storedResponse) {
  if (!storedResponse || !storedResponse.ok) return false;
  if (storedResponse.type !== "basic") return false;
  return storedResponse.headers.get("vary") !== "*";
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
      await self.clients.claim();
    })(),
  );
});

async function serveFromCache(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  const networkResponse = await fetch(request);
  if (isStorable(networkResponse)) {
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function serveFromNetwork(request) {
  const cache = await caches.open(CACHE_NAME);
  const isDocument = request.mode === "navigate";

  try {
    const networkResponse = await fetch(request);
    if (isStorable(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    if (isDocument) servedNavigationFromCache = false;
    return networkResponse;
  } catch (networkFailure) {
    /* Offline navigation falls back to the shell of the same locale first —
       a request for `/id/projects/atlas` should not surface the English
       home page to a reader who chose Indonesian. */
    const requestedLocaleShell = new URL(request.url).pathname.startsWith("/id")
      ? "/id"
      : "/en";
    const otherLocaleShell = requestedLocaleShell === "/id" ? "/en" : "/id";
    const cachedResponse =
      (await cache.match(request)) ??
      (await cache.match(requestedLocaleShell)) ??
      (await cache.match(otherLocaleShell));
    if (cachedResponse) {
      if (isDocument) servedNavigationFromCache = true;
      return cachedResponse;
    }
    throw networkFailure;
  }
}

const CONTENT_ADDRESSED_PATH = /\.(?:png|svg|ico|webmanifest|woff2?|css|js)$/;

/* The page cannot tell from the inside whether its own response came off the
   disk, so it asks the worker that produced it. */
self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || message.type !== "cache-state:query") return;
  if (!event.source) return;

  event.source.postMessage({
    type: "cache-state:report",
    servedFromCache: servedNavigationFromCache,
  });
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  /* The service worker script itself must always come from the network, and
     the dev server's HMR channel must never be intercepted. */
  if (requestUrl.pathname === "/sw.js") return;
  if (requestUrl.pathname.startsWith("/_next/webpack-hmr")) return;

  if (request.mode === "navigate") {
    event.respondWith(serveFromNetwork(request));
    return;
  }

  if (
    requestUrl.pathname.startsWith("/_next/static/") ||
    requestUrl.pathname.startsWith("/icons/") ||
    requestUrl.pathname.startsWith("/splash/") ||
    CONTENT_ADDRESSED_PATH.test(requestUrl.pathname)
  ) {
    event.respondWith(serveFromCache(request));
    return;
  }

  event.respondWith(serveFromNetwork(request));
});
