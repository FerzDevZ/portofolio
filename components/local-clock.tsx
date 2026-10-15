"use client";

import { useEffect, useState } from "react";

function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Live local clock. Renders a stable placeholder on the server and fills in
 * after mount so hydration never mismatches.
 *
 * The time format is deliberately locale-independent (24-hour, `en-GB`): the
 * digits should read the same whichever language the page is in, and the
 * dictionary only supplies the label and the timezone.
 */
export function LocalClock({
  label,
  timeZone,
}: {
  label: string;
  timeZone: string;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date(), timeZone));
    tick();
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, [timeZone]);

  return (
    <span
      title={label}
      className="font-mono text-xs text-ink-faint tabular-nums"
    >
      {time === null ? "--:--" : time} GMT+7
    </span>
  );
}
