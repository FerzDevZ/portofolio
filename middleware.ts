import { NextResponse, type NextRequest } from "next/server";
import { isLocale, resolveLocaleFromAcceptLanguage } from "@/lib/locale";

/**
 * Sends an unprefixed path to a locale.
 *
 * The locale lives in the URL (`/en/...`, `/id/...`) so every page stays
 * statically renderable — reading `headers()` or `cookies()` inside a page
 * would opt it into dynamic rendering, which is exactly what this avoids. The
 * decision is therefore made here, before routing, and remembered in a cookie
 * so a visitor who switched languages once is not switched back.
 *
 * An explicit locale in the path always wins, so the middleware is a
 * redirector for *unprefixed* traffic only.
 *
 * The redirect target has to be absolute — Next parses the `Location` header of
 * a middleware response and rejects a relative one outright — but it must not
 * come from `request.nextUrl` either: that origin is the one the runtime
 * believes it is bound to, and a locally bound server answers with its own
 * `localhost` host even when the request arrived on a different one, which
 * would bounce a visitor to an origin they never asked for. The forwarded
 * headers a proxy sets describe the URL the visitor actually typed, so they
 * win — but only when they name a host this deployment already knows, because
 * `X-Forwarded-Host` is an ordinary request header and an unchecked value
 * turns the redirector into an open redirect.
 */

/** A host with an optional port. Anything else is not a host we will echo. */
const HOST_SHAPE =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*(?::\d{1,5})?$/i;

/** A BCP-47-shaped first segment: `fr`, `de`, `en-US`. A page slug is longer. */
const LANGUAGE_TAG = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function firstHeaderValue(request: NextRequest, name: string): string | null {
  const rawValue = request.headers.get(name);
  if (!rawValue) return null;
  const first = rawValue.split(",")[0]?.trim();
  return first ? first : null;
}

/** The hosts this deployment is allowed to answer as. */
function trustedHosts(): Set<string> {
  const hosts = new Set<string>();

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteUrl) {
    try {
      hosts.add(new URL(configuredSiteUrl).host.toLowerCase());
    } catch {
      /* A malformed env var is a build-time concern, not a routing one. */
    }
  }

  for (const envName of ["VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"]) {
    const host = process.env[envName]?.trim();
    if (host) hosts.add(host.toLowerCase());
  }

  return hosts;
}

function withoutPort(host: string): string {
  return host.replace(/:\d+$/, "");
}

function readRequestOrigin(request: NextRequest): string {
  const hostHeader = (
    request.headers.get("host") ?? request.nextUrl.host
  ).toLowerCase();
  const forwardedHost = firstHeaderValue(request, "x-forwarded-host");

  let host = hostHeader;
  if (forwardedHost && HOST_SHAPE.test(forwardedHost)) {
    const candidate = forwardedHost.toLowerCase();
    const trusted = trustedHosts();
    const isKnownHost =
      trusted.has(candidate) ||
      trusted.has(withoutPort(candidate)) ||
      withoutPort(candidate) === withoutPort(hostHeader) ||
      withoutPort(candidate).endsWith(".vercel.app");
    /* An unknown host is dropped rather than echoed: a redirect to a host the
       deployment has never heard of is the exact shape of an open redirect. */
    if (isKnownHost) host = candidate;
  }

  const forwardedProtocol = firstHeaderValue(request, "x-forwarded-proto")
    ?.replace(/:$/, "")
    .toLowerCase();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : request.nextUrl.protocol.replace(/:$/, "");

  return `${protocol}://${host}`;
}

function rememberLocale(response: NextResponse, locale: string): NextResponse {
  response.cookies.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";
  const normalizedSegment = firstSegment.toLowerCase();

  /* A supported locale, possibly in the wrong case: `/EN` is not a route, and
     Next matches case-insensitively, so it would otherwise render a page whose
     `lang` is `EN` and then 404 on the locale guard. Canonicalise the case and
     remember the explicit choice. */
  if (isLocale(normalizedSegment)) {
    if (normalizedSegment === firstSegment) {
      return rememberLocale(NextResponse.next(), normalizedSegment);
    }
    const canonicalPath = `/${normalizedSegment}${pathname.slice(
      firstSegment.length + 1,
    )}${search}`;
    return rememberLocale(
      NextResponse.redirect(new URL(canonicalPath, readRequestOrigin(request)), 308),
      normalizedSegment,
    );
  }

  /* A path that carries a file extension is an asset, not a page. The matcher
     cannot express "unless the path is locale-prefixed", so the check lives
     here: `/id/foo.bar` reaches this point only after the locale branch above
     has already returned. */
  if (/\.[^/]+$/.test(pathname)) return NextResponse.next();

  const savedLocale = request.cookies.get(COOKIE_NAME)?.value;
  const locale = isLocale(savedLocale)
    ? savedLocale
    : resolveLocaleFromAcceptLanguage(request.headers.get("accept-language"));

  /* A language tag this site does not ship (`/fr`, `/de/impressum`). A
     redirect would answer with 307 and then a 404 two hops later, and it would
     write a cookie for a URL that never existed. Rewriting keeps the visitor's
     URL, lets the `[lang]` catch-all render the localized 404, and returns the
     404 status at the address that was actually requested. */
  if (LANGUAGE_TAG.test(firstSegment)) {
    return NextResponse.rewrite(
      new URL(`/${locale}${pathname}${search}`, readRequestOrigin(request)),
    );
  }

  const redirectTarget = new URL(
    `/${locale}${pathname === "/" ? "" : pathname}${search}`,
    readRequestOrigin(request),
  );
  const response = NextResponse.redirect(redirectTarget, 307);
  /* The target depends on `Cookie` and `Accept-Language`, so a shared cache
     must not reuse one visitor's answer for the next one. */
  response.headers.set("Vary", "Accept-Language, Cookie");
  response.headers.set("Cache-Control", "private, no-store");
  return rememberLocale(response, locale);
}

export const config = {
  /**
   * Everything except Next's own output (which includes the dev HMR socket)
   * and the file-convention endpoints that must stay unprefixed: icons, the
   * manifest, the OG images, the service worker, robots and the sitemap.
   * Dotted paths are no longer excluded here — `/id/foo.bar` is a page under a
   * locale and has to reach the localized 404 — so the extension check moved
   * into the handler, where it can be conditional.
   */
  matcher: [
    "/((?!_next/|icon.png|apple-icon.png|manifest.webmanifest|opengraph-image|og-light.png|sw.js|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
