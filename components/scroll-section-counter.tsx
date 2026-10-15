"use client";

import { useEffect, useState } from "react";
import { formatTemplate, type NavItem } from "@/lib/content";

/**
 * Section counter that rides beside the scroll progress bar: "01 / 05".
 *
 * It does not run a scroll listener of its own. The header already resolves
 * the active section every frame; it publishes that id onto
 * `data-active-section` on its top bar, and this component only watches that
 * attribute with a MutationObserver. One observer, no duplicated measurement.
 *
 * Decorative by design: the header's nav already announces the active section
 * through `aria-current`, so this duplicates that information visually and is
 * hidden from assistive technology rather than read twice.
 */
export function ScrollSectionCounter({
  nav,
  template,
}: {
  nav: NavItem[];
  template: string;
}) {
  const sectionIds = nav
    .map((navEntry) => navEntry.href.replace(/^#/, ""))
    .filter((sectionId) => sectionId !== "top");

  /* 0 means "above the first section" — the counter hides there. */
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const headerProbe = document.querySelector("[data-active-section]");
    if (!headerProbe) return;

    const readActiveIndex = () => {
      const activeId = headerProbe.getAttribute("data-active-section") ?? "";
      const foundIndex = sectionIds.indexOf(activeId);
      setActiveIndex(foundIndex === -1 ? 0 : foundIndex);
    };

    readActiveIndex();
    const attributeObserver = new MutationObserver(readActiveIndex);
    attributeObserver.observe(headerProbe, {
      attributes: true,
      attributeFilter: ["data-active-section"],
    });
    return () => attributeObserver.disconnect();
    // sectionIds is derived from nav on every render; nav is the real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  const total = String(sectionIds.length).padStart(2, "0");
  const counterText = formatTemplate(template, {
    current: String(activeIndex + 1).padStart(2, "0"),
    total,
  });

  return (
    <p
      aria-hidden="true"
      className="scroll-section-counter"
      data-visible={activeIndex > 0}
    >
      {counterText}
    </p>
  );
}