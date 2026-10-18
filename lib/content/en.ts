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
      "Local services marketplace for Indonesia: a filterable catalog, multi-item checkout, a provider order board, and an admin console — on Next.js 15 and Prisma.",
    year: "2026",
    stack: ["Next.js 15", "Prisma", "MongoDB", "NextAuth v5"],
    href: "/projects/jasakite",
    repoUrl: "https://github.com/FerzDevZ/jasakite",
    liveUrl: null,
    preview: null,
    caseStudy: {
      context:
        "Buyers and local service providers need one place to find, book, and pay for work. An order passes through several people before it is finished, so every role has to see that order's next step.",
      approach: [
        {
          title: "Three roles, one order model",
          detail:
            "Customer, provider, and admin share one order lifecycle — received, in progress, completed, cancelled — with a timestamped timeline for each step.",
        },
        {
          title: "Checkout in three steps",
          detail:
            "Address, schedule, then payment, producing one order group from a multi-item cart. Voucher discounts are recalculated on the server, never taken from the client.",
        },
        {
          title: "Tested in two layers",
          detail:
            "Vitest covers the unit logic, and Playwright runs the end-to-end flows in Chromium plus a 320px mobile profile.",
        },
      ],
      outcome:
        "The full flow from catalog to review runs in the repository, with seeded demo accounts for each role. Payment is a simulated step, and the README states that limit plainly.",
      metrics: [
        { value: "3", label: "roles in one application" },
        { value: "6", label: "steps from catalog to review" },
        { value: "320px", label: "mobile E2E profile" },
      ],
    },
  },

  projects: [
    {
      id: "aegisx",
      index: "02",
      title: "AegisX-Mini",
      role: "Machine learning · personal project",
      description:
        "A ~30M-parameter security model trained from scratch, answering only from its own corpus and saying so when it has no support.",
      year: "2026",
      stack: ["Python", "Gradio", "BM25"],
      href: "/projects/aegisx",
      repoUrl: "https://github.com/FerzDevZ/AegisX",
      liveUrl: null,
    preview: null,
      caseStudy: {
        context:
          "Small security chatbots answer confidently from memory. For bug-bounty study a wrong answer costs more than no answer, so the model had to be grounded in a corpus and honest about its gaps.",
        approach: [
          {
            title: "Trained from zero",
            detail:
              "A byte-level BPE tokenizer with 8,192 tokens and a decoder-only transformer, run through pre-training, supervised fine-tuning, and DPO alignment in one Colab notebook.",
          },
          {
            title: "Retrieval without dependencies",
            detail:
              "BM25 over per-section chunks supplies the answer. Each answer cites its source, and a question the corpus does not cover gets an honest \"I don't know\".",
          },
          {
            title: "Agent layer with a human gate",
            detail:
              "A ReAct loop wraps the model behind an authorization gate and an audit log, and any action waits for manual confirmation.",
          },
        ],
        outcome:
          "The pipeline runs end to end from one notebook. The test suite passes 133 of 133, and the model is served as a Gradio app on a Hugging Face Space with int8 quantization and streaming output.",
        metrics: [
          { value: "~30M", label: "parameters, trained from scratch" },
          { value: "133/133", label: "tests passing" },
          { value: "768", label: "token context window" },
        ],
      },
    },
    {
      id: "ftrack",
      index: "03",
      title: "ftrack",
      role: "Systems tool · personal project",
      description:
        "A web archiver in Rust that crawls URLs in parallel, writes WARC archives, and flags leaked secrets and API endpoints.",
      year: "2026",
      stack: ["Rust", "Tokio", "SQLite", "Chromium"],
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
              "Secret and endpoint signatures live in YAML files, so they can change without recompiling the tool.",
          },
        ],
        outcome:
          "Archives follow ISO 28500 (WARC) for interoperability with other preservation tools. Crawl state is kept in SQLite, so later runs proceed incrementally.",
        metrics: [
          { value: "WARC", label: "ISO 28500 archive format" },
          { value: "Tokio", label: "async parallel crawling" },
          { value: "YAML", label: "editable detection rules" },
        ],
      },
    },
    {
      id: "dhybrid",
      index: "04",
      title: "dhybrid-agent",
      role: "CLI tool · personal project",
      description:
        "A terminal coding agent that sends routine steps to a cheap model and hard reasoning to a large one, with a plan mode that blocks every write.",
      year: "2026",
      stack: ["Python 3.12", "CLI", "LLM routing"],
      href: "/projects/dhybrid",
      repoUrl: "https://github.com/FerzDevZ/dhybrid-agent",
      liveUrl: null,
    preview: null,
      caseStudy: {
        context:
          "A coding agent that uses one large model for every step spends budget on file reads and test runs. Its user also needs to know what it may change before it changes anything.",
        approach: [
          {
            title: "Routing per step",
            detail:
              "Routine work — reading files, running tests, small edits — goes to a fast model. Planning and hard debugging escalate to a large one, and escalation needs explicit approval.",
          },
          {
            title: "Plan mode is read-only",
            detail:
              "In plan mode every write, patch, commit, and issue or PR action is blocked, and terminal commands are limited to read-only ones.",
          },
          {
            title: "State stays local",
            detail:
              "All data is kept in ~/.dhybrid/, with no server and no telemetry.",
          },
        ],
        outcome:
          "Installable with pip, released under the MIT license, and marked Beta. Token cost is measured per session through a /tokens command.",
        metrics: [
          { value: "2", label: "modes: plan and build" },
          { value: "0", label: "telemetry sent" },
          { value: "MIT", label: "license, Beta status" },
        ],
      },
    },
    {
      id: "oauth",
      index: "05",
      title: "OAuth system",
      role: "Authentication · personal project",
      description:
        "Google and GitHub sign-in written by hand in Next.js — PKCE, revocable sessions, rate limits, and an audit log, with no auth library.",
      year: "2026",
      stack: ["Next.js", "SQLite", "PKCE"],
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
      id: "fcopier",
      index: "06",
      title: "FCopier",
      role: "Tooling · personal project",
      description:
        "A Playwright-based website cloner with offline export, API recording, and a secret scanner over the assets it saves.",
      year: "2026",
      stack: ["JavaScript", "Playwright"],
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
          "Six shipped projects on this page — a services marketplace, a security model, a Rust archiver, a CLI agent, an OAuth system, and a Playwright cloner — each with its source repository linked.",
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
