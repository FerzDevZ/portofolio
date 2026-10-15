import Image from "next/image";
import type { PortfolioContent } from "@/lib/content";
import { HeroParallax } from "@/components/parallax";
import { MagneticAction } from "@/components/cursor-spotlight";
import { HeroSceneLoader } from "@/components/hero-scene-loader";

/**
 * Asymmetric hero: display type on the left axis, meta rail pushed right,
 * stack strip anchored to the hairline below. Never a centered column.
 */
export function Hero({ content }: { content: PortfolioContent }) {
  const { hero, site } = content;

  /* Two marquee rows: split the strip in half, each row scrolls the
     opposite way. The track is the row content twice, so the CSS loop
     (translateX(-50%)) is seamless. The echo copy is aria-hidden. */
  const midpoint = Math.ceil(content.stackStrip.length / 2);
  const twoStackRows = [
    content.stackStrip.slice(0, midpoint),
    content.stackStrip.slice(midpoint),
  ];

  return (
    <section id="top" className="relative overflow-hidden">
      <HeroParallax />
      <div
        aria-hidden="true"
        data-parallax-grid
        className="bg-grid parallax-grid absolute inset-0"
      />
      {/* WebGL relief field — loads idle-time, unmounts off-screen, keeps
          the CSS poster as its floor. Mounted client-side only. */}
      <HeroSceneLoader />

      <div className="hero-top-space relative mx-auto max-w-6xl px-5 pb-0 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <p
              className="enter mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint"
              style={{ "--enter-delay": "60ms" } as React.CSSProperties}
            >
              <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
              {hero.eyebrowStart} {site.shippingSince} {hero.eyebrowEnd}
            </p>

            <h1
              className="enter max-w-3xl text-display text-ink"
              style={{ "--enter-delay": "140ms" } as React.CSSProperties}
            >
              {hero.headlineLead}{" "}
              <span className="text-ink-faint">{hero.headlineAccent}</span>
              {hero.headlineTail}
            </h1>

            <p
              className="enter mt-7 max-w-xl text-lede text-ink-muted"
              style={{ "--enter-delay": "240ms" } as React.CSSProperties}
            >
              {site.tagline} {hero.ledeSuffix}
            </p>

            <div
              className="enter mt-9 flex flex-wrap items-center gap-3"
              style={{ "--enter-delay": "340ms" } as React.CSSProperties}
            >
              <MagneticAction href="#work" className="btn btn-primary">
                {hero.primaryAction}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 6h7M6.5 3l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </MagneticAction>
              <a href="#contact" className="btn btn-ghost">
                {hero.secondaryAction}
              </a>
            </div>
          </div>

          <aside
            className="enter lg:col-span-4 lg:pt-3"
            style={{ "--enter-delay": "420ms" } as React.CSSProperties}
            aria-label={hero.profileDetailsLabel}
          >
            <div
              data-parallax-portrait
              className="parallax-portrait relative mb-8 overflow-hidden rounded-lg border border-line bg-panel"
            >
              <Image
                src={site.portrait}
                alt={site.portraitAlt}
                width={800}
                height={977}
                priority
                sizes="(max-width: 1024px) 40vw, 30vw"
                className="h-auto w-full"
              />
            </div>
            <dl className="border-t border-line">
              {content.heroMeta.map((metaRow) => (
                <div
                  key={metaRow.label}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-3"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    {metaRow.label}
                  </dt>
                  <dd className="text-right text-sm text-ink-muted">
                    {metaRow.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="mt-20 border-t border-line py-4">
          {twoStackRows.map((rowEntry, rowIndex) => (
            <div
              key={rowIndex}
              className="stack-marquee"
              aria-hidden={rowIndex === 1 || undefined}
            >
              <div
                className="stack-marquee-track"
                data-direction={rowIndex === 1 ? "right" : "left"}
              >
                {[0, 1].map((copyIndex) => (
                  <span
                    key={copyIndex}
                    aria-hidden={copyIndex === 1 || undefined}
                    className="flex items-center"
                  >
                    {rowEntry.map((stackEntry, entryIndex) => (
                      <span
                        key={`${stackEntry}-${entryIndex}`}
                        className="flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
                      >
                        {stackEntry}
                        <span aria-hidden="true" className="text-line-strong">
                          /
                        </span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
