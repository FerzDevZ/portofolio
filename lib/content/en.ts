import type { PortfolioContent } from "@/lib/content/types";

/**
 * The English dictionary — the source copy for the site.
 *
 * Values that are not language-dependent (URL, e-mail, timezone, image paths,
 * certificate dimensions) are repeated in `id.ts` on purpose: a translator
 * should only ever have to open one file.
 */
export const content: PortfolioContent = {
  locale: "en",

  site: {
    name: "Ferdinand Dero Saputra",
    initials: "FD",
    role: "Frontend Engineer",
    homeScreenName: "Ferdinand",
    tagline:
      "Frontend engineer building calm, precise interfaces for the web.",
    location: "Pangkalpinang, Indonesia",
    timezone: "Asia/Jakarta",
    email: "ferdinandderosaputra1@gmail.com",
    url: "https://ferzdevz.vercel.app",
    availability: "Available for select projects",
    shippingSince: "2021",
    portrait: "/profile/portrait.webp",
    portraitAlt: "Portrait of Ferdinand Dero Saputra",
    description:
      "Portfolio of Ferdinand Dero Saputra — frontend engineer focused on design systems, performance, and interfaces with editorial restraint.",
  },

  hero: {
    eyebrowStart: "Portfolio —",
    eyebrowEnd: "to present",
    headlineLead: "Interfaces built with",
    headlineAccent: "restraint",
    headlineTail: ", shipped with precision.",
    ledeSuffix:
      "Design systems, performance budgets, and the kind of detail you only notice when it is missing.",
    primaryAction: "View selected work",
    secondaryAction: "Get in touch",
    profileDetailsLabel: "Profile details",
  },

  heroMeta: [
    { label: "Based in", value: "Pangkalpinang, ID · UTC+7" },
    { label: "Focus", value: "Design systems, web apps" },
    { label: "Experience", value: "5 years shipping" },
    { label: "Status", value: "Open to freelance" },
  ],

  stackStrip: [
    "TypeScript",
    "React 19",
    "Next.js 15",
    "Tailwind CSS",
    "Node.js",
    "PostgreSQL",
    "Playwright",
    "Figma",
  ],

  nav: [
    { label: "Work", href: "#work" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Experience", href: "#experience" },
    { label: "Certificates", href: "#certificates" },
    { label: "Contact", href: "#contact" },
  ],

  work: {
    heading: "01 — Selected work",
    countTemplate: "{count} projects",
    featuredLabel: "Featured",
    readCaseStudy: "Read the case study",
  },

  featuredProject: {
    id: "northwind",
    index: "01",
    title: "Northwind Commerce",
    role: "Lead frontend · 2026",
    description:
      "Headless storefront for a 40k-SKU catalog. Server components cut the client bundle by 61%, and a rebuilt checkout flow lifted conversion by 18% in the first quarter.",
    year: "2026",
    stack: ["Next.js 15", "Stripe", "Sanity", "Turbo"],
    href: "/projects/northwind",
    caseStudy: {
      context:
        "A 40k-SKU catalog on a client-rendered storefront shipped its whole hydration payload on every product page. On mid-range Android phones the page took over four seconds to become interactive, and the drop-off concentrated exactly where the money is — the product page and the checkout.",
      approach: [
        {
          title: "Server components by default",
          detail:
            "Catalog, product, and search routes moved to the server; only the cart, the variant picker, and the payment step stayed as client islands.",
        },
        {
          title: "Streamed catalog pages",
          detail:
            "Category rails render behind Suspense, so the shell paints before the product data lands and the largest paint never waits on the slowest query.",
        },
        {
          title: "Rebuilt checkout",
          detail:
            "A single-page flow with inline validation and Stripe Elements mounted on first interaction rather than on load.",
        },
      ],
      outcome:
        "The client bundle fell by 61% and the rebuilt checkout converted 18% better in its first quarter. Largest contentful paint on a throttled mid-range phone settled at 1.1 seconds.",
      metrics: [
        { value: "61%", label: "client bundle removed" },
        { value: "+18%", label: "checkout conversion" },
        { value: "1.1s", label: "LCP on throttled 4G" },
      ],
    },
  },

  projects: [
    {
      id: "atlas",
      index: "02",
      title: "Atlas Design System",
      role: "Design engineer",
      description:
        "120-component library with OKLCH tokens, dark mode, and WCAG 2.2 AA audits — adopted by six product teams.",
      year: "2025",
      stack: ["React", "TypeScript", "Storybook"],
      href: "/projects/atlas",
      caseStudy: {
        context:
          "Six product teams were shipping six slightly different buttons. Every new hire spent a week reading screenshots to guess the rules, and dark mode was whatever each team remembered to do.",
        approach: [
          {
            title: "One perceptual palette",
            detail:
              "OKLCH tokens stepped by lightness, so contrast survives both schemes without hand-picking a hex value per component.",
          },
          {
            title: "States documented, not assumed",
            detail:
              "Each component ships its full state set — rest, hover, focus, active, disabled, loading, error, empty — so no page invents its own.",
          },
          {
            title: "Contrast audited in CI",
            detail:
              "A failing WCAG 2.2 AA ratio blocks the merge, which is the only way a rule survives a deadline.",
          },
        ],
        outcome:
          "Six teams adopted the library. New screens start from tokens instead of screenshots, and accessibility review moved from a quarterly project to a build step.",
        metrics: [
          { value: "120", label: "components shipped" },
          { value: "6", label: "teams adopted" },
          { value: "AA", label: "audited on every pull request" },
        ],
      },
    },
    {
      id: "pulse",
      index: "03",
      title: "Pulse Analytics",
      role: "Frontend lead",
      description:
        "Realtime dashboard streaming 12k events per second into interactive charts without dropping a frame.",
      year: "2025",
      stack: ["Next.js", "WebSockets", "ClickHouse"],
      href: "/projects/pulse",
      caseStudy: {
        context:
          "Operations needed a live view of 12,000 events per second on the same page that renders charts, tables, and alerts. The first prototype pushed every event through React state and dropped frames the moment traffic peaked.",
        approach: [
          {
            title: "Batched at the edge",
            detail:
              "Events coalesce into 100ms frames before they reach the browser, so the client renders ten updates a second instead of twelve thousand.",
          },
          {
            title: "Canvas for the timeseries",
            detail:
              "Charts draw to a canvas driven by a rAF loop; only axis labels and tooltips live in the DOM.",
          },
          {
            title: "Backpressure by design",
            detail:
              "A backgrounded tab receives sampled frames only and replays a summary on return instead of flooding the queue.",
          },
        ],
        outcome:
          "The dashboard holds 60fps with the full stream running, and memory stays flat across an eight-hour shift — the failure mode that killed the prototype.",
        metrics: [
          { value: "12k", label: "events per second" },
          { value: "60fps", label: "held under peak load" },
          { value: "8h", label: "flat memory over a shift" },
        ],
      },
    },
    {
      id: "kopinusa",
      index: "04",
      title: "Kopi Nusantara",
      role: "Solo build",
      description:
        "Roastery e-commerce with subscriptions, local payments, and a 98 Lighthouse score on 3G.",
      year: "2024",
      stack: ["Next.js", "Tailwind", "Midtrans"],
      href: "/projects/kopinusa",
      caseStudy: {
        context:
          "A roastery selling across Indonesia needed subscriptions and local payment rails without a platform fee eating the margin — and most of its customers are on phones where 3G is the fast option.",
        approach: [
          {
            title: "Subscriptions as state machines",
            detail:
              "Every plan moves through explicit states — active, paused, past due, cancelled — so renewal edge cases are designed once rather than discovered in production.",
          },
          {
            title: "One pipeline, three payment rails",
            detail:
              "Cards, e-wallets, and bank transfers all land in a single order model with idempotent webhook handling.",
          },
          {
            title: "Budgeted for 3G",
            detail:
              "Route-level code splitting and strict image discipline keep the first load under 180KB.",
          },
        ],
        outcome:
          "The store scores 98 on Lighthouse over throttled 3G and runs 400+ recurring subscriptions with no operational staff behind it.",
        metrics: [
          { value: "98", label: "Lighthouse over 3G" },
          { value: "180KB", label: "first load" },
          { value: "400+", label: "recurring subscribers" },
        ],
      },
    },
    {
      id: "ledgerly",
      index: "05",
      title: "Ledgerly",
      role: "Solo build",
      description:
        "Offline-first personal finance PWA — every keystroke saved to IndexedDB, works with no connection.",
      year: "2024",
      stack: ["React", "IndexedDB", "Workbox"],
      href: "/projects/ledgerly",
      caseStudy: {
        context:
          "A finance tracker loses trust the first time a keystroke does not persist. The brief was an app that works in a dead zone and never asks the user to wait for a network round trip.",
        approach: [
          {
            title: "IndexedDB as the source of truth",
            detail:
              "Every write lands locally first; the interface never blocks on the network.",
          },
          {
            title: "Field-level merge",
            detail:
              "Records carry monotonic timestamps and merge per field, so two edits to one row do not discard each other.",
          },
          {
            title: "Offline by default",
            detail:
              "A service worker precaches the shell; the app opens and records with the radio off.",
          },
        ],
        outcome:
          "Every keystroke survives a reload in airplane mode, and a third of returning visitors install the app to their home screen.",
        metrics: [
          { value: "0ms", label: "write latency" },
          { value: "100%", label: "of flows work offline" },
          { value: "33%", label: "of returning visitors install" },
        ],
      },
    },
    {
      id: "meridian",
      index: "06",
      title: "Meridian Docs",
      role: "Frontend engineer",
      description:
        "Documentation platform with MDX authoring and instant search across 2,300 pages.",
      year: "2023",
      stack: ["Next.js", "MDX", "Algolia"],
      href: "/projects/meridian",
      caseStudy: {
        context:
          "2,300 pages of documentation, a search box that took 900ms per query, and a publishing flow that needed an engineer for a one-line typo fix.",
        approach: [
          {
            title: "MDX with a validating build",
            detail:
              "Writers author Markdown with components; the build fails on broken links and malformed frontmatter before anything ships.",
          },
          {
            title: "Index built at deploy time",
            detail:
              "Search runs against a static index that ships with the site, so queries answer locally instead of crossing an API.",
          },
          {
            title: "Versioned URLs",
            detail:
              "Each docs version lives at its own path, so old links keep resolving after a release.",
          },
        ],
        outcome:
          "Search answers in 28ms without an API round trip, and the docs team publishes without opening a ticket.",
        metrics: [
          { value: "28ms", label: "search response" },
          { value: "2,300", label: "pages indexed" },
          { value: "0", label: "engineer handoffs to publish" },
        ],
      },
    },
  ],

  capabilities: {
    heading: "02 — Capabilities",
    note: "what I do",
    headline: "A narrow set of skills, taken seriously.",
    lede: "I would rather do four things at a senior level than twenty at a mediocre one. Here is the honest list.",
    items: [
      {
        id: "interface",
        index: "01",
        title: "Interface engineering",
        description:
          "Component architectures that stay legible at scale: server components by default, client boundaries pushed to leaves, motion limited to transform and opacity.",
        tools: ["React 19", "Next.js 15", "TypeScript", "Framer Motion"],
      },
      {
        id: "systems",
        index: "02",
        title: "Design systems",
        description:
          "Perceptual OKLCH tokens, fluid type ramps, and documented states — so a button looks the same in every hands, on every screen.",
        tools: ["Tailwind CSS", "Storybook", "Radix UI", "Figma"],
      },
      {
        id: "performance",
        index: "03",
        title: "Performance",
        description:
          "Budgets enforced in CI: LCP under 1.2s, zero layout shift, bundle diffs on every pull request. Speed is a feature, not an audit you run later.",
        tools: ["Core Web Vitals", "Lighthouse CI", "Bundle analysis"],
      },
      {
        id: "delivery",
        index: "04",
        title: "Delivery",
        description:
          "Tests that catch regressions before users do, previews on every branch, and one-command rollbacks.",
        tools: ["Playwright", "Vitest", "GitHub Actions", "Vercel"],
      },
    ],
  },

  experience: {
    heading: "03 — Experience",
    span: "2021 — now",
    items: [
      {
        period: "2024 — Present",
        role: "Independent frontend engineer",
        company: "Freelance",
        description:
          "Shipping product interfaces for startups across SEA — commerce, fintech, and internal tools.",
      },
      {
        period: "2022 — 2024",
        role: "Frontend engineer",
        company: "Northlight Studio",
        description:
          "Led the frontend guild: design system rollout, performance budgets, and hiring code reviews.",
      },
      {
        period: "2021 — 2022",
        role: "Web developer",
        company: "Kreasi Digital",
        description:
          "Built marketing sites and dashboards for consumer brands; introduced TypeScript across the stack.",
      },
    ],
  },

  certificates: {
    heading: "04 — Certificates",
    publishedTemplate: "{published} of {total} published",
    reservedNotice: "Certificate slot — photo to follow",
    enlargeTemplate: "Enlarge certificate {placement} {title}",
    dialogTemplate: "Certificate {placement} {title}",
    imageAltTemplate: "Certificate {placement} {title} — {issuer}",
    closeLabel: "Close certificate view",
    items: [
      {
        id: "otn-vi-desain-web",
        index: "01",
        placement: "Juara I",
        title: "Desain Web",
        issuer:
          "Olimpiade TIK-Informatika Nasional (OTN) VI · IGTIK PGRI · ICE BSD Tangerang",
        period: "November 2024",
        image: "/certificates/otn-vi-desain-web-2024.webp",
        imageWidth: 1280,
        imageHeight: 927,
      },
      {
        id: "lks-babel-itssb",
        index: "02",
        placement: "Juara II",
        title: "IT Software Solution for Business",
        issuer:
          "LKS Provinsi Kepulauan Bangka Belitung · Dinas Pendidikan · SMKN 2 Pangkalpinang",
        period: "June 2025",
        image: "/certificates/lks-babel-itssb-2025.webp",
        imageWidth: 738,
        imageHeight: 518,
      },
      {
        id: "mostfet-11",
        index: "03",
        placement: "Juara 2",
        title: "Web Design Online",
        issuer: "E-MOSTFET 11 · HM Elektro Universitas Bangka Belitung",
        period: "September 2026",
        image: "/certificates/emostfet-11-web-design.webp",
        imageWidth: 2000,
        imageHeight: 1414,
      },
    ],
  },

  contact: {
    heading: "05 — Contact",
    kicker: "Start a conversation",
    body: "Tell me what you are building and where it hurts. I reply within two working days, usually sooner.",
    socialsLabel: "Social links",
  },

  socials: [
    {
      label: "GitHub",
      href: "https://github.com/FerzDevZ",
      handle: "@FerzDevZ",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/ferdinandderosaputra",
      handle: "in/ferdinandderosaputra",
    },
    { label: "X", href: "https://x.com/ferzchills20", handle: "@ferzchills20" },
    {
      label: "Instagram",
      href: "https://instagram.com/ferzchills20",
      handle: "@ferzchills20",
    },
    {
      label: "Email",
      href: "mailto:ferdinandderosaputra1@gmail.com",
      handle: "ferdinandderosaputra1@gmail.com",
    },
  ],

  footer: {
    copyrightTemplate: "© {year} {name} — built in Next.js & Tailwind",
    backToTop: "Back to top ↑",
  },

  caseStudyPage: {
    eyebrowTemplate: "Case study — {index}",
    documentTitleTemplate: "{title} — Case study",
    allWork: "All work",
    contextLabel: "01 — Context",
    approachLabel: "02 — Approach",
    outcomeLabel: "03 — Outcome",
    roleLabel: "Role",
    yearLabel: "Year",
    stackLabel: "Stack",
    moreLabel: "More case studies",
    previousLabel: "Previous",
    nextLabel: "Next",
    backToPortfolioLabel: "back to the portfolio",
  },

  meta: {
    homeTitleTemplate: "{name} — {role}",
    caseTitleSuffix: "— {name}",
  },

  ui: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    primaryNavLabel: "Primary",
    mobileNavLabel: "Mobile",
    brandBackToTopTemplate: "{name} — back to top",
    themeToggleTemplate: "Theme: {state}",
    themeSystem: "system",
    themeLight: "light",
    themeDark: "dark",
    themeHint: "click or press Ctrl/Cmd+Shift+L",
    languageSwitchTemplate: "Switch to {language}",
    languageSwitchHint: "Bahasa Indonesia",
    offlineChip: "Offline",
    offlineAnnouncement: "Offline — this page is being served from the offline cache.",
    clockLabel: "Local time in Jakarta",
    ogCardLabel: "Portfolio",
  },
};
