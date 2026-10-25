"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Certificate } from "@/lib/content";
import {
  CertificateLightbox,
  type CertificateLightboxLabels,
} from "@/components/certificate-lightbox";

const TILT_FRAME_SELECTOR = "[data-certificate-tilt]";
/* A press that travels further than this is a drag (text selection, touch
   scroll), not a click on the credential. */
const DRAG_TOLERANCE_PX = 6;
const POINTER_LEAVE_EVENT = "pointerout";

type TiltedFrame = {
  frame: HTMLElement;
  /* The rotation goes on the card, not on the frame: the frame is the element
     that declares `perspective`, and `perspective` only applies to its
     children. Writing `transform` on the frame itself projects nothing. */
  card: HTMLElement;
};

function clampedRatio(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function findTiltedFrame(target: EventTarget | null): TiltedFrame | null {
  if (!(target instanceof Element)) return null;
  const frame = target.closest<HTMLElement>(TILT_FRAME_SELECTOR);
  if (!frame) return null;
  const card = frame.querySelector<HTMLElement>(".tilt-card");
  return card ? { frame, card } : null;
}

function resetTilt(tiltedFrame: TiltedFrame | null): void {
  tiltedFrame?.card.style.setProperty(
    "transform",
    "rotateX(0deg) rotateY(0deg)",
  );
}

function tiltTowardPointer(
  tiltedFrame: TiltedFrame,
  clientX: number,
  clientY: number,
): void {
  const frameRect = tiltedFrame.frame.getBoundingClientRect();
  const xRatio = clampedRatio((clientX - frameRect.left) / frameRect.width);
  const yRatio = clampedRatio((clientY - frameRect.top) / frameRect.height);

  tiltedFrame.card.style.transform = `rotateX(${(
    (0.5 - yRatio) *
    5
  ).toFixed(2)}deg) rotateY(${((xRatio - 0.5) * 7).toFixed(2)}deg)`;
  tiltedFrame.frame.style.setProperty("--glare-x", `${(xRatio * 100).toFixed(1)}%`);
  tiltedFrame.frame.style.setProperty("--glare-y", `${(yRatio * 100).toFixed(1)}%`);
}

/**
 * The interactive half of the certificates section: pointer-tracked tilt and
 * the full-screen lightbox.
 *
 * The certificate rows themselves are server-rendered by `Certificates`, which
 * is why this file exists at all: hydrating four image-bearing articles to
 * make them tilt was the single largest client component on the page. The
 * markup keeps the hooks this component needs — `[data-certificate-tilt]` on
 * the perspective frame and `.tilt-card` inside it — and every event is
 * delegated from `document`, so there is no per-row React listener.
 */
export function CertificateInteractions({
  certificates,
  labels,
}: {
  /* Only the published certificates travel to the client: the lightbox needs
     them, and the section's prose stays on the server. */
  certificates: Certificate[];
  labels: CertificateLightboxLabels;
}) {
  const [openCertificate, setOpenCertificate] = useState<Certificate | null>(
    null,
  );
  const activeTiltRef = useRef<TiltedFrame | null>(null);
  const pressRef = useRef<{
    x: number;
    y: number;
    frame: HTMLElement;
  } | null>(null);

  const openCertificateById = useCallback(
    (certificateId: string) => {
      const matchedCertificate = certificates.find(
        (certificate) => certificate.id === certificateId,
      );
      if (matchedCertificate) setOpenCertificate(matchedCertificate);
    },
    [certificates],
  );

  const closeLightbox = useCallback(() => setOpenCertificate(null), []);

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      const tiltedFrame = findTiltedFrame(pointerEvent.target);
      /* Leaving one frame for another (or for the page) drops the tilt it had,
         the same way the per-frame `pointerleave` handler used to. */
      if (
        activeTiltRef.current &&
        activeTiltRef.current.frame !== tiltedFrame?.frame
      ) {
        resetTilt(activeTiltRef.current);
        activeTiltRef.current = null;
      }
      if (!tiltedFrame) return;
      if (!finePointer.matches || reducedMotion.matches) return;
      activeTiltRef.current = tiltedFrame;
      tiltTowardPointer(tiltedFrame, pointerEvent.clientX, pointerEvent.clientY);
    };

    const handlePointerDown = (pointerEvent: PointerEvent) => {
      const tiltedFrame = findTiltedFrame(pointerEvent.target);
      /* A right click or a middle click opens the context menu / autoscroll,
         not the lightbox. */
      if (!tiltedFrame || pointerEvent.button !== 0) {
        pressRef.current = null;
        return;
      }
      pressRef.current = {
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
        frame: tiltedFrame.frame,
      };
    };

    const handlePointerUp = (pointerEvent: PointerEvent) => {
      const press = pressRef.current;
      pressRef.current = null;
      if (!press) return;
      const tiltedFrame = findTiltedFrame(pointerEvent.target);
      if (!tiltedFrame || tiltedFrame.frame !== press.frame) return;
      const dragDistance = Math.hypot(
        pointerEvent.clientX - press.x,
        pointerEvent.clientY - press.y,
      );
      if (dragDistance >= DRAG_TOLERANCE_PX) return;
      openCertificateById(
        tiltedFrame.frame.dataset.certificateTilt ?? "",
      );
    };

    const handlePointerCancel = () => {
      pressRef.current = null;
      resetTilt(activeTiltRef.current);
      activeTiltRef.current = null;
    };

    const handlePointerOut = (pointerEvent: PointerEvent) => {
      /* `relatedTarget === null` means the pointer left the window, which is
         the only case a delegated `pointermove` cannot see. */
      if (pointerEvent.relatedTarget === null) handlePointerCancel();
    };

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
      const tiltedFrame = findTiltedFrame(keyboardEvent.target);
      if (!tiltedFrame) return;
      keyboardEvent.preventDefault();
      openCertificateById(
        tiltedFrame.frame.dataset.certificateTilt ?? "",
      );
    };

    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    document.addEventListener("pointercancel", handlePointerCancel, true);
    document.addEventListener(POINTER_LEAVE_EVENT, handlePointerOut, true);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handlePointerCancel);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener("pointercancel", handlePointerCancel, true);
      document.removeEventListener(POINTER_LEAVE_EVENT, handlePointerOut, true);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handlePointerCancel);
      resetTilt(activeTiltRef.current);
      activeTiltRef.current = null;
    };
  }, [openCertificateById]);

  return (
    <CertificateLightbox
      certificate={openCertificate}
      labels={labels}
      onClose={closeLightbox}
    />
  );
}
