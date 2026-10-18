import path from "node:path";
import type { NextConfig } from "next";

/**
 * Response headers every route gets.
 *
 * The site is static and same-origin, so these are cheap insurance rather
 * than a fix for a known hole: no MIME sniffing, no framing, no referrer
 * leakage, and no access to device APIs the page never asks for.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/**
 * A static site can carry a real CSP: every script, style, font and image is
 * same-origin, and the only inline script is the theme bootstrap (hence
 * 'unsafe-inline'). It is production-only because the dev server needs eval
 * for React Refresh — shipping it in development would break `pnpm dev`
 * while proving nothing about the built artifact.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The framework version is not useful to a visitor and only helps someone
  // fingerprint the deployment.
  poweredByHeader: false,
  // A stray lockfile in the parent directory makes Next infer the wrong
  // workspace root, which would widen output file tracing beyond this app.
  outputFileTracingRoot: path.join(__dirname),
  // The dev server is reached over loopback under either host name.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
