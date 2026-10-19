export function WorkSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
      <header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
        <div className="h-3 w-32 animate-pulse rounded bg-panel" />
        <div className="h-3 w-16 animate-pulse rounded bg-panel" />
      </header>

      <article className="grid grid-cols-1 gap-8 border-b border-line py-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-panel" />
          <div className="h-10 w-full max-w-md animate-pulse rounded bg-panel" />
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-panel" />
          <div className="mt-5 h-20 max-w-lg animate-pulse rounded bg-panel" />
          <div className="mt-6 flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 animate-pulse rounded bg-panel" />
            ))}
          </div>
          <div className="mt-7 h-5 w-40 animate-pulse rounded bg-panel" />
        </div>
        <div className="lg:col-span-5">
          <div className="min-h-56 animate-pulse rounded-lg border border-line bg-panel" />
        </div>
      </article>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="grid grid-cols-1 items-baseline gap-x-6 gap-y-2 border-b border-line py-6 sm:grid-cols-12"
          >
            <div className="h-3 w-8 animate-pulse rounded bg-panel sm:col-span-1" />
            <div className="space-y-2 sm:col-span-4">
              <div className="h-6 w-full animate-pulse rounded bg-panel" />
              <div className="h-3 w-24 animate-pulse rounded bg-panel" />
            </div>
            <div className="h-16 animate-pulse rounded bg-panel sm:col-span-4" />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {[1, 2].map((j) => (
                <div key={j} className="h-5 w-12 animate-pulse rounded bg-panel" />
              ))}
            </div>
            <div className="h-4 w-12 animate-pulse rounded bg-panel sm:col-span-1" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CertificatesSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
      <header className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <div className="h-3 w-32 animate-pulse rounded bg-panel" />
        <div className="h-3 w-24 animate-pulse rounded bg-panel" />
      </header>

      <div className="pb-4">
        {[1, 2].map((i) => (
          <article
            key={i}
            className="grid grid-cols-1 gap-8 border-b border-line py-10 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-5">
              <div className="h-3 w-8 animate-pulse rounded bg-panel" />
              <div className="mt-3 h-8 w-full max-w-md animate-pulse rounded bg-panel" />
              <div className="mt-4 h-16 max-w-md animate-pulse rounded bg-panel" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-panel" />
            </div>
            <div className="lg:col-span-7">
              <div className="aspect-[1600/1131] w-full animate-pulse rounded-lg border border-line bg-panel" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
