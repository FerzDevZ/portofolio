import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { appleSplashScreens } from "@/lib/apple-splash-screens";
import { canvasHex, themeStorageKey } from "@/lib/brand";
import {
  formatTemplate,
  getContent,
  isLocale,
  locales,
  localizedPath,
  resolveSiteUrl,
  type Locale,
} from "@/lib/content";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";
import "../globals.css";

/**
 * The root layout lives inside `[lang]` on purpose: every page on this site is
 * locale-prefixed, so this is the only layout that has to exist, and it can
 * therefore set `<html lang>` from the segment itself. Unsupported locale
 * values 404 at build time instead of rendering a half-translated page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const content = getContent(lang);

  const homeTitle = formatTemplate(content.meta.homeTitleTemplate, {
    name: content.site.name,
    role: content.site.role,
  });

  return {
    metadataBase: new URL(resolveSiteUrl(content.site.url)),
    title: {
      default: homeTitle,
      template: `%s ${formatTemplate(content.meta.caseTitleSuffix, {
        name: content.site.name,
      })}`,
    },
    description: content.site.description,
    authors: [{ name: content.site.name }],
    openGraph: {
      type: "website",
      locale: lang === "id" ? "id_ID" : "en_US",
      title: homeTitle,
      description: content.site.description,
      url: localizedPath(lang),
      siteName: content.site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: homeTitle,
      description: content.site.description,
    },
    /* No `robots` here on purpose: a not-found response already carries
       `noindex` from Next, and a layout-level `index, follow` would emit a
       second, contradictory robots tag on every 404. Indexing is the default
       for the real pages, so nothing needs to be declared. */
    applicationName: content.site.name,
    /* No `alternates` here on purpose: a canonical is a claim about *this*
       page, and a layout-level canonical is inherited by every URL the segment
       renders — including the 404 boundary, which would then tell a crawler
       that a missing page is a duplicate of the home page. Each real page
       declares its own canonical (the home page in `page.tsx`, a case study in
       its own `generateMetadata`). */
    // Next emits the standardised `mobile-web-app-capable` for `appleWebApp`,
    // but iOS below 15.4 only understands the prefixed spelling.
    other: { "apple-mobile-web-app-capable": "yes" },
    appleWebApp: {
      capable: true,
      title: content.site.homeScreenName,
      statusBarStyle: "black-translucent",
    },
  };
}

export const viewport: Viewport = {
  /* One hex per scheme, shared with the manifest through `lib/brand.ts` so the
     status bar, the splash surface and the manifest cannot drift apart. */
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: canvasHex.dark },
    { media: "(prefers-color-scheme: light)", color: canvasHex.light },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = getContent(lang as Locale);
  /* Resolved once here so the JSON-LD graph and the metadata agree on the
     origin the site claims, whatever domain the host assigned. */
  const siteUrl = resolveSiteUrl(content.site.url);

  return (
    <html
      lang={lang}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Resolves the stored theme before the first paint, so the page never
            flashes the wrong palette. Kept as a plain string: it must run
            before React hydrates, and it must survive a JS error. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  try {
    const key = ${JSON.stringify(themeStorageKey)};
    const stored = localStorage.getItem(key);
    const theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-preference', theme);
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink">
        {/* React hoists these into <head>; iOS matches exactly one by device
            metrics when it builds the launch screen. */}
        {appleSplashScreens.map((splashScreen) => (
          <link
            key={splashScreen.href}
            rel="apple-touch-startup-image"
            href={splashScreen.href}
            media={splashScreen.media}
          />
        ))}
        {children}
        <ServiceWorkerRegistrar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  url: siteUrl,
                  name: content.site.name,
                  description: content.site.description,
                  inLanguage: lang === "id" ? "id-ID" : "en-US",
                },
                {
                  "@type": "Person",
                  "@id": `${siteUrl}/#person`,
                  name: content.site.name,
                  url: siteUrl,
                  description: content.site.role,
                  jobTitle: content.site.role,
                  address: content.site.location,
                  email: content.site.email,
                  /* The socials are already rendered as links in the contact
                     section; the same URLs let a crawler connect the profiles
                     to the person instead of treating them as unrelated. */
                  sameAs: content.socials
                    .filter((socialLink) => socialLink.href.startsWith("http"))
                    .map((socialLink) => socialLink.href),
                },
                /* Each published case study, so search results can surface the
                   individual projects rather than only the home page. The
                   featured project leads this list everywhere else on the site
                   (`generateStaticParams`, the sitemap, the work section), and
                   leaving it out here made the one project the home page
                   promotes the only one absent from the structured data. */
                ...[content.featuredProject, ...content.projects].map((project) => ({
                  "@type": "CreativeWork",
                  "@id": `${siteUrl}${localizedPath(lang, project.href)}`,
                  name: project.title,
                  description: project.description,
                  url: `${siteUrl}${localizedPath(lang, project.href)}`,
                  dateCreated: project.year,
                  keywords: project.stack.join(", "),
                  author: { "@id": `${siteUrl}/#person` },
                  ...(project.repoUrl.startsWith("http")
                    ? { codeRepository: project.repoUrl }
                    : {}),
                })),
                /* Awards, taken from the real certificates — nothing is
                   asserted here that the certificates section does not show. */
                ...content.certificates.items
                  .filter(
                    (certificate) =>
                      certificate.title !== null && certificate.issuer !== null,
                  )
                  .map((certificate) => ({
                    "@type": "Award",
                    name:
                      certificate.placement === null
                        ? certificate.title
                        : `${certificate.placement} — ${certificate.title}`,
                    description: certificate.issuer,
                    ...(certificate.period !== null
                      ? { dateCreated: certificate.period }
                      : {}),
                    recipient: { "@id": `${siteUrl}/#person` },
                  })),
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
