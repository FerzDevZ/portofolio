import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locale";
import { getContent } from "@/lib/content";
import type { Metadata } from "next";

type ResumePageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: ResumePageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const content = getContent(lang);

  return {
    title: `${content.site.name} — Resume`,
    description: content.site.tagline,
    robots: "noindex, nofollow", // Resume page is for PDF export, not indexing
  };
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = getContent(lang as Locale);
  const { site, experience, capabilities, certificates } = content;

  return (
    <div className="resume-document">
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
        <h2 className="resume-section-heading">Professional Summary</h2>
        <p className="resume-summary">{site.tagline}</p>
        <p className="resume-availability">{site.availability}</p>
      </section>

      {/* Experience */}
      <section className="resume-section">
        <h2 className="resume-section-heading">{experience.heading}</h2>
        {experience.items.map((item, index) => (
          <div key={index} className="resume-experience-item">
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
          .filter((cert) => cert.image !== null)
          .map((cert) => (
            <div key={cert.id} className="resume-certificate-item">
              <div className="resume-certificate-header">
                <h3 className="resume-certificate-title">
                  {cert.placement} {cert.title}
                </h3>
                <span className="resume-certificate-period">{cert.period}</span>
              </div>
              <p className="resume-certificate-issuer">{cert.issuer}</p>
            </div>
          ))}
      </section>
    </div>
  );
}
