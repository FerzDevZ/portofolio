"use client";

import { useEffect, useState } from "react";
import { formatTemplate } from "@/lib/content";

/**
 * The copyright line, with a year that stays correct after New Year.
 *
 * Every page on this site is static, so `new Date().getFullYear()` in the
 * footer is evaluated once, at build time, and would keep claiming the build
 * year until the next deploy. Rendering that value on the server and
 * correcting it after mount keeps the first paint truthful without a
 * hydration mismatch: the first client render matches the server, and the
 * effect only changes anything when the calendar has actually moved.
 */
export function CopyrightLine({
  template,
  name,
  buildYear,
}: {
  template: string;
  name: string;
  buildYear: number;
}) {
  const [year, setYear] = useState(buildYear);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (currentYear !== buildYear) setYear(currentYear);
  }, [buildYear]);

  return (
    <p className="font-mono text-[11px] text-ink-faint">
      {formatTemplate(template, { year, name })}
    </p>
  );
}
