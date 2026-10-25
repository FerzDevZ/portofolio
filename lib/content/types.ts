/* ------------------------------------------------------------------ */
/* The shape both dictionaries must satisfy.                           */
/*                                                                     */
/* Every word the site renders lives in lib/content/en.ts and          */
/* lib/content/id.ts; nothing in a component may hard-code copy. The   */
/* only locale-invariant values (URL, e-mail, timezone, image paths)   */
/* are repeated verbatim in both files so a translation stays a        */
/* single-file edit.                                                   */
/* ------------------------------------------------------------------ */

export type { Locale } from "@/lib/locale";
import type { Locale } from "@/lib/locale";

export type SocialLink = {
  label: string;
  href: string;
  handle: string;
};

export type MetaRow = {
  label: string;
  value: string;
};

export type CaseMetric = {
  /** The figure as it should be read, e.g. "61%". */
  value: string;
  /** What that figure measures, e.g. "client bundle removed". */
  label: string;
};

export type CaseStep = {
  title: string;
  detail: string;
};

export type CaseStudy = {
  /** What the project had to solve, in one paragraph. */
  context: string;
  /** The decisions that did the work, ordered by impact. */
  approach: CaseStep[];
  /** What changed once it shipped, in one paragraph. */
  outcome: string;
  /** The measurable results; the first leads the layout. */
  metrics: CaseMetric[];
};

export type Project = {
  id: string;
  index: string;
  title: string;
  role: string;
  description: string;
  year: string;
  stack: string[];
  /** In-site case study route, without the locale prefix. */
  href: string;
  /** Source repository, shown as an outbound link. */
  repoUrl: string;
  /** Live demo, or null when the project has none. */
  liveUrl: string | null;
  /** Real screenshot under /public, or null — no preview is shown without one. */
  preview: { src: string; alt: string; width: number; height: number } | null;
  caseStudy: CaseStudy;
};

export type Capability = {
  id: string;
  index: string;
  title: string;
  description: string;
  tools: string[];
};

export type Experience = {
  period: string;
  role: string;
  company: string;
  description: string;
};

export type Certificate = {
  id: string;
  /** 01, 02, … — the editorial index in the row gutter. */
  index: string;
  placement: string | null;
  title: string | null;
  issuer: string | null;
  period: string | null;
  /** Path under /public; null = the slot is reserved for a photo. */
  image: string | null;
  imageWidth: number;
  imageHeight: number;
};

export type NavItem = { label: string; href: string };

export type PortfolioContent = {
  locale: Locale;

  /** The name is not translated; the role and the availability line are. */
  site: {
    name: string;
    initials: string;
    role: string;
    homeScreenName: string;
    tagline: string;
    location: string;
    timezone: string;
    email: string;
    url: string;
    availability: string;
    shippingSince: string;
    portrait: string;
    portraitAlt: string;
    description: string;
  };

  hero: {
    eyebrowStart: string;
    eyebrowEnd: string;
    headlineLead: string;
    headlineAccent: string;
    headlineTail: string;
    ledeSuffix: string;
    primaryAction: string;
    secondaryAction: string;
    profileDetailsLabel: string;
  };

  heroMeta: MetaRow[];
  stackStrip: string[];
  /** In-page section anchors on the home page. The header tracks these. */
  nav: NavItem[];
  /**
   * Site-wide page links (blog, contact, resume). Locale-free hrefs, like
   * `Project.href`: every surface prefixes them with `localizedPath`, so a
   * hand-written `/blog` can never drop the visitor into the wrong language.
   */
  pageLinks: NavItem[];

  work: {
    heading: string;
    /** `{count}` is replaced with the number of projects. */
    countTemplate: string;
    featuredLabel: string;
    readCaseStudy: string;
  };

  featuredProject: Project;
  projects: Project[];

  /**
   * Chrome for the blog index and article pages. The articles themselves are
   * MDX files in `content/blog`, not dictionary entries — a post is long-form
   * prose with its own frontmatter, so it is content, not copy.
   */
  blog: {
    heading: string;
    /** The mono eyebrow above the headline. */
    kicker: string;
    description: string;
    emptyState: string;
    /**
     * `{count}` is replaced with the number of published posts, and `{plural}`
     * with the language's plural suffix (`""` or `"s"` in English). A locale
     * that does not inflect simply omits the token.
     */
    countTemplate: string;
    allPosts: string;
    backToHome: string;
  };

  capabilities: {
    heading: string;
    note: string;
    headline: string;
    lede: string;
    items: Capability[];
  };

  experience: {
    heading: string;
    span: string;
    items: Experience[];
  };

  certificates: {
    heading: string;
    /** `{published}` and `{total}` are replaced. */
    publishedTemplate: string;
    reservedNotice: string;
    /** `{placement}` and `{title}` are replaced. */
    enlargeTemplate: string;
    /** `{placement}` and `{title}` are replaced. */
    dialogTemplate: string;
    imageAltTemplate: string;
    closeLabel: string;
    items: Certificate[];
  };

  contact: {
    heading: string;
    kicker: string;
    body: string;
    socialsLabel: string;
  };

  /**
   * Chrome for the standalone `/contact` page. The form fields, their
   * placeholders and every status line live here too — the page used to
   * hard-code its copy, which meant `/id/contact` spoke English.
   *
   * The server action's own messages (rate limit, Resend failures) stay
   * English on purpose: they are rare, and localising them would drag a
   * dictionary into a "use server" module.
   */
  contactPage: {
    kicker: string;
    heading: string;
    lede: string;
    formLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    successTitle: string;
    successBody: string;
    errorLabel: string;
    rateLimitNote: string;
    preferEmail: string;
  };

  /** Chrome for the `/resume` document and its PDF export. */
  resumePage: {
    /** `{name}` is replaced — the metadata title. */
    documentTitleTemplate: string;
    summaryHeading: string;
    downloadLabel: string;
  };

  socials: SocialLink[];

  footer: {
    /** `aria-label` for the row of site-page links. */
    pagesLabel: string;
    /** `{year}` and `{name}` are replaced. */
    copyrightTemplate: string;
    backToTop: string;
    /** Label for the switch that turns the 3D hero scene off and on. */
    motionToggleLabel: string;
    motionOn: string;
    motionOff: string;
  };

  caseStudyPage: {
    /** `{index}` is replaced. */
    eyebrowTemplate: string;
    /** `{title}` is replaced. */
    documentTitleTemplate: string;
    allWork: string;
    contextLabel: string;
    approachLabel: string;
    outcomeLabel: string;
    roleLabel: string;
    yearLabel: string;
    stackLabel: string;
    repoLabel: string;
    liveLabel: string;
    moreLabel: string;
    previousLabel: string;
    nextLabel: string;
    backToPortfolioLabel: string;
  };

  meta: {
    /** `{name}` and `{role}` are replaced. */
    homeTitleTemplate: string;
    /** `{name}` is replaced. */
    caseTitleSuffix: string;
  };

  ui: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    /** `aria-label` for the in-page section nav on the home page. */
    primaryNavLabel: string;
    /** `aria-label` for the collapsed nav panel. */
    mobileNavLabel: string;
    brandBackToTopTemplate: string;
    themeToggleTemplate: string;
    themeSystem: string;
    themeLight: string;
    themeDark: string;
    themeHint: string;
    languageSwitchTemplate: string;
    languageSwitchHint: string;
    offlineChip: string;
    offlineAnnouncement: string;
    clockLabel: string;
    /** Eyebrow on the generated share card. */
    ogCardLabel: string;
    /** Text on the pointer label over a project row. */
    cursorViewLabel: string;
    /** `{current}` and `{total}` are replaced — the section counter that
     *  rides beside the scroll progress bar. */
    sectionProgressTemplate: string;
    notFound: {
      /** The status figure, rendered large above the title. */
      figure: string;
      /** The page headline. */
      title: string;
      /** Explains what happened and where to go next. */
      subtitle: string;
      /** Label of the link back to the home page. */
      back: string;
    };
  };
};
