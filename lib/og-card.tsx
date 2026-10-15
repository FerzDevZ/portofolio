import { ImageResponse } from "next/og";
import { formatTemplate, type PortfolioContent } from "@/lib/content";

/**
 * The share card, in both appearances.
 *
 * ## What "mode-aware" can and cannot mean here
 *
 * A social card cannot be chosen by the viewer's colour scheme. X/Twitter,
 * Facebook, LinkedIn, Slack, WhatsApp, iMessage, Discord and Telegram fetch
 * `og:image` with a crawler that carries no appearance preference, and the Open
 * Graph protocol defines `og:image` as a URL with no `media` semantics — so
 * there is nothing to switch on, and a site that tried would simply be cached
 * as whichever variant the crawler happened to fetch first (Meta: an image
 * "won't be updated unless the URL changes").
 *
 * So the dark card stays the canonical `og:image`, and the light card is a
 * deliberate second URL for a human who wants it — a light-background post, a
 * README, a slide. This module exists so both are the same layout with two
 * palettes rather than two files that drift apart.
 *
 * ## Palette provenance
 *
 * Every colour below is the resolved sRGB value of a token in
 * `app/globals.css`, sampled through the browser's own `oklch()` conversion
 * (Chromium keeps `oklch()` verbatim in `getComputedStyle`, so the canvas is
 * told to paint the token and read back). The card previously carried its own
 * hand-picked greys, which had drifted: its faint tone measured 2.98:1 against
 * its own surface, under the 4.5:1 floor that the page's own faint ramp now
 * meets.
 *
 * Satori renders flexbox-only; CSS grid, gradients as properties, and Tailwind
 * utilities that hit the DOM are unavailable. Everything below is inline style
 * with explicit dimensions — satori rejects percentage sizing without both
 * axes being resolved, so each layer is positioned with fixed pixels.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Alt text for the card, in the locale the card was drawn for.
 *
 * The image file itself cannot carry a per-locale `alt` export — one file
 * serves both `[lang]` values — so the string is built here and handed to
 * `generateImageMetadata`, which is the one hook that can vary it per locale.
 */
export function renderOgAlt(content: PortfolioContent): string {
  return formatTemplate(content.meta.homeTitleTemplate, {
    name: content.site.name,
    role: content.site.role,
  });
}

export type OgPalette = {
  /** Page surface the card is cut from. */
  surface: string;
  /** Accent wash behind the name block. */
  glow: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  accent: string;
  live: string;
  hairline: string;
  badgeFill: string;
};

export const ogPalettes: Record<"dark" | "light", OgPalette> = {
  dark: {
    // --color-panel
    surface: "#0b0d10",
    glow: "rgba(93, 175, 250, 0.13)", // --color-accent
    ink: "#e8e9eb", // --color-ink
    inkMuted: "#a1a5ab", // --color-ink-muted
    inkFaint: "#777c83", // --color-ink-faint
    accent: "#5daffa", // --color-accent
    live: "#4ad591", // --color-live
    hairline: "rgba(232, 233, 235, 0.14)", // --color-ink at hairline strength
    badgeFill: "rgba(232, 233, 235, 0.05)", // --color-veil-soft
  },
  light: {
    // --color-panel (the light block in globals.css)
    surface: "#fbfeff",
    glow: "rgba(0, 109, 195, 0.08)", // --color-accent, restrained on paper
    ink: "#131922", // --color-ink
    inkMuted: "#4c535e", // --color-ink-muted
    inkFaint: "#636972", // --color-ink-faint
    accent: "#006dc3", // --color-accent
    live: "#008a4e", // --color-live
    hairline: "rgba(19, 25, 34, 0.14)", // --color-ink at hairline strength
    badgeFill: "rgba(19, 25, 34, 0.04)", // --color-veil-soft
  },
};

/**
 * The card's badge carries the strongest credential: the first certificate in
 * the dictionary with a placement. Resolved per call rather than once at
 * module scope, because the two locale dictionaries are separate objects.
 */
function readTopCertificate(content: PortfolioContent) {
  return content.certificates.items.find(
    (certificate) => certificate.placement !== null,
  );
}

/**
 * The badge carries the competition, not the full provenance line.
 *
 * The card has 1056px of usable width. The complete issuer string is 76
 * characters at 20px, which made the badge ~860px wide and pushed the bottom
 * rail into the availability line — on the shipped card the two overlapped and
 * "Available for selected projects" wrapped under the badge. The competition is
 * the recognisable half, and the venue, organiser and month are all on the page
 * itself, so the badge keeps the first segment and both sides stop wrapping.
 */
function readIssuerHeadline(topCertificate: ReturnType<typeof readTopCertificate>) {
  return topCertificate?.issuer?.split(" · ")[0] ?? "";
}

/** Renders the 1200×630 card in the given palette, in the given locale. */
export function renderOgCard(palette: OgPalette, content: PortfolioContent) {
  const topCertificate = readTopCertificate(content);
  const issuerHeadline = readIssuerHeadline(topCertificate);
  /* The surname carries the faint tone, so the name is split once here rather
     than hard-coded twice. */
  const [givenName = content.site.name, ...familyNameWords] =
    content.site.name.split(" ");
  const familyName = familyNameWords.join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: palette.surface,
          backgroundImage: `radial-gradient(circle at 82% 12%, ${palette.glow} 0%, rgba(0, 0, 0, 0) 42%)`,
        }}
      >
        {/* Top rail — mono eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: palette.inkFaint,
            fontSize: 24,
            letterSpacing: 5,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 2,
              backgroundColor: palette.hairline,
            }}
          />
          {content.ui.ogCardLabel}
        </div>

        {/* Name block — the surname carries the ink brightness */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: -2,
              color: palette.ink,
            }}
          >
            {givenName}
            {familyName && (
              <div style={{ display: "flex", color: palette.inkFaint }}>
                &nbsp;{familyName}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              fontSize: 40,
              color: palette.inkMuted,
            }}
          >
            {content.site.role}
            <div
              style={{
                display: "flex",
                width: 2,
                height: 40,
                backgroundColor: palette.hairline,
              }}
            />
            <div style={{ display: "flex", fontSize: 30, color: palette.inkFaint }}>
              {content.site.location}
            </div>
          </div>
        </div>

        {/* Bottom rail — availability left, credential badge right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 26,
              color: palette.inkFaint,
              /* One line, always: a wrapped label grows upward into the name
                 block and runs under the badge. */
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: palette.live,
              }}
            />
            {content.site.availability}
          </div>

          {topCertificate && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 26px",
                borderRadius: 10,
                border: `1px solid ${palette.hairline}`,
                backgroundColor: palette.badgeFill,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  backgroundColor: palette.accent,
                  position: "relative",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 26,
                    fontWeight: 600,
                    color: palette.ink,
                  }}
                >
                  {topCertificate.placement} · {topCertificate.title}
                </div>
                {/* 20px is small text, so the issuer takes the muted ramp: the
                    faint tone lands just under 4.5:1 on this surface. */}
                <div
                  style={{
                    display: "flex",
                    fontSize: 20,
                    color: palette.inkMuted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {issuerHeadline}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    ogSize,
  );
}
