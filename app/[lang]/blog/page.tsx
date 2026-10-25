import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate, getBlogPosts } from "@/lib/blog";
import {
  formatTemplate,
  getContent,
  isPublishedLocale,
  localeAlternates,
  localizedPath,
  publishedLocales,
  resolveSiteUrl,
} from "@/lib/content";
import { CopyrightLine } from "@/components/copyright-line";
import { PageLinks } from "@/components/page-links";
import { LanguageSwitch } from "@/components/language-switch";
import { SkipLink } from "@/components/skip-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ogSize } from "@/lib/og-card";

/**
 * The blog index.
 *
 * Every string comes from `content.blog`; the page used to hard-code its
 * headline, empty state and date locale inline, which meant `/id/blog` spoke
 * English. Classes are the site's own tokens (`text-ink-muted`, `border-line`,
 * `text-ink-faint`) rather than the undefined `text-muted` / `border-warm`
 * pair it carried — those resolved to nothing, so the hairlines fell back to
 * `currentColor` and the secondary text inherited full-strength ink.
 */

/** Only published locales have routes, so only they are prerendered. */
export function generateStaticParams() {
  return publishedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isPublishedLocale(lang)) return {};

  const content = getContent(lang);
  const blogPath = localizedPath(lang, "/blog");
  const shareImage = {
    url: localizedPath(lang, "/opengraph-image/card"),
    ...ogSize,
    alt: content.blog.heading,
  };

  return {
    title: content.blog.heading,
    description: content.blog.description,
    alternates: {
      canonical: blogPath,
      languages: localeAlternates("/blog"),
    },
    /* A page-level `openGraph` replaces the layout's, so the file-convention
       card is not inherited and has to be named here. */
    openGraph: {
      type: "website",
      title: content.blog.heading,
      description: content.blog.description,
      url: `${resolveSiteUrl(content.site.url)}${blogPath}`,
      siteName: content.site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      images: [shareImage],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isPublishedLocale(lang)) notFound();

  const content = getContent(lang);
  const { blog } = content;
  const posts = getBlogPosts(lang);

  return (
    <>
      <SkipLink label={content.ui.skipToContent} />

      <header className="safe-area-header border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href={localizedPath(lang)}
            className="flex items-center gap-2.5"
            aria-label={`${content.site.name} — ${blog.backToHome}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-line-strong bg-panel font-mono text-[10px] font-medium text-ink">
              {content.site.initials}
            </span>
            <span className="text-sm font-medium tracking-tight text-ink">
              {content.site.name}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitch
              locale={content.locale}
              ui={content.ui}
              currentPath="/blog"
            />
            <ThemeToggle labels={content.ui} />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <header className="pt-16 sm:pt-20">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            {blog.kicker}
          </p>
          <h1 className="mt-6 text-display text-ink">{blog.heading}</h1>
          <p className="mt-6 max-w-xl text-lede text-ink-muted">
            {blog.description}
          </p>
        </header>

        <section className="mt-16">
          <header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              {blog.allPosts}
            </h2>
            <span className="font-mono text-xs text-ink-faint">
              {formatTemplate(blog.countTemplate, {
                count: posts.length,
                plural: posts.length === 1 ? "" : "s",
              })}
            </span>
          </header>

          {posts.length === 0 ? (
            /* An empty index still owes the visitor a way out — the plain
               sentence ended the page in a dead end. */
            <div className="py-16">
              <p className="text-sm text-ink-muted">{blog.emptyState}</p>
              <Link
                href={localizedPath(lang)}
                className="btn btn-ghost mt-6 inline-flex"
              >
                {blog.backToHome}
              </Link>
            </div>
          ) : (
            <ul>
              {posts.map((post) => (
                <li key={post.slug}>
                  <article className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-line py-7 sm:grid-cols-12">
                    <time
                      dateTime={post.date}
                      className="font-mono text-xs text-ink-faint sm:col-span-2"
                    >
                      {formatPostDate(post.date, lang)}
                    </time>
                    <div className="sm:col-span-10">
                      <h3 className="text-row text-ink">
                        <Link
                          href={localizedPath(lang, `/blog/${post.slug}`)}
                          className="link-sweep decoration-transparent"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                        {post.description}
                      </p>
                      {post.tags && post.tags.length > 0 ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="mt-10 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <PageLinks
            locale={content.locale}
            links={content.pageLinks}
            label={content.footer.pagesLabel}
          />
          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <CopyrightLine
              template={content.footer.copyrightTemplate}
              name={content.site.name}
              buildYear={new Date().getFullYear()}
            />
            <Link
              href={localizedPath(lang)}
              className="link-sweep inline-flex min-h-6 items-center font-mono text-[11px] text-ink-faint transition-colors duration-150 hover:text-ink"
            >
              {blog.backToHome}
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
