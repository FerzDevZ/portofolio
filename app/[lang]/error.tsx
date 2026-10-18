"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { errorCopy } from "@/lib/content/error-copy";

/**
 * Locale-aware error boundary for every route below `[lang]`.
 *
 * It cannot read `params` — Next calls an error boundary with `error` and
 * `reset` only — so the locale comes from the pathname the visitor is already
 * on. `errorCopy` is a separate, tiny module for exactly that reason; see its
 * header comment.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  /* Inlined rather than imported: `isLocale` lives in the barrel that pulls
     both dictionaries, and an error boundary should not carry them. */
  const locale = pathname?.split("/")[1] === "id" ? "id" : "en";
  const copy = errorCopy[locale];

  useEffect(() => {
    /* The visitor gets the UI; the digest is what makes the failure findable
       in the server log. */
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto max-w-6xl px-5 sm:px-8">
      <article className="py-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          {copy.eyebrow}
        </p>
        <h1 className="mt-6 max-w-xl text-title text-ink">{copy.title}</h1>
        <p className="mt-5 max-w-xl text-ink-muted">{copy.body}</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            {copy.retry}
          </button>
          <Link href={`/${locale}`} className="btn btn-ghost">
            {copy.home}
          </Link>
        </div>
      </article>
    </main>
  );
}
