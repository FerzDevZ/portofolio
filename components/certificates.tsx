import Image from "next/image";
import {
  formatTemplate,
  type Certificate,
  type PortfolioContent,
} from "@/lib/content";
import { RevealSection } from "@/components/reveal-section";
import { CertificateInteractions } from "@/components/certificate-interactions";

/**
 * One published certificate: the facts on the left axis, the photo in a
 * perspective frame on the right.
 *
 * This half is a server component on purpose. The frame is only a hook for
 * `CertificateInteractions` (`[data-certificate-tilt]` for the id, `.tilt-card`
 * for the element that rotates) — every pointer handler lives there, delegated
 * from `document`. Rendering the rows here keeps four `next/image` boundaries
 * and their text out of the hydration tree.
 */
function FilledCertificate({
  certificate,
  labels,
}: {
  certificate: Certificate;
  labels: PortfolioContent["certificates"];
}) {
  /* These fields are only null on the reserved slots, which are rendered by
     ReservedCertificateSlot — this component is only reached when they exist. */
  const placement = certificate.placement ?? "";
  const title = certificate.title ?? "";
  const issuer = certificate.issuer ?? "";
  const period = certificate.period ?? "";
  const image = certificate.image ?? "";
  const hasIntrinsicDimensions =
    certificate.imageWidth > 0 && certificate.imageHeight > 0;
  const labelValues = { placement, title, issuer };

  return (
    <article className="grid grid-cols-1 gap-8 border-b border-line py-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <p className="font-mono text-xs text-ink-faint">{certificate.index}</p>
        <h3 className="mt-3 text-section text-ink">
          {placement}{" "}
          <span className="text-ink-faint">{title}</span>
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
          {issuer}
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          {period}
        </p>
      </div>
      <div className="lg:col-span-7">
        <div
          className="tilt-frame"
          role="button"
          tabIndex={0}
          aria-label={formatTemplate(labels.enlargeTemplate, labelValues)}
          data-certificate-tilt={certificate.id}
        >
          <div className="tilt-card">
            <div className="overflow-hidden rounded-lg border border-line bg-panel shadow-[0_16px_48px_-24px_var(--color-shadow-soft)]">
              <Image
                src={image}
                alt={formatTemplate(labels.imageAltTemplate, labelValues)}
                width={hasIntrinsicDimensions ? certificate.imageWidth : 1600}
                height={hasIntrinsicDimensions ? certificate.imageHeight : 1131}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="h-auto w-full"
                priority={certificate.index === "01"}
              />
            </div>
          </div>
          <span aria-hidden="true" className="tilt-glare" />
        </div>
      </div>
    </article>
  );
}

/**
 * Slots for certificates whose photo has not been shared yet: still drawn, so
 * adding the file later is a data edit, not a layout change.
 *
 * The dashed frame gives the row the same hover acknowledgement its filled
 * siblings get, without claiming to be clickable — there is nothing to open
 * yet, so it stays out of the tab order and the accessibility tree carries
 * only the text.
 */
function ReservedCertificateSlot({
  certificate,
  notice,
}: {
  certificate: Certificate;
  notice: string;
}) {
  return (
    <li className="border-b border-line py-3">
      <div className="group/reserved flex items-center gap-5 rounded-lg border border-dashed border-line px-4 py-3 transition-colors duration-150 group-hover/reserved:border-line-strong">
        <span className="font-mono text-xs text-ink-faint">
          {certificate.index}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint/70 transition-colors duration-150 group-hover/reserved:text-ink-muted">
          {notice}
        </span>
      </div>
    </li>
  );
}

/**
 * Certificates: one filled certificate in a split editorial layout, then the
 * reserved slots as a plain index — never a grid of identical cards. Every
 * filled certificate opens a full-screen lightbox when clicked.
 */
export function Certificates({
  certificates: labels,
}: {
  /* Only the certificates block of the dictionary arrives: the case studies
     and the rest of the prose have no business in this component. */
  certificates: PortfolioContent["certificates"];
}) {
  const filled = labels.items.filter(
    (certificate) => certificate.image !== null,
  );
  const reserved = labels.items.filter(
    (certificate) => certificate.image === null,
  );
  /* The lightbox is the only client-side consumer, so it gets exactly the
     three strings and the published rows it can act on. */
  const lightboxLabels = {
    dialogTemplate: labels.dialogTemplate,
    imageAltTemplate: labels.imageAltTemplate,
    closeLabel: labels.closeLabel,
  };

  return (
    <section id="certificates" className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
      <RevealSection>
        <header className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            {labels.heading}
          </h2>
          <span className="font-mono text-xs text-ink-faint">
            {formatTemplate(labels.publishedTemplate, {
              published: filled.length,
              total: labels.items.length,
            })}
          </span>
        </header>
      </RevealSection>

      <div className="pb-4">
        {filled.map((certificate) => (
          <FilledCertificate
            key={certificate.id}
            certificate={certificate}
            labels={labels}
          />
        ))}
        {reserved.length > 0 && (
          <RevealSection>
            <ul>
              {reserved.map((certificate) => (
                <ReservedCertificateSlot
                  key={certificate.id}
                  certificate={certificate}
                  notice={labels.reservedNotice}
                />
              ))}
            </ul>
          </RevealSection>
        )}
      </div>

      <CertificateInteractions
        certificates={filled}
        labels={lightboxLabels}
      />
    </section>
  );
}
