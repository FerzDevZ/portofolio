"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  formatTemplate,
  type Certificate,
  type PortfolioContent,
} from "@/lib/content";

/** The strings the lightbox needs, already translated for the active locale. */
export type CertificateLightboxLabels = Pick<
  PortfolioContent["certificates"],
  "dialogTemplate" | "imageAltTemplate" | "closeLabel"
>;

/**
 * Full-screen lightbox for certificate photos.
 *
 * Accessibility contract:
 * - `role="dialog"` + `aria-modal` on the overlay, labelled by the
 *   certificate title.
 * - Escape closes; a pointer press on the backdrop (the overlay itself, not
 *   the image) closes.
 * - Focus moves to the close button on open and returns to the opener on
 *   close; Tab is trapped inside the overlay while it is open.
 * - Body scroll freezes while open so the page cannot slide under it.
 */
export function CertificateLightbox({
  certificate,
  labels,
  onClose,
}: {
  certificate: Certificate | null;
  labels: CertificateLightboxLabels;
  onClose: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!certificate) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };

    /* Keep the keyboard cycling inside the overlay while it is open. */
    const trapFocus = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== "Tab") return;
      const focusableCandidates = overlayRef.current?.querySelectorAll<
        HTMLButtonElement | HTMLAnchorElement
      >("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (!focusableCandidates || focusableCandidates.length === 0) return;
      const focusable = Array.from(focusableCandidates).filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement;
      if (keyboardEvent.shiftKey && active === first) {
        keyboardEvent.preventDefault();
        last?.focus();
      } else if (!keyboardEvent.shiftKey && active === last) {
        keyboardEvent.preventDefault();
        first?.focus();
      }
    };

    const scrollYBeforeOpen = window.scrollY;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("keydown", trapFocus);
    // Focus close button on open
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("keydown", trapFocus);
      window.scrollTo(0, scrollYBeforeOpen);
      // Restore focus
      previouslyFocusedRef.current?.focus();
    };
  }, [certificate, onClose]);

  if (!certificate) return null;

  const placement = certificate.placement ?? "";
  const title = certificate.title ?? "";
  const issuer = certificate.issuer ?? "";
  const image = certificate.image ?? "";
  const hasIntrinsicDimensions =
    certificate.imageWidth > 0 && certificate.imageHeight > 0;
  const imageAlt = formatTemplate(labels.imageAltTemplate, {
    placement,
    title,
    issuer,
  });

  const handleBackdropPointerDown = (pointerEvent: React.PointerEvent) => {
    if (pointerEvent.target === pointerEvent.currentTarget) onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={formatTemplate(labels.dialogTemplate, { placement, title })}
      className="lightbox-overlay"
      onPointerDown={handleBackdropPointerDown}
    >
      <header className="lightbox-head">
        <p className="lightbox-caption font-mono">
          {placement} — {title}
          <span className="text-ink-muted"> · {issuer}</span>
        </p>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label={labels.closeLabel}
          className="lightbox-close"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>
      <figure className="lightbox-figure">
        <Image
          src={image}
          alt={imageAlt}
          width={hasIntrinsicDimensions ? certificate.imageWidth : 1600}
          height={hasIntrinsicDimensions ? certificate.imageHeight : 1131}
          sizes="(max-width: 1024px) 100vw, 88vw"
          className="lightbox-image"
        />
      </figure>
    </div>
  );
}
