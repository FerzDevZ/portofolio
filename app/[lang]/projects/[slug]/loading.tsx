export default function ProjectCaseStudyLoading() {
  return (
    <>
      <header className="safe-area-header border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-line-strong bg-panel" />
            <span className="h-4 w-24 animate-pulse rounded bg-panel" />
          </div>
          <div className="flex items-center gap-4">
            <span className="h-4 w-16 animate-pulse rounded bg-panel" />
            <span className="h-6 w-6 animate-pulse rounded bg-panel" />
            <span className="h-6 w-6 animate-pulse rounded bg-panel" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <article className="pb-20">
          <header className="pt-16 sm:pt-20">
            <p className="flex items-center gap-3">
              <span className="h-px w-8 bg-line-strong" />
              <span className="h-3 w-20 animate-pulse rounded bg-panel" />
            </p>
            <div className="mt-6 h-16 max-w-3xl animate-pulse rounded bg-panel" />
            <div className="mt-7 h-20 max-w-xl animate-pulse rounded bg-panel" />

            <dl className="mt-12 grid grid-cols-1 gap-x-8 border-t border-line sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-line py-3">
                  <dt className="h-3 w-16 animate-pulse rounded bg-panel" />
                  <dd className="mt-1 h-4 w-24 animate-pulse rounded bg-panel" />
                </div>
              ))}
            </dl>
          </header>

          <section className="mt-16">
            <div className="h-4 w-20 animate-pulse rounded border-b border-line bg-panel pb-4" />
            <div className="mt-6 h-24 max-w-2xl animate-pulse rounded bg-panel" />
          </section>

          <section className="mt-16">
            <div className="h-4 w-20 animate-pulse rounded border-b border-line bg-panel pb-4" />
            <div className="space-y-6 pt-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-12 sm:gap-6"
                >
                  <span className="h-3 w-6 animate-pulse rounded bg-panel sm:col-span-1" />
                  <div className="h-6 animate-pulse rounded bg-panel sm:col-span-4" />
                  <div className="h-16 animate-pulse rounded bg-panel sm:col-span-7" />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 grid grid-cols-1 gap-10 border-t border-line pt-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="h-4 w-20 animate-pulse rounded bg-panel" />
              <div className="mt-5 h-24 max-w-md animate-pulse rounded bg-panel" />
            </div>
            <div className="space-y-5 lg:col-span-7">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-5"
                >
                  <dt className="h-3 w-32 animate-pulse rounded bg-panel" />
                  <dd className="h-8 w-24 animate-pulse rounded bg-panel" />
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
