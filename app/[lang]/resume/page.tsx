import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatTemplate,
  getContent,
  isPublishedLocale,
  localeAlternates,
  localizedPath,
} from "@/lib/content";
import { LanguageSwitch } from "@/components/language-switch";
import { SkipLink } from "@/components/skip-link";
import { ThemeToggle } from "@/components/theme-toggle";

type ResumePageProps = {
  params: Promise<{ lang: string }>;
};

/**
 * The résumé document — what a browser shows at `/resume` and what
 * `GET /api/resume` paginates into a PDF.
 *
 * The chrome (back link, language and theme controls, the PDF download) lives
 * in `.resume-screen-only`, which the print stylesheet removes, so the PDF
 * carries the document and nothing else. The guard is `isPublishedLocale` —
 * the same predicate the PDF route uses — because a locale with a dictionary
 * but no routes must 404 rather than render placeholder copy.
 */
export async function generateMetadata({
  params,
}: ResumePageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isPublishedLocale(lang)) return {};

  const content = getContent(lang);

  return {
    title: formatTemplate(content.resumePage.documentTitleTemplate, {
      name: content.site.name,
    }),
    description: content.site.tagline,
    alternates: {
      canonical: localizedPath(lang, "/resume"),
      languages: localeAlternates("/resume"),
    },
  };
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { lang } = await params;
  if (!isPublishedLocale(lang)) notFound();

  const content = getContent(lang);
  const { site, experience, capabilities, certificates, resumePage } = content;

  return (
    <div className="resume-document">
      <SkipLink label={content.ui.skipToContent} />

      {/* Screen-only chrome: the way back, the page's own controls, and the
          export. `GET /api/resume` paginates this page, so every control on
          this bar must stay out of the print stylesheet. */}
      <div className="resume-screen-only flex flex-wrap items-center justify-between gap-4">
        <Link
          href={localizedPath(lang)}
          className="resume-back-link"
          aria-label={site.name}
        >
          {site.initials} — {site.name}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitch
            locale={content.locale}
            ui={content.ui}
            currentPath="/resume"
          />
          <ThemeToggle labels={content.ui} />
          <a
            href={`/api/resume?lang=${lang}`}
            className="resume-back-link"
            download
          >
            {resumePage.downloadLabel}
          </a>
        </div>
      </div>

      <main id="main">
        {/* Header */}
        <header className="resume-header">
          <h1 className="resume-name">{site.name}</h1>
          <p className="resume-role">{site.role}</p>
          <div className="resume-contact">
            <span>{site.email}</span>
            <span>{site.location}</span>
            <span>{site.url}</span>
          </div>
        </header>

        {/* Professional Summary */}
        <section className="resume-section">
          <h2 className="resume-section-heading">{resumePage.summaryHeading}</h2>
          <p className="resume-summary">{site.tagline}</p>
          <p className="resume-availability">{site.availability}</p>
        </section>

        {/* Experience */}
        <section className="resume-section">
          <h2 className="resume-section-heading">{experience.heading}</h2>
          {experience.items.map((item) => (
            <div key={item.period} className="resume-experience-item">
              <div className="resume-experience-header">
                <h3 className="resume-experience-role">{item.role}</h3>
                <span className="resume-experience-period">{item.period}</span>
              </div>
              <p className="resume-experience-company">{item.company}</p>
              <p className="resume-experience-description">{item.description}</p>
            </div>
          ))}
        </section>

        {/* Capabilities */}
        <section className="resume-section">
          <h2 className="resume-section-heading">{capabilities.heading}</h2>
          {capabilities.items.map((capability) => (
            <div key={capability.id} className="resume-capability-item">
              <h3 className="resume-capability-title">{capability.title}</h3>
              <p className="resume-capability-description">
                {capability.description}
              </p>
              <p className="resume-capability-tools">
                {capability.tools.join(" · ")}
              </p>
            </div>
          ))}
        </section>

        {/* Certificates */}
        <section className="resume-section">
          <h2 className="resume-section-heading">{certificates.heading}</h2>
          {certificates.items
            .filter((certificate) => certificate.image !== null)
            .map((certificate) => (
              <div key={certificate.id} className="resume-certificate-item">
                <div className="resume-certificate-header">
                  <h3 className="resume-certificate-title">
                    {certificate.placement} {certificate.title}
                  </h3>
                  <span className="resume-certificate-period">
                    {certificate.period}
                  </span>
                </div>
                <p className="resume-certificate-issuer">{certificate.issuer}</p>
              </div>
            ))}
        </section>
      </main>
    </div>
  );
}
