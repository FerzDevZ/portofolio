import type { ReactNode } from "react";

/**
 * Section reveal: the entrance is a scroll-driven CSS animation, no JS.
 *
 * Design contract:
 * - Deliberately NOT a client component. It used to be: every section armed
 *   itself after hydration (opacity 0) and played a 680ms transition from an
 *   IntersectionObserver. Ten of those boundaries cost ~100ms of main-thread
 *   hydration time on a mid-range phone — measured as Lighthouse TBT — to
 *   produce an entrance the browser can compute from scroll position alone.
 * - The animation lives in `globals.css` (`.reveal-section`), driven by
 *   `animation-timeline: view()`. Where that timeline is unsupported, in
 *   print, and under `prefers-reduced-motion`, the section is simply visible.
 *   The HTML never ships hidden content, so no-JS clients are unaffected.
 * - Trade-off made explicit: a scroll timeline has no memory, so scrolling
 *   back up replays the entrance. The old observer's "fire once" required JS
 *   to remember it; this trades that memory for a smaller main thread.
 * - The entrance is transform/opacity only, so it never touches layout.
 *
 * The delay that the old `delayMs` prop carried is now the scroll order
 * itself: a section that follows another enters the viewport later.
 */
export function RevealSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`reveal-section ${className}`}>{children}</div>;
}
