"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  formatTemplate,
  type Certificate,
  type PortfolioContent,
} from "@/lib/content";
import Image from "next/image";
import { RevealSection } from "@/components/reveal-section";
import { CertificateLightbox } from "@/components/certificate-lightbox";

/** Pure client wrapper that tilts the certificate card and opens the lightbox. */
function TiltingFrame({
  enlargeLabel,
  onOpenLightbox,
  children,
}: {
  enlargeLabel: string;
  onOpenLightbox: () => void;
  children: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  /* The rotation goes on the card, not on the frame: the frame is the element
     that declares `perspective`, and `perspective` only applies to its
     children. Writing `transform` on the frame itself projected nothing, so
     the tilt read as a flat skew. */
  const cardRef = useRef<HTMLDivElement | null>(null);
  /* A real drag (picking text, scrolling on touch) must not fire the lightbox;
     only a deliberate click does. */
  const pointerDownAtRef = useRef<{ x: number; y: number } | null>(null);

  /* Bounds keep the tilt tasteful; everything runs through transforms +
     CSS variables, so no layout property is touched and there is no reflow. */
  const handleFramePointerMove = (
    pointerEvent: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const frameElement = frameRef.current;
    const cardElement = cardRef.current;
    if (!frameElement || !cardElement) return;

    const frameRect = frameElement.getBoundingClientRect();
    const xRatio = (pointerEvent.clientX - frameRect.left) / frameRect.width;
    const yRatio = (pointerEvent.clientY - frameRect.top) / frameRect.height;

    const clampedX = Math.min(Math.max(xRatio, 0), 1);
    const clampedY = Math.min(Math.max(yRatio, 0), 1);

    const tiltXDeg = (0.5 - clampedY) * 5;
    const tiltYDeg = (clampedX - 0.5) * 7;

    cardElement.style.transform = `rotateX(${tiltXDeg.toFixed(2)}deg) rotateY(${tiltYDeg.toFixed(2)}deg)`;
    frameElement.style.setProperty("--glare-x", `${(clampedX * 100).toFixed(1)}%`);
    frameElement.style.setProperty("--glare-y", `${(clampedY * 100).toFixed(1)}%`);
  };

  const resetFrameTransform = () => {
    cardRef.current?.style.setProperty(
      "transform",
      "rotateX(0deg) rotateY(0deg)",
    );
  };

  const recordPointerDown = (pointerEvent: ReactPointerEvent<HTMLDivElement>) => {
    /* A right click or a middle click opens the context menu / autoscroll, not
       the lightbox. */
    if (pointerEvent.button !== 0) {
      pointerDownAtRef.current = null;
      return;
    }
    pointerDownAtRef.current = {
      x: pointerEvent.clientX,
      y: pointerEvent.clientY,
    };
  };

  const openWhenClickNotDrag = (pointerEvent: ReactPointerEvent<HTMLDivElement>) => {
    const pointerDownAt = pointerDownAtRef.current;
    pointerDownAtRef.current = null;
    if (!pointerDownAt) return;
    const dragDistancePx = Math.hypot(
      pointerEvent.clientX - pointerDownAt.x,
      pointerEvent.clientY - pointerDownAt.y,
    );
    if (dragDistancePx < 6) onOpenLightbox();
  };

  return (
    <div
      ref={frameRef}
      className="tilt-frame"
      role="button"
      tabIndex={0}
      aria-label={enlargeLabel}
      onPointerMove={handleFramePointerMove}
      onPointerLeave={resetFrameTransform}
      onPointerCancel={() => {
        pointerDownAtRef.current = null;
        resetFrameTransform();
      }}
      onPointerDown={recordPointerDown}
      onPointerUp={openWhenClickNotDrag}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          onOpenLightbox();
        }
      }}
    >
      <div ref={cardRef} className="tilt-card">{children}</div>
      <span aria-hidden="true" className="tilt-glare" />
    </div>
  );
}

function FilledCertificate({
  certificate,
  labels,
  onOpenLightbox,
}: {
  certificate: Certificate;
  labels: PortfolioContent["certificates"];
  onOpenLightbox: (certificate: Certificate) => void;
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
        <TiltingFrame
          enlargeLabel={formatTemplate(labels.enlargeTemplate, labelValues)}
          onOpenLightbox={() => onOpenLightbox(certificate)}
        >
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
        </TiltingFrame>
      </div>
    </article>
  );
}

/**
 * Slots for certificates whose photo has not been shared yet: still drawn, so
 * adding the file later is a data edit, not a layout change.
 */
function ReservedCertificateSlot({
  certificate,
  notice,
}: {
  certificate: Certificate;
  notice: string;
}) {
  return (
    <li className="flex items-baseline gap-5 border-b border-line py-5">
      <span className="font-mono text-xs text-ink-faint">{certificate.index}</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint/60">
        {notice}
      </span>
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
  /* Only the certificates block of the dictionary crosses to the client: the
     case studies and the rest of the prose have no business in this bundle. */
  certificates: PortfolioContent["certificates"];
}) {
  const filled = labels.items.filter(
    (certificate) => certificate.image !== null,
  );
  const reserved = labels.items.filter(
    (certificate) => certificate.image === null,
  );
  const [lightboxCertificate, setLightboxCertificate] =
    useState<Certificate | null>(null);

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
            onOpenLightbox={setLightboxCertificate}
          />
        ))}
        {reserved.length > 0 && (
          <RevealSection delayMs={80}>
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

      <CertificateLightbox
        certificate={lightboxCertificate}
        labels={labels}
        onClose={() => setLightboxCertificate(null)}
      />
    </section>
  );
}
