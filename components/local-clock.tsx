"use client";

import { useEffect, useState } from "react";

/**
 * e.g. "Asia/Jakarta" → "14:32 GMT+7".
 *
 * `shortOffset` is the canonical `Intl` way to ask for "GMT+7" and is supported
 * by every browser this site targets; the numeric path is only a guard for a
 * runtime that implements `timeZone` but not `shortOffset`.
 */
function formatTime(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const part = (type: string) => parts.find((piece) => piece.type === type)?.value ?? "";
  const zone = part("timeZoneName") || zoneOffsetLabel(timeZone);
  return `${part("hour")}:${part("minute")} ${zone}`;
}

/** "Asia/Jakarta" → "GMT+7". Only used when `shortOffset` is unavailable. */
function zoneOffsetLabel(timeZone: string): string {
  const wallEpoch = (tz: string) =>
    new Date(new Date().toLocaleString("en-US", { timeZone: tz, hour12: false })).getTime();
  const hours = Math.round((wallEpoch(timeZone) - wallEpoch("UTC")) / 3600000);
  return `GMT${hours >= 0 ? "+" : "-"}${Math.abs(hours)}`;
}

/**
 * Live local clock. Renders a stable placeholder on the server and fills in
 * after mount so hydration never mismatches.
 *
 * The time format is deliberately locale-independent (24-hour, `en-GB`): the
 * digits should read the same whichever language the page is in, and the
 * dictionary only supplies the label and the timezone. The zone suffix is
 * derived from the timezone itself — never hard-coded — so a site that ever
 * lists a second city still states the right offset.
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
      {time === null ? "--:--" : time}
    </span>
  );
}
