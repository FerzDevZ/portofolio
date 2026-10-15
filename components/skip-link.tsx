/**
 * Keyboard escape hatch past the chrome. `sr-only` keeps it out of the
 * layout until it holds focus, and `fixed` on focus is deliberate: it beats
 * `not-sr-only`'s `static` regardless of utility order, and the link must
 * land above the header, which sits at `z-50`.
 */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-[6px] focus:border focus:border-line-strong focus:bg-panel focus:px-3.5 focus:py-2 focus:font-mono focus:text-xs focus:text-ink"
    >
      {label}
    </a>
  );
}
