"use client";

import { useEffect } from "react";

/**
 * The last boundary: a failure in the root layout itself.
 *
 * `app/[lang]/error.tsx` sits *inside* the root layout, so it cannot catch a
 * throw from `layout.tsx` — and the layout resolves the site origin with
 * `new URL()`, builds the metadata and reads two dictionaries. Without this
 * file Next answers with its own bare document: no `lang`, no font variables,
 * no palette, none of the site's chrome.
 *
 * A global error boundary replaces the root layout entirely, so it has to
 * render `<html>` and `<body>` itself and cannot rely on anything the layout
 * provides — including the theme script. It therefore reads the stored theme
 * inline and carries its own styles; there is no stylesheet to inherit here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root { color-scheme: dark light; --canvas: #050709; --ink: #eceff3; --ink-muted: #a8b0ba; --line: rgba(255,255,255,.12); }
          @media (prefers-color-scheme: light) { :root { --canvas: #f1f4f8; --ink: #14181f; --ink-muted: #4c5560; --line: rgba(19,25,34,.14); } }
          html, body { margin: 0; background: var(--canvas); color: var(--ink); }
          body { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1.25rem; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.55; }
          main { width: 100%; max-width: 32rem; border: 1px solid var(--line); border-radius: 12px; padding: clamp(1.5rem, 5vw, 2.5rem); }
          p { margin: 0 0 1rem; color: var(--ink-muted); }
          h1 { margin: 0 0 1rem; font-size: clamp(1.35rem, 4vw, 1.75rem); }
          .row { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.75rem; }
          button, a { display: inline-flex; align-items: center; min-height: 2.25rem; padding: 0 1.1rem; border-radius: 6px; font: inherit; font-size: .875rem; font-weight: 500; text-decoration: none; cursor: pointer; }
          button { border: 1px solid transparent; background: var(--ink); color: var(--canvas); }
          a { border: 1px solid var(--line); color: var(--ink); }
          :focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
        `}</style>
      </head>
      <body>
        <main>
          <h1>Something went wrong</h1>
          <p>
            The page could not be rendered. This is not something you did —
            reloading, or trying again, usually fixes it.
          </p>
          {error.digest ? (
            <p>
              <small>Reference: {error.digest}</small>
            </p>
          ) : null}
          <div className="row">
            <button type="button" onClick={reset}>
              Try again
            </button>
            {/* A plain anchor, not `next/link`: this boundary is what runs when
                the layout itself failed, and client-side routing is part of the
                machinery that may be broken. A full document load is the more
                reliable exit here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Go to the home page</a>
          </div>
        </main>
      </body>
    </html>
  );
}
