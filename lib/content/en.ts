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
    url: "https://portofolio-one-xi-42.vercel.app",
    availability: "Available for select projects",
    shippingSince: "2021",
    portrait: "/profile/portrait.webp",
    portraitAlt: "Portrait of Ferdinand Dero Saputra",
    description:
      "Portfolio of Ferdinand Dero Saputra, a frontend engineer focused on design systems, performance, and interfaces with editorial restraint.",
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
    { label: "Experience", value: "Full-stack, from Indonesia" },
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

  pageLinks: [
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Resume", href: "/resume" },
  ],

  work: {
    heading: "01 — Selected work",
    countTemplate: "{count} projects",
    featuredLabel: "Featured",
    readCaseStudy: "Read the case study",
  },

  featuredProject: {
    id: "jasakite",
    index: "01",
    title: "JASAKITE",
    role: "Full-stack build · personal project",
    description:
      "Local services marketplace for Indonesia: a filterable catalog, multi-item checkout, a provider board, and an admin console, with QRIS money held in escrow until the job is done.",
    year: "2026",
    stack: ["Next.js 15", "Prisma", "MongoDB", "NextAuth v5"],
    proof: "Live · release app-v1.0.1",
    href: "/projects/jasakite",
    repoUrl: "https://github.com/FerzDevZ/jasakite",
    liveUrl: "https://jasakite.vercel.app",
    preview: null,
    caseStudy: {
      context:
        "Buyers and local providers need one place to find, book, and pay for work. Money passes through several people before a job is finished, so every role has to see the same order at the same step.",
      approach: [
        {
          title: "Four roles, one order model",
          detail:
            "Customer, provider, admin, and super admin share one lifecycle: received, in progress, completed, cancelled, each with a timestamped timeline.",
        },
        {
          title: "Escrow before delivery",
          detail:
            "QRIS payment is held against the order and released on completion, into a wallet the provider can withdraw from. The subscription that keeps a provider listed is deducted from that balance.",
        },
        {
          title: "Tested in two layers",
          detail:
            "Vitest covers the pricing and order rules; Playwright runs the flows in Chromium and on a 320px mobile profile.",
        },
      ],
      outcome:
        "Catalog to review runs end to end in the repository, with seeded demo accounts for all four roles and an operator guide. Payment is a simulated QRIS step, and the README states that limit.",
      metrics: [
        { value: "4", label: "roles in one application" },
        { value: "Escrow", label: "QRIS funds held until completion" },
        { value: "Rp10.000", label: "monthly provider subscription" },
      ],
    },
  },

  projects: [
    {
      id: "webpos-apotek",
      index: "02",
      title: "WebPOS Apotek",
      role: "Full-stack build · personal project",
      description:
        "A pharmacy point-of-sale and stock system for Indonesian shops: batch-level FEFO dispensing, prescriptions with signa, multi-unit selling, and profit counted from the batch that actually left the shelf.",
      year: "2026",
      stack: ["Next.js 16", "Prisma", "SQLite", "Tailwind CSS v4"],
      proof: "Early preview",
      href: "/projects/webpos-apotek",
      repoUrl: "https://github.com/FerzDevZ/webpos-apotek",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "An Indonesian pharmacy dispenses from batches that each carry an expiry date, and sells the same item as a box, a strip, or a tablet. A generic till records the sale but not the batch, so stock and profit drift apart.",
        approach: [
          {
            title: "FEFO decided on the server",
            detail:
              "The cashier never picks a batch. Allocation runs first-expiry-first-out inside the server action, and every movement is written to a stock ledger, so cost of goods comes from the batch that was really dispensed.",
          },
          {
            title: "Sessions without an auth vendor",
            detail:
              "Cookie sessions signed with HMAC, scrypt password hashes, and role checks in both the proxy and the server action. A disabled user is locked out even while holding a live cookie.",
          },
          {
            title: "Offline by construction",
            detail:
              "Prisma on SQLite keeps the whole system on the shop laptop. It runs with no internet, which is the condition it was built for.",
          },
        ],
        outcome:
          "The repository contains cashier, master items, invoice intake, stock and expiry, prescriptions, reports, customers, receipts, and role-based access. Receipts are laid out for 58mm thermal paper and printed from the browser. The automated suite is not written yet, so the flows are verified by hand.",
        metrics: [
          { value: "FEFO", label: "batch allocation on the server" },
          { value: "58mm", label: "thermal receipt layout" },
          { value: "0", label: "external auth dependencies" },
        ],
      },
    },
    {
      id: "9router-aegisx",
      index: "03",
      title: "9Router AegisX",
      role: "Platform build · maintained fork",
      description:
        "A self-hosted AI gateway between coding tools and 40+ providers: one OpenAI-compatible endpoint, fallback chains across accounts and tiers, and token savers that report what they removed.",
      year: "2026",
      stack: ["TypeScript", "SolidJS", "SQLite", "Node.js"],
      proof: "Release v0.5.110-aegisx.1 · CI",
      href: "/projects/9router-aegisx",
      repoUrl: "https://github.com/FerzDevZ/9router-aegisx",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "A coding assistant bound to one provider stops the moment that provider rate-limits or resets quota. Routing across accounts and tiers by hand means configuring every client separately.",
        approach: [
          {
            title: "One endpoint, four wire formats",
            detail:
              "The gateway accepts OpenAI, Responses, Anthropic, and Gemini shapes and translates between them, so a dozen clients point at the same local URL and route by provider and model id.",
          },
          {
            title: "Fallback as a policy",
            detail:
              "Combos chain subscription, cheap, and free tiers with sequential, round-robin, cache-aware, or parallel-fusion routing, chosen per model rather than per client.",
          },
          {
            title: "Spend you can audit",
            detail:
              "Token and cost accounting per provider, model, and key, with cache-hit rate, quota tracking, and a scoreboard of what each token saver removed.",
          },
        ],
        outcome:
          "Credentials stay in a local SQLite database. The fork keeps the upstream unit suite green (4,100+ tests), adds security hardening and honest token accounting, and records its delta in a changelog.",
        metrics: [
          { value: "40+", label: "provider executors" },
          { value: "4,100+", label: "unit tests in CI" },
          { value: "1", label: "endpoint for every client" },
        ],
      },
    },
    {
      id: "ferzdb",
      index: "04",
      title: "FerzDB",
      role: "Systems build · personal project",
      description:
        "A SQL database engine in Rust for embedded and offline-first use: B-tree indexes, write-ahead logging, and a storage format small enough to inspect by hand.",
      year: "2026",
      stack: ["Rust", "B-Tree", "WAL"],
      proof: "In development",
      href: "/projects/ferzdb",
      repoUrl: "https://github.com/FerzDevZ/ferzdb",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "SQLite is the default answer for an embedded database, but its page format is effectively opaque. Writing the engine is the only way to own the storage format, the transaction boundary, and the failure behaviour.",
        approach: [
          {
            title: "A real B-tree",
            detail:
              "Index pages form a B-tree, so point lookups and range scans walk a structure instead of filtering a file.",
          },
          {
            title: "Write-ahead log",
            detail:
              "Changes are appended to a WAL and replayed on open. That is what turns a half-written page into a recoverable state rather than a corrupt file.",
          },
          {
            title: "Two deployment shapes",
            detail:
              "The same engine runs embedded as a library or behind a client-server mode, with the query layer unchanged.",
          },
        ],
        outcome:
          "ACID transactions, transparent storage files, and errors that name what failed. A web console in the repository inspects tables without a separate client. It is a working core, not yet a drop-in replacement for SQLite.",
        metrics: [
          { value: "B-Tree", label: "index structure" },
          { value: "WAL", label: "crash recovery" },
          { value: "2", label: "embedded and server modes" },
        ],
      },
    },
    {
      id: "ftrack",
      index: "05",
      title: "ftrack",
      role: "Systems tool · personal project",
      description:
        "A web archiver and OSINT mapper in Rust that crawls URLs in parallel, writes WARC archives, and flags leaked secrets and API endpoints.",
      year: "2026",
      stack: ["Rust", "Tokio", "SQLite", "Chromium"],
      proof: "In development",
      href: "/projects/ftrack",
      repoUrl: "https://github.com/FerzDevZ/ftrack",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "Archiving a site for audit or preservation takes more than a recursive download. Modern sites render in JavaScript, and the output has to follow a standard other preservation tools can read.",
        approach: [
          {
            title: "Parallel crawl under a bound",
            detail:
              "Tokio tasks run under a JoinSet and a Semaphore, so many URLs are processed at once without overwhelming the machine.",
          },
          {
            title: "Headless Chromium for SPAs",
            detail:
              "Pages run their JavaScript before capture, so single-page apps are archived with the content a visitor actually sees.",
          },
          {
            title: "Detection rules as data",
            detail:
              "Secret and endpoint signatures live in YAML files, so they change without recompiling the tool.",
          },
        ],
        outcome:
          "Archives follow ISO 28500 (WARC) for interoperability with other preservation tools. Crawl state is kept in SQLite, so later runs proceed incrementally, and a passive scan reports the credentials it finds.",
        metrics: [
          { value: "WARC", label: "ISO 28500 archive format" },
          { value: "Tokio", label: "async parallel crawling" },
          { value: "YAML", label: "editable detection rules" },
        ],
      },
    },
    {
      id: "oauth",
      index: "06",
      title: "OAuth system",
      role: "Authentication · personal project",
      description:
        "Google and GitHub sign-in written by hand in Next.js: PKCE, revocable sessions, rate limits, and an audit log, with no auth library.",
      year: "2026",
      stack: ["Next.js", "SQLite", "PKCE"],
      proof: "Test suite included",
      href: "/projects/oauth",
      repoUrl: "https://github.com/FerzDevZ/oauth-system",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "Auth libraries hide the decisions that matter: where the PKCE verifier lives, how a session is revoked, and where a failed login is recorded. Writing the flow by hand makes those decisions visible.",
        approach: [
          {
            title: "PKCE for Google",
            detail:
              "The Google flow uses the authorization code grant with an S256 code challenge.",
          },
          {
            title: "Sessions you can revoke",
            detail:
              "Sessions live in SQLite. Logout ends the current device, and logout-everywhere revokes the rest.",
          },
          {
            title: "Limits and a log",
            detail:
              "The auth endpoints are rate limited, and every auth event is written to a log file.",
          },
        ],
        outcome:
          "Unit tests run with Vitest and end-to-end flows with Playwright. The README lists the exact redirect URIs needed for local development.",
        metrics: [
          { value: "2", label: "providers: Google, GitHub" },
          { value: "S256", label: "PKCE challenge method" },
          { value: "E2E", label: "Playwright flows" },
        ],
      },
    },
    {
      id: "nanotok",
      index: "07",
      title: "nanotok",
      role: "Tooling · personal project",
      description:
        "A deterministic, offline token compressor for agent prompts and logs: a six-stage pipeline that keeps identifiers, paths, and error literals intact.",
      year: "2026",
      stack: ["Python", "CLI", "Standard library only"],
      proof: "v3.0.0 · CI",
      href: "/projects/nanotok",
      repoUrl: "https://github.com/FerzDevZ/nanotok",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "Agent sessions spend most of their context on repeated logs, file dumps, and boilerplate. Trimming that by hand loses the exact literals the model needs to act correctly.",
        approach: [
          {
            title: "Protected spans",
            detail:
              "Paths, flags, identifiers, numbers, and error literals are marked before compression and restored after, so a token that changes meaning is never rewritten.",
          },
          {
            title: "Six stages, fixed order",
            detail:
              "Each stage has its own contract and reports its own savings, so a compression choice can be traced instead of trusted.",
          },
          {
            title: "No dependencies, no network",
            detail:
              "Python standard library only. The same input produces the same output, which is what makes it safe inside a CI hook.",
          },
        ],
        outcome:
          "Ships as a CLI with an AgentSkills integration for coding agents, a measured benchmark section, and design targets stated separately from realized savings.",
        metrics: [
          { value: "6", label: "pipeline layers" },
          { value: "0", label: "runtime dependencies" },
          { value: "Local", label: "deterministic and offline" },
        ],
      },
    },
    {
      id: "fcopier",
      index: "08",
      title: "FCopier",
      role: "Tooling · personal project",
      description:
        "A Playwright-based website cloner with offline export, API recording, and a secret scanner over the assets it saves.",
      year: "2026",
      stack: ["JavaScript", "Playwright"],
      proof: "Live docs",
      href: "/projects/fcopier",
      repoUrl: "https://github.com/FerzDevZ/fcopier",
      liveUrl: "https://ferzdevz.github.io/fcopier/",
      preview: {
        src: "/projects/fcopier-preview.png",
        alt: "FCopier documentation homepage, captured from the live demo",
        width: 1280,
        height: 577,
      },
      caseStudy: {
        context:
          "A dynamic site is harder to save for offline reading or security review than a static one. Its assets load through scripts, and the saved copy can carry credentials the page leaked.",
        approach: [
          {
            title: "Rewritten asset paths",
            detail:
              "Downloaded JavaScript, CSS, and images have their references rewritten, so the copy works offline.",
          },
          {
            title: "API recording and replay",
            detail:
              "Network requests are recorded and then served back through a local server.",
          },
          {
            title: "Secret scanning",
            detail:
              "Saved assets are scanned for API keys and tokens before the copy is kept.",
          },
        ],
        outcome:
          "Exports to PDF, PNG, or a single self-contained HTML file. The documentation is published on GitHub Pages.",
        metrics: [
          { value: "3", label: "export formats" },
          { value: "ETag", label: "sync skips unchanged files" },
          { value: "Live", label: "documentation on GitHub Pages" },
        ],
      },
    },
  ],

  blog: {
    heading: "Blog",
    kicker: "Writing",
    description:
      "Notes on frontend craft: design systems, performance budgets, and the details that decide whether an interface feels calm.",
    emptyState: "No posts yet. The first one is being written.",
    countTemplate: "{count} post{plural}",
    allPosts: "All posts",
    backToHome: "Back to home",
  },

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
        tools: ["React 19", "Next.js 15", "TypeScript", "CSS transitions"],
      },
      {
        id: "systems",
        index: "02",
        title: "Design systems",
        description:
          "Perceptual OKLCH tokens, fluid type ramps, and one palette per role. Every colour lives in a single token block, so a theme change is one edit.",
        tools: ["Tailwind CSS v4", "OKLCH", "CSS custom properties", "WCAG contrast"],
      },
      {
        id: "performance",
        index: "03",
        title: "Performance",
        description:
          "Lighthouse runs on every push and fails the build below the thresholds in lighthouserc.json. Speed is checked in CI, not in an audit months later.",
        tools: ["Lighthouse CI", "Core Web Vitals", "next build output"],
      },
      {
        id: "delivery",
        index: "04",
        title: "Delivery",
        description:
          "Tests that catch regressions before users do, previews on every branch, and one-command rollbacks.",
        tools: ["Playwright", "axe-core", "ESLint", "GitHub Actions"],
      },
    ],
  },

  experience: {
    heading: "03 — Experience",
    span: "2024 — now",
    /* Only milestones this repository can prove: the six case studies and the
       three certificates. Employment history is deliberately absent — there is
       no verifiable source for it, and an unverifiable employer is worse than
       no employer line at all. */
    items: [
      {
        period: "2026 — Present",
        role: "Independent builder",
        company: "Personal projects",
        description:
          "Eight projects in the open: a services marketplace and a site cloner are live, the marketplace and an AI gateway carry tagged releases, and every project links to its source repository so the claims can be checked.",
      },
      {
        period: "2024 — 2026",
        role: "Competition track",
        company: "OTN VI · LKS Babel · E-MOSTFET 11",
        description:
          "Juara I Desain Web at OTN VI (2024), Juara II IT Software Solution for Business at LKS Babel (2025), and Juara 2 Web Design Online at E-MOSTFET 11 (2026).",
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

  contactPage: {
    kicker: "Contact",
    heading: "Get in touch",
    lede: "Available for select projects — design systems, performance work, or interfaces that demand precision. Tell me what you are building and where it hurts.",
    formLabel: "Send a message",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    messageLabel: "Message",
    messagePlaceholder: "Tell me about your project…",
    submitLabel: "Send message",
    submittingLabel: "Sending…",
    successTitle: "Message sent.",
    successBody: "You'll get a reply within two working days, usually sooner.",
    errorLabel: "Error:",
    rateLimitNote: "Rate limited to 1 message per minute. Your message is never shared.",
    preferEmail: "Prefer email? Reach me directly:",
  },

  resumePage: {
    documentTitleTemplate: "{name} — Resume",
    summaryHeading: "Professional Summary",
    downloadLabel: "Download PDF",
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
    pagesLabel: "Pages",
    copyrightTemplate: "© {year} {name} — built in Next.js & Tailwind",
    backToTop: "Back to top ↑",
    motionToggleLabel: "3D motion",
    motionOn: "on",
    motionOff: "off",
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
    repoLabel: "Source on GitHub",
    liveLabel: "Live demo",
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
    cursorViewLabel: "View",
    sectionProgressTemplate: "Section {current} of {total}",
    notFound: {
      figure: "404",
      title: "Page not found",
      subtitle: "The page you are looking for does not exist or has been moved.",
      back: "Back to home",
    },
  },
};
