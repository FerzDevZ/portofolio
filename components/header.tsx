"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatTemplate,
  type Locale,
  type NavItem,
  type PortfolioContent,
} from "@/lib/content";
import { LocalClock } from "@/components/local-clock";
import { OfflineIndicator } from "@/components/offline-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitch } from "@/components/language-switch";
import { SkipLink } from "@/components/skip-link";
import { ScrollSectionCounter } from "@/components/scroll-section-counter";

/**
 * The slice of the dictionary the header actually renders.
 *
 * A client component's props are serialised into the RSC payload, so this is
 * deliberately not the whole `PortfolioContent`: nothing here needs the case
 * studies or the certificate list, and sending them would ship kilobytes of
 * prose for a nav bar.
 */
export type HeaderContent = {
  locale: Locale;
  nav: NavItem[];
  site: Pick<PortfolioContent["site"], "name" | "initials" | "timezone">;
  /* Everything the header renders except the 404 copy, which belongs to a
     boundary this component never sees. */
  ui: Omit<PortfolioContent["ui"], "notFound">;
};

/**
 * Finds which in-page section currently owns the viewport.
 *
 * A section owns the viewport when its top is at or above one third from the
 * top — late enough that the section title has cleared the header, early
 * enough that its content still fills most of the screen. The last section
 * whose top has passed that line wins; before any of them, nothing is active.
 */
function readActiveSectionId(navEntries: NavItem[]): string | null {
  const sectionIds = navEntries
    .map((navEntry) => navEntry.href.replace(/^#/, ""))
    .filter((sectionId) => sectionId !== "top");

  let leadingSectionId: string | null = null;
  for (const sectionId of sectionIds) {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) continue;
    if (sectionElement.getBoundingClientRect().top <= window.innerHeight / 3) {
      leadingSectionId = sectionId;
    }
  }
  return leadingSectionId;
}

/**
 * Floating pill nav with an active-section indicator, a scroll progress bar,
 * and a scrolled-state border. Everything measures once per frame at most
 * (rAF-throttled) and every visual change is transform/opacity only.
 */
export function Header({ locale, nav, site, ui }: HeaderContent) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  /*
   * An open drawer owns the screen, so the rest of the document has to stop
   * being reachable. `inert` on the two landmarks behind the scrim is what
   * actually does that — the scrim only stops the pointer. Focus moves into
   * the panel on open and returns to the toggle on close, so a keyboard user
   * never has to hunt for where they were.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const menuButton = menuButtonRef.current;
    const landmarksBehindScrim = [
      document.getElementById("main"),
      document.querySelector("footer"),
    ].filter((landmark): landmark is HTMLElement => landmark !== null);

    for (const landmark of landmarksBehindScrim) {
      landmark.setAttribute("inert", "");
    }

    mobileNavRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => {
      for (const landmark of landmarksBehindScrim) {
        landmark.removeAttribute("inert");
      }
      menuButton?.focus();
    };
  }, [menuOpen]);

  /*
   * While the panel is open it owns the screen: the page behind it must not
   * scroll under the thumb, which on Android is the difference between a menu
   * and a menu you fight with. The lock is released on close, on a link tap,
   * and on the desktop breakpoint, where the panel is not rendered at all.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const desktopViewport = window.matchMedia("(min-width: 768px)");
    const closeAtDesktopWidth = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktopViewport.addEventListener("change", closeAtDesktopWidth);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      desktopViewport.removeEventListener("change", closeAtDesktopWidth);
    };
  }, [menuOpen]);

  useEffect(() => {
    let frameId: number | null = null;

    const readViewportState = () => {
      frameId = null;
      setActiveSectionId(readActiveSectionId(nav));
    };

    const scheduleViewportState = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(readViewportState);
    };

    readViewportState();
    window.addEventListener("scroll", scheduleViewportState, { passive: true });
    window.addEventListener("resize", scheduleViewportState);
    return () => {
      window.removeEventListener("scroll", scheduleViewportState);
      window.removeEventListener("resize", scheduleViewportState);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [nav]);

  /* Scroll progress: scaleX on a fixed bar is compositor-only work. */
  useEffect(() => {
    const progressBar = document.getElementById("scroll-progress");
    if (!progressBar) return;

    let frameId: number | null = null;

    const readProgress = () => {
      frameId = null;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableRange = documentHeight - window.innerHeight;
      const progress = scrollableRange > 0 ? window.scrollY / scrollableRange : 0;
      const clampedProgress = Math.min(Math.max(progress, 0), 1);
      progressBar.style.transform = `scaleX(${clampedProgress})`;
      progressBar.style.opacity = clampedProgress > 0.01 ? "1" : "0";
      if (clampedProgress <= 0.01) {
        progressBar.style.transform = "scaleX(0)";
      }
    };

    const scheduleProgress = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(readProgress);
    };

    readProgress();
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    return () => {
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  /* The active pill slides to the currently highlighted link. Measured here,
     positioned with CSS variables — the links themselves never re-render.
     Re-measured on resize, because the nav's geometry changes at the `md`
     breakpoint even while the active section stays the same. */
  const [activePill, setActivePill] = useState<{ x: number; width: number } | null>(
    null,
  );

  useEffect(() => {
    const desktopNav = desktopNavRef.current;
    if (!desktopNav) return;

    const measureActivePill = () => {
      if (!activeSectionId) {
        setActivePill(null);
        return;
      }
      const activeLink = desktopNav.querySelector<HTMLAnchorElement>(
        `a[href="#${activeSectionId}"]`,
      );
      if (!activeLink) {
        setActivePill(null);
        return;
      }
      const navLeft = desktopNav.getBoundingClientRect().left;
      const linkRect = activeLink.getBoundingClientRect();
      setActivePill({ x: linkRect.left - navLeft, width: linkRect.width });
    };

    measureActivePill();
    window.addEventListener("resize", measureActivePill);
    /* The pill is measured against the rendered label widths, and Geist is a
       webfont: a swap after the first measurement shifts every link and leaves
       the pill a few pixels off until something else triggers a re-measure. */
    void document.fonts?.ready.then(measureActivePill);
    return () => window.removeEventListener("resize", measureActivePill);
  }, [activeSectionId]);

  return (
    <>
      <SkipLink label={ui.skipToContent} />
      <div
        aria-hidden="true"
        id="scroll-progress"
        className="scroll-progress"
      />

      {/* Tapping the page behind the open panel dismisses it. Kept out of the
          tab order and out of the accessibility tree: Escape and the toggle
          button are the accessible ways to close. */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-canvas/80 backdrop-blur-sm transition-opacity duration-200 ease-out md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <header
        data-active-section={activeSectionId ?? ""}
        className={`safe-area-header fixed inset-x-0 top-0 z-50 ${
          /* The open menu needs to block out the page behind it — the header
             and the panel share one background so it reads as one sheet. */
          menuOpen ? "bg-canvas" : ""
        }`}
      >
        {/* Rides just under the bar, aligned with the progress hairline. Reads
            the active section from this header's data attribute rather than
            measuring scroll again. */}
        <ScrollSectionCounter
          nav={nav}
          template={ui.sectionProgressTemplate}
        />
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label={formatTemplate(ui.brandBackToTopTemplate, {
              name: site.name,
            })}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-line-strong bg-panel font-mono text-[10px] font-medium text-ink">
              {site.initials}
            </span>
            <span className="text-sm font-medium tracking-tight text-ink">
              {site.name}
            </span>
          </a>

          <div
            ref={desktopNavRef}
            className="relative hidden md:block"
          >
            <nav aria-label={ui.primaryNavLabel} className="nav-pill">
              {nav.map((navEntry) => (
                <a
                  key={navEntry.href}
                  href={navEntry.href}
                  data-active={activeSectionId === navEntry.href.replace(/^#/, "")}
                  /* Same state the mobile rows announce: on desktop the only
                     other cue is colour, which is not a cue at all for a
                     screen reader. */
                  aria-current={
                    activeSectionId === navEntry.href.replace(/^#/, "")
                      ? "true"
                      : undefined
                  }
                  className="nav-link"
                >
                  {navEntry.label}
                </a>
              ))}
            </nav>
            {activePill !== null && (
              <span
                aria-hidden="true"
                className="nav-active-pill"
                style={{
                  width: `${activePill.width}px`,
                  "--nav-pill-x": `${activePill.x}px`,
                } as React.CSSProperties}
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <OfflineIndicator
              chipLabel={ui.offlineChip}
              announcement={ui.offlineAnnouncement}
            />

            <span className="hidden items-center gap-2 sm:flex">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-live shadow-[0_0_6px_var(--color-live)]"
              />
              <LocalClock label={ui.clockLabel} timeZone={site.timezone} />
            </span>

            {/* The pill is hidden below `sm`, where the header row has no room
                for it; the language row in the panel below takes over there. */}
            <span className="hidden sm:flex">
              <LanguageSwitch locale={locale} ui={ui} />
            </span>

            <ThemeToggle labels={ui} />

            <button
              ref={menuButtonRef}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel/60 text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? ui.closeMenu : ui.openMenu}
              onClick={() => setMenuOpen((wasOpen) => !wasOpen)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M1 3.5h12M1 10.5h12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        <nav
          ref={mobileNavRef}
          id="mobile-nav"
          aria-label={ui.mobileNavLabel}
          aria-hidden={!menuOpen}
          inert={!menuOpen}
          className={`overflow-y-auto bg-canvas transition-[max-height,opacity] duration-200 ease-out md:hidden ${
            menuOpen
              ? "max-h-[calc(100dvh-3.5rem)] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          {/* A column of rows, not a run of inline links: each entry is a full
              width block, so its tap target is its own row and never overlaps
              the one above it. */}
          <ul
            className={`mx-auto flex max-w-6xl list-none flex-col px-5 pb-3 sm:px-8 ${
              menuOpen ? "border-b border-line-strong" : ""
            }`}
          >
            {nav.map((navEntry, navIndex) => (
              <li key={navEntry.href} className="border-b border-line last:border-b-0">
                <a
                  href={navEntry.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={
                    activeSectionId === navEntry.href.replace(/^#/, "")
                      ? "true"
                      : undefined
                  }
                  className="flex items-center justify-between gap-4 py-3.5 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                >
                  {navEntry.label}
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tracking-[0.14em] text-ink-faint"
                  >
                    {String(navIndex + 1).padStart(2, "0")}
                  </span>
                </a>
              </li>
            ))}
            {/* Below `sm` this row is the only way to change language, which is
                why it lives in the panel rather than nowhere. */}
            <li className="border-b border-line last:border-b-0">
              <LanguageSwitch
                locale={locale}
                ui={ui}
                variant="menuRow"
                onNavigate={() => setMenuOpen(false)}
              />
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
