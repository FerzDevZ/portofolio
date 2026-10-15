import {
  formatTemplate,
  localizedPath,
  type PortfolioContent,
  type Project,
} from "@/lib/content";
import { RevealSection } from "@/components/reveal-section";
import {
  AnimatedMetric,
  TiltPanel,
} from "@/components/animated-metric";

function ProjectRow({
  project,
  content,
}: {
  project: Project;
  content: PortfolioContent;
}) {
  return (
    <li>
      <a
        href={localizedPath(content.locale, project.href)}
        className="group grid grid-cols-1 items-baseline gap-x-6 gap-y-2 border-b border-line py-6 transition-colors duration-150 hover:bg-ink/[0.02] sm:grid-cols-12 sm:px-2"
      >
        <span className="font-mono text-xs text-ink-faint sm:col-span-1">
          {project.index}
        </span>

        <span className="sm:col-span-4">
          <span className="text-row text-ink transition-transform duration-200 ease-out group-hover:translate-x-1 inline-block">
            {project.title}
          </span>
          <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {project.role}
          </span>
        </span>

        <span className="text-sm leading-relaxed text-ink-muted sm:col-span-4">
          {project.description}
        </span>

        <span className="flex flex-wrap items-center gap-2 sm:col-span-2">
          {project.stack.map((stackEntry) => (
            <span
              key={stackEntry}
              className="rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
            >
              {stackEntry}
            </span>
          ))}
        </span>

        <span className="flex items-center justify-between font-mono text-xs text-ink-faint sm:col-span-1 sm:justify-end sm:gap-3">
          {project.year}
          {/* These rows lead to an in-site case study, so the affordance is a
              forward arrow rather than the outbound diagonal. */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          >
            <path
              d="M2.5 6h7M6.5 3l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </li>
  );
}

/**
 * Selected work: one featured split panel, then editorial index rows —
 * a list, not a grid of identical cards.
 */
export function Work({ content }: { content: PortfolioContent }) {
  const { work, featuredProject, projects } = content;
  const featuredHref = localizedPath(content.locale, featuredProject.href);

  return (
    <section id="work" className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
      <RevealSection>
        <header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            {work.heading}
          </h2>
          <span className="font-mono text-xs text-ink-faint">
            {formatTemplate(work.countTemplate, {
              count: projects.length + 1,
            })}
          </span>
        </header>
      </RevealSection>

      <RevealSection delayMs={80}>
        <article className="group grid grid-cols-1 gap-8 border-b border-line py-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            {work.featuredLabel}
          </p>
          <h3 className="text-title text-ink">
            <a href={featuredHref} className="link-sweep decoration-transparent">
              {featuredProject.title}
            </a>
          </h3>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {featuredProject.role}
          </p>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
            {featuredProject.description}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {featuredProject.stack.map((stackEntry) => (
              <li
                key={stackEntry}
                className="rounded-[4px] border border-line bg-panel px-2 py-1 font-mono text-[10px] text-ink-muted"
              >
                {stackEntry}
              </li>
            ))}
          </ul>
          <a
            href={featuredHref}
            className="link-sweep mt-7 inline-flex min-h-6 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            {work.readCaseStudy}
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
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Abstract case panel — mono grid, no stock imagery. Its figure is the
            headline metric of the featured case study, from the same data the
            case study page renders, so the two can never disagree. Hover gives
            it a real 3D diorama: grid plane behind, metric forward, a specular
            sweep that follows the pointer. */}
        <TiltPanel classNameWrapper="lg:col-span-5">
          <div className="tilt-panel-plane relative flex min-h-56 items-end overflow-hidden rounded-lg border border-line bg-panel p-5">
            <div
              aria-hidden="true"
              className="tilt-depth-grid absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/10 blur-3xl"
            />
            <div className="relative flex w-full items-end justify-between">
              <AnimatedMetric
                value={featuredProject.caseStudy.metrics[0]?.value ?? ""}
                className="font-mono text-6xl font-medium tracking-tighter text-ink/90"
              />
              <span className="tilt-depth-metric max-w-28 text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
                {featuredProject.caseStudy.metrics[0]?.label}
              </span>
            </div>
            <span aria-hidden="true" className="tilt-panel-glare" />
          </div>
        </TiltPanel>
      </article>
      </RevealSection>

      <RevealSection delayMs={140}>
        <ul>
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} content={content} />
          ))}
        </ul>
      </RevealSection>
    </section>
  );
}
