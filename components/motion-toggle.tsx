"use client";

import { useEffect, useState } from "react";

/** Storage key and root class shared with the hero loader. */
export const MOTION_STORAGE_KEY = "portfolio-3d-motion";
export const MOTION_OFF_CLASS = "motion-3d-off";

/**
 * A visitor-controlled switch for the hero's 3D relief. It sits in the footer
 * so it is always reachable, and its choice survives reloads. Turning motion
 * off adds a class on <html> that the loader reads before it mounts the scene,
 * so the static poster is what renders.
 *
 * The switch is a real <button> with aria-pressed, not a styled link: its
 * state must be announced to assistive technology.
 */
export function MotionToggle({
  label,
  onLabel,
  offLabel,
}: {
  label: string;
  onLabel: string;
  offLabel: string;
}) {
  const [isMotionOn, setIsMotionOn] = useState(true);

  useEffect(() => {
    const savedChoice = window.localStorage.getItem(MOTION_STORAGE_KEY);
    setIsMotionOn(savedChoice !== "off");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(MOTION_OFF_CLASS, !isMotionOn);
  }, [isMotionOn]);

  const handleToggle = () => {
    const nextIsOn = !isMotionOn;
    window.localStorage.setItem(MOTION_STORAGE_KEY, nextIsOn ? "on" : "off");
    setIsMotionOn(nextIsOn);
  };

  return (
    <button
      type="button"
      aria-pressed={isMotionOn}
      onClick={handleToggle}
      className="inline-flex min-h-6 items-center gap-2 font-mono text-[11px] text-ink-faint transition-colors duration-150 hover:text-ink"
    >
      <span>{label}</span>
      <span className="text-ink-muted">{isMotionOn ? onLabel : offLabel}</span>
    </button>
  );
}
