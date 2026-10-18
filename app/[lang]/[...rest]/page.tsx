import { notFound } from "next/navigation";

/**
 * Catch-all for paths under a locale that no page claims.
 *
 * Without this file, `/en/nope` never reaches the `[lang]` segment's
 * `not-found.tsx`: there is no matching route at all, so Next falls back to
 * its built-in 404 document, which has no `lang`, no dictionary, and none of
 * the site's chrome. Calling `notFound()` here makes the segment boundary
 * render instead — the same page `/en/projects/unknown-slug` already gets.
 *
 * Real routes win over a catch-all, so this never shadows a page, a metadata
 * image, or `og-light.png`.
 */
export default function UnmatchedLocalePath(): never {
  notFound();
}
