import type { PortfolioContent } from "@/lib/content";
import { RevealSection } from "@/components/reveal-section";

/**
 * Capabilities as a sticky-title split: heading holds the left rail while
 * the numbered entries scroll past on the right — no equal card grid.
 */
export function Capabilities({ content }: { content: PortfolioContent }) {
  const { capabilities } = content;

  return (
    <section id="capabilities" className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
      <RevealSection>
        <header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            {capabilities.heading}
          </h2>
          <span className="font-mono text-xs text-ink-faint">
            {capabilities.note}
          </span>
        </header>
      </RevealSection>

      <RevealSection delayMs={80}>
        <div className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h3 className="max-w-xs text-title text-ink">
              {capabilities.headline}
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
              {capabilities.lede}
            </p>
          </div>
        </div>

        <ol className="lg:col-span-8">
          {capabilities.items.map((capability) => (
            <li
              key={capability.id}
              className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-b border-line py-7 first:border-t first:border-line sm:gap-x-8"
            >
              <span className="font-mono text-xs text-ink-faint">
                {capability.index}
              </span>
              <div>
                <h4 className="text-lg font-medium tracking-tight text-ink">
                  {capability.title}
                </h4>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                  {capability.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                  {capability.tools.map((toolName) => (
                    <li
                      key={toolName}
                      className="font-mono text-[11px] text-ink-faint"
                    >
                      {toolName}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        </div>
      </RevealSection>
    </section>
  );
}

/**
 * Experience as an index — periods on the left rail, prose on the right.
 */
export function Experience({ content }: { content: PortfolioContent }) {
  const { experience } = content;

  return (
    <section id="experience" className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
      <RevealSection>
        <header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            {experience.heading}
          </h2>
          <span className="font-mono text-xs text-ink-faint">
            {experience.span}
          </span>
        </header>
      </RevealSection>

      <RevealSection delayMs={80}>
        <ol className="pb-4">
        {experience.items.map((roleEntry) => (
          <li
            key={roleEntry.period}
            className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-line py-7 sm:grid-cols-12"
          >
            <span className="font-mono text-xs text-ink-faint sm:col-span-3">
              {roleEntry.period}
            </span>
            <div className="sm:col-span-4">
              <h3 className="text-base font-medium tracking-tight text-ink">
                {roleEntry.role}
              </h3>
              <p className="mt-0.5 text-sm text-ink-muted">{roleEntry.company}</p>
            </div>
            <p className="text-sm leading-relaxed text-ink-muted sm:col-span-5">
              {roleEntry.description}
            </p>
          </li>
        ))}
        </ol>
      </RevealSection>
    </section>
  );
}
