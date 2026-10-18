import { NextResponse, type NextRequest } from "next/server";
import {
  isLocale,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/content";

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
 * win, with the request's own `Host` as the fallback.
 */
function readRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .replace(/:$/, "");
  const protocol = forwardedProtocol || request.nextUrl.protocol.replace(/:$/, "");
  return `${protocol}://${host}`;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];

  if (isLocale(firstSegment)) {
    /** The locale is already explicit, but the route is a dynamic segment — and
     *  a boundary that never sees `params` (the not-found page) still has to
     *  speak this language. Hand the resolved locale forward as a request
     *  header instead of reading cookies or `headers()` inside a page, which
     *  would opt every page into dynamic rendering. */
    const forwardedHeaders = new Headers(request.headers);
    forwardedHeaders.set("x-locale", firstSegment);
    return NextResponse.next({ request: { headers: forwardedHeaders } });
  }

  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isLocale(savedLocale)
    ? savedLocale
    : resolveLocaleFromAcceptLanguage(request.headers.get("accept-language"));

  const location = `/${locale}${pathname === "/" ? "" : pathname}${search}`;

  const response = NextResponse.redirect(
    new URL(location, readRequestOrigin(request)),
    307,
  );
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  /**
   * Everything except Next's own output, the file-convention endpoints that
   * must stay unprefixed (icons, manifest, OG images, the service worker) and
   * files that already carry an extension.
   */
  matcher: [
    "/((?!_next/static|_next/image|icon.png|apple-icon.png|manifest.webmanifest|opengraph-image|og-light.png|sw.js|favicon.ico|.*\\..*).*)",
  ],
};
