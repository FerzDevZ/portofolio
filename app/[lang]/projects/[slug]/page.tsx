import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatTemplate,
  getContent,
  isPublishedLocale,
  localeAlternates,
  localizedPath,
  publishedLocales,
  resolveSiteUrl,
} from "@/lib/content";
import { ogSize } from "@/lib/og-card";
import { Footer } from "@/components/contact";
import { LanguageSwitch } from "@/components/language-switch";
import { SkipLink } from "@/components/skip-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatedMetric } from "@/components/animated-metric";

/** Every case study exists in every published locale, so all are known at build time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.flatMap((lang) =>
    [getContent(lang).featuredProject, ...getContent(lang).projects].map(
      (project) => ({ lang, slug: project.id }),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isPublishedLocale(lang)) return {};

  const content = getContent(lang);
  const project = [content.featuredProject, ...content.projects].find(
    (candidate) => candidate.id === slug,
  );
  if (!project) return {};

  const caseTitle = formatTemplate(content.caseStudyPage.documentTitleTemplate, {
    title: project.title,
  });
  const casePath = localizedPath(lang, project.href);
  /* The page-level `openGraph`/`twitter` objects replace the ones inherited
     from the layout, so the file-convention `opengraph-image` that the home
     page gets for free is not inherited here — a case study would emit no
     `og:image` at all. Naming the generated card explicitly puts the share
     card back on the pages most likely to be shared. */
  const shareImage = {
    url: localizedPath(lang, "/opengraph-image/card"),
    width: ogSize.width,
    height: ogSize.height,
    alt: caseTitle,
  };

  return {
    title: caseTitle,
    description: project.description,
    alternates: {
      canonical: casePath,
      languages: localeAlternates(project.href),
    },
    openGraph: {
      type: "article",
      title: caseTitle,
      description: project.description,
      url: `${resolveSiteUrl(content.site.url)}${casePath}`,
      siteName: content.site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: caseTitle,
      description: project.description,
      images: [shareImage],
    },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isPublishedLocale(lang)) notFound();

  const content = getContent(lang);
  const allProjects = [content.featuredProject, ...content.projects];
  const project = allProjects.find((candidate) => candidate.id === slug);
  if (!project) notFound();

  const labels = content.caseStudyPage;
  const projectPosition = allProjects.findIndex(
    (candidate) => candidate.id === project.id,
  );
  const previousProject = allProjects[projectPosition - 1] ?? null;
  const nextProject = allProjects[projectPosition + 1] ?? null;

  return (
    <>
      <SkipLink label={content.ui.skipToContent} />

      {/* A working bar, not the home page's anchor nav: the pill nav exists to
          jump between home sections, and none of them live on this route. */}
      <header className="safe-area-header border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href={localizedPath(lang)}
            className="flex items-center gap-2.5"
            aria-label={`${content.site.name} — ${labels.backToPortfolioLabel}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-line-strong bg-panel font-mono text-[10px] font-medium text-ink">
              {content.site.initials}
            </span>
            <span className="text-sm font-medium tracking-tight text-ink">
              {content.site.name}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`${localizedPath(lang)}#work`}
              className="inline-flex min-h-6 items-center font-mono text-xs text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              {labels.allWork}
            </Link>
            <LanguageSwitch
              locale={content.locale}
              ui={content.ui}
              currentPath={project.href}
            />
            <ThemeToggle labels={content.ui} />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 sm:px-8">
        <article className="pb-20">
          <header className="pt-16 sm:pt-20">
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
              {formatTemplate(labels.eyebrowTemplate, {
                index: project.index,
              })}
            </p>
            <h1
              className="case-title-rise mt-6 max-w-3xl text-display text-ink"
              style={{ viewTransitionName: `project-title-${project.id}` }}
            >
              {project.title}
            </h1>
            <p className="mt-7 max-w-xl text-lede text-ink-muted">
              {project.description}
            </p>

            <dl className="mt-12 grid grid-cols-1 gap-x-8 border-t border-line sm:grid-cols-3">
              <div className="border-b border-line py-3">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                  {labels.roleLabel}
                </dt>
                <dd className="mt-1 text-sm text-ink-muted">{project.role}</dd>
              </div>
              <div className="border-b border-line py-3">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                  {labels.yearLabel}
                </dt>
                <dd className="mt-1 text-sm text-ink-muted">{project.year}</dd>
              </div>
              <div className="border-b border-line py-3">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                  {labels.stackLabel}
                </dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {project.stack.map((stackEntry) => (
                    <span
                      key={stackEntry}
                      className="rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
                    >
                      {stackEntry}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </header>

          <section className="mt-16">
            <h2 className="border-b border-line pb-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              {labels.contextLabel}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted">
              {project.caseStudy.context}
            </p>
          </section>

          <section className="mt-16">
            <h2 className="border-b border-line pb-4 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              {labels.approachLabel}
            </h2>
            {/* Editorial rows, not cards: a numbered argument reads in order,
                and nothing here needs a border to pretend it is clickable. */}
            <ol>
              {project.caseStudy.approach.map((caseStep, caseStepIndex) => (
                <li
                  key={caseStep.title}
                  className="grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-12 sm:gap-6"
                >
                  <span className="font-mono text-xs text-ink-faint sm:col-span-1">
                    {String(caseStepIndex + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-row text-ink sm:col-span-4">
                    {caseStep.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-muted sm:col-span-7">
                    {caseStep.detail}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-16 grid grid-cols-1 gap-10 border-t border-line pt-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
                {labels.outcomeLabel}
              </h2>
              <p className="mt-5 max-w-md text-lede text-ink">
                {project.caseStudy.outcome}
              </p>
            </div>
            <dl className="lg:col-span-7">
              {project.caseStudy.metrics.map((caseMetric) => (
                <div
                  key={caseMetric.label}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-5 first:border-t first:pt-5"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    {caseMetric.label}
                  </dt>
                  <dd className="font-mono text-title tracking-tight text-ink">
                    <AnimatedMetric value={caseMetric.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <nav
            aria-label={labels.repoLabel}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-8"
          >
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="link-sweep inline-flex min-h-6 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              {labels.repoLabel}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M3.5 8.5L8.5 3.5M4.5 3.5h4v4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="link-sweep inline-flex min-h-6 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted transition-colors duration-150 hover:text-ink"
              >
                {labels.liveLabel}
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8.5L8.5 3.5M4.5 3.5h4v4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ) : null}
          </nav>

          {/* Linear, never wrapping: a case study that loops from the last
              project back to the first reads as an infinite carousel. */}
          {(previousProject || nextProject) && (
            <nav
              aria-label={labels.moreLabel}
              className="mt-20 grid grid-cols-1 border-t border-line sm:grid-cols-2"
            >
              {previousProject ? (
                <Link
                  href={localizedPath(lang, previousProject.href)}
                  className="group border-b border-line py-6 transition-colors duration-150 hover:text-ink sm:border-b-0 sm:pr-8"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    {labels.previousLabel}
                  </span>
                  <span className="mt-2 block text-row text-ink-muted transition-colors duration-150 group-hover:text-ink">
                    {previousProject.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
              {nextProject ? (
                <Link
                  href={localizedPath(lang, nextProject.href)}
                  className="group border-b border-line py-6 transition-colors duration-150 hover:text-ink sm:border-b-0 sm:border-l sm:pl-8 sm:text-right"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    {labels.nextLabel}
                  </span>
                  <span className="mt-2 block text-row text-ink-muted transition-colors duration-150 group-hover:text-ink">
                    {nextProject.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
            </nav>
          )}
        </article>
      </main>

      <Footer content={content} />
    </>
  );
}
