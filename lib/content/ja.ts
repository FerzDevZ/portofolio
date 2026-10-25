import type { PortfolioContent } from "@/lib/content/types";

/**
 * Japanese dictionary skeleton — type structure only, content to be translated.
 *
 * This is a prep-only file for future Japanese expansion. All values are
 * placeholders; full translation is not implemented yet.
 */
export const content: PortfolioContent = {
  locale: "ja",

  site: {
    name: "Ferdinand Dero Saputra",
    initials: "FD",
    role: "フロントエンドエンジニア",
    homeScreenName: "Ferdinand",
    tagline: "[Japanese tagline to be translated]",
    location: "Pangkalpinang, Indonesia",
    timezone: "Asia/Jakarta",
    email: "ferdinandderosaputra1@gmail.com",
    url: "https://portofolio-one-xi-42.vercel.app",
    availability: "[Japanese availability to be translated]",
    shippingSince: "2021",
    portrait: "/profile/portrait.webp",
    portraitAlt: "Portrait of Ferdinand Dero Saputra",
    description:
      "[Japanese description to be translated]",
  },

  hero: {
    eyebrowStart: "[Japanese eyebrow to be translated]",
    eyebrowEnd: "[to present]",
    headlineLead: "[Japanese headline to be translated]",
    headlineAccent: "[accent]",
    headlineTail: "[tail to be translated]",
    ledeSuffix: "[Japanese lede to be translated]",
    primaryAction: "[View work]",
    secondaryAction: "[Contact]",
    profileDetailsLabel: "[Profile details]",
  },

  heroMeta: [
    { label: "[Based in]", value: "Pangkalpinang, ID · UTC+7" },
    { label: "[Focus]", value: "[Design systems, web apps]" },
    { label: "[Experience]", value: "[Full-stack, from Indonesia]" },
    { label: "[Status]", value: "[Open to freelance]" },
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
    { label: "[Work]", href: "#work" },
    { label: "[Capabilities]", href: "#capabilities" },
    { label: "[Experience]", href: "#experience" },
    { label: "[Certificates]", href: "#certificates" },
    { label: "[Contact]", href: "#contact" },
  ],

  pageLinks: [
    { label: "[Blog]", href: "/blog" },
    { label: "[Contact]", href: "/contact" },
    { label: "[Resume]", href: "/resume" },
  ],

  work: {
    heading: "01 — [Selected work]",
    countTemplate: "{count} [projects]",
    featuredLabel: "[Featured]",
    readCaseStudy: "[Read case study]",
  },

  featuredProject: {
    id: "jasakite",
    index: "01",
    title: "JASAKITE",
    role: "[Full-stack build · personal project]",
    description: "[Japanese description to be translated]",
    year: "2026",
    stack: ["Next.js 15", "Prisma", "MongoDB", "NextAuth v5"],
    href: "/projects/jasakite",
    repoUrl: "https://github.com/FerzDevZ/jasakite",
    liveUrl: null,
    preview: null,
    caseStudy: {
      context: "[Japanese context to be translated]",
      approach: [
        {
          title: "[Approach title]",
          detail: "[Approach detail to be translated]",
        },
      ],
      outcome: "[Japanese outcome to be translated]",
      metrics: [
        { value: "3", label: "[roles in one application]" },
        { value: "6", label: "[steps from catalog to review]" },
        { value: "320px", label: "[mobile E2E profile]" },
      ],
    },
  },

  projects: [],

  blog: {
    heading: "[Blog]",
    kicker: "[Writing]",
    description: "[Japanese blog description to be translated]",
    emptyState: "[Japanese empty state to be translated]",
    countTemplate: "{count} [posts]",
    allPosts: "[All posts]",
    backToHome: "[Back to home]",
  },

  capabilities: {
    heading: "02 — [Capabilities]",
    note: "[what I do]",
    headline: "[Japanese headline to be translated]",
    lede: "[Japanese lede to be translated]",
    items: [],
  },

  experience: {
    heading: "03 — [Experience]",
    span: "2024 — now",
    items: [],
  },

  certificates: {
    heading: "04 — [Certificates]",
    publishedTemplate: "{published} of {total} [published]",
    reservedNotice: "[Certificate slot]",
    enlargeTemplate: "[Enlarge certificate] {placement} {title}",
    dialogTemplate: "[Certificate] {placement} {title}",
    imageAltTemplate: "[Certificate] {placement} {title} — {issuer}",
    closeLabel: "[Close]",
    items: [],
  },

  contact: {
    heading: "05 — [Contact]",
    kicker: "[Start a conversation]",
    body: "[Japanese contact body to be translated]",
    socialsLabel: "[Social links]",
  },

  contactPage: {
    kicker: "[Contact]",
    heading: "[Get in touch]",
    lede: "[Japanese contact lede to be translated]",
    formLabel: "[Send a message]",
    nameLabel: "[Name]",
    namePlaceholder: "[Your name]",
    emailLabel: "[Email]",
    emailPlaceholder: "[your email]",
    messageLabel: "[Message]",
    messagePlaceholder: "[Tell me about your project]",
    submitLabel: "[Send message]",
    submittingLabel: "[Sending]",
    successTitle: "[Message sent]",
    successBody: "[Japanese success body to be translated]",
    errorLabel: "[Error:]",
    rateLimitNote: "[Rate limited to 1 message per minute]",
    preferEmail: "[Prefer email?]",
  },

  resumePage: {
    documentTitleTemplate: "{name} — [Resume]",
    summaryHeading: "[Professional Summary]",
    downloadLabel: "[Download PDF]",
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
    pagesLabel: "[Pages]",
    copyrightTemplate: "© {year} {name} — [built in Next.js & Tailwind]",
    backToTop: "[Back to top] ↑",
    motionToggleLabel: "[3D motion]",
    motionOn: "[on]",
    motionOff: "[off]",
  },

  caseStudyPage: {
    eyebrowTemplate: "[Case study] — {index}",
    documentTitleTemplate: "{title} — [Case study]",
    allWork: "[All work]",
    contextLabel: "01 — [Context]",
    approachLabel: "02 — [Approach]",
    outcomeLabel: "03 — [Outcome]",
    roleLabel: "[Role]",
    yearLabel: "[Year]",
    stackLabel: "[Stack]",
    repoLabel: "[Source on GitHub]",
    liveLabel: "[Live demo]",
    moreLabel: "[More case studies]",
    previousLabel: "[Previous]",
    nextLabel: "[Next]",
    backToPortfolioLabel: "[back to the portfolio]",
  },

  meta: {
    homeTitleTemplate: "{name} — {role}",
    caseTitleSuffix: "— {name}",
  },

  ui: {
    skipToContent: "[Skip to content]",
    openMenu: "[Open menu]",
    closeMenu: "[Close menu]",
    primaryNavLabel: "[Primary]",
    mobileNavLabel: "[Mobile]",
    brandBackToTopTemplate: "{name} — [back to top]",
    themeToggleTemplate: "[Theme]: {state}",
    themeSystem: "[system]",
    themeLight: "[light]",
    themeDark: "[dark]",
    themeHint: "[click or press Ctrl/Cmd+Shift+L]",
    languageSwitchTemplate: "[Switch to] {language}",
    languageSwitchHint: "[Japanese]",
    offlineChip: "[Offline]",
    offlineAnnouncement: "[Offline announcement]",
    clockLabel: "[Local time in Jakarta]",
    ogCardLabel: "[Portfolio]",
    cursorViewLabel: "[View]",
    sectionProgressTemplate: "[Section] {current} [of] {total}",
    notFound: {
      figure: "404",
      title: "[Page not found]",
      subtitle: "[The page you are looking for does not exist or has been moved.]",
      back: "[Back to home]",
    },
  },
};
