import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { formatPostDate, getAllBlogSlugs, getBlogPost } from "@/lib/blog";
import {
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
 * One blog article.
 *
 * The article body is styled by `.post-body` in `globals.css`: the page used to
 * wrap it in `prose prose-lg prose-warm`, and no typography plugin is installed,
 * so `prose` matched nothing and the MDX rendered as unstyled body text. The
 * wrapper now uses the same ink, hairline and fluid type tokens as the rest of
 * the site.
 */

/**
 * Every published article, in every published locale.
 *
 * Filtered through `getBlogPost` because a slug is not required to exist in
 * both languages: the unfiltered cross-product prerendered a 404 for the
 * missing half.
 */
export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of publishedLocales) {
    for (const slug of getAllBlogSlugs()) {
      if (getBlogPost(slug, lang)) params.push({ lang, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isPublishedLocale(lang)) return {};

  const post = getBlogPost(slug, lang);
  if (!post) return {};

  const content = getContent(lang);
  const postPath = localizedPath(lang, `/blog/${slug}`);
  const shareImage = {
    url: localizedPath(lang, "/opengraph-image/card"),
    ...ogSize,
    alt: post.title,
  };

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: postPath,
      languages: localeAlternates(`/blog/${slug}`),
    },
    /* A page-level `openGraph` replaces the layout's, so the file-convention
       card has to be named explicitly or this page ships without one. */
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${resolveSiteUrl(content.site.url)}${postPath}`,
      siteName: content.site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      publishedTime: post.date,
      authors: [content.site.name],
      images: [shareImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isPublishedLocale(lang)) notFound();

  const post = getBlogPost(slug, lang);
  if (!post) notFound();

  const content = getContent(lang);
  const { blog } = content;

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
            <Link
              href={localizedPath(lang, "/blog")}
              className="inline-flex min-h-6 items-center font-mono text-xs text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              {blog.allPosts}
            </Link>
            <LanguageSwitch
              locale={content.locale}
              ui={content.ui}
              currentPath={`/blog/${post.slug}`}
            />
            <ThemeToggle labels={content.ui} />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <article className="max-w-2xl pt-16 sm:pt-20">
          <header>
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
              {blog.kicker}
            </p>
            <h1 className="mt-6 text-display text-ink">{post.title}</h1>
            {post.description ? (
              <p className="mt-6 text-lede text-ink-muted">{post.description}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-6">
              <time
                dateTime={post.date}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
              >
                {formatPostDate(post.date, lang)}
              </time>
              {post.tags && post.tags.length > 0
                ? post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
                    >
                      {tag}
                    </span>
                  ))
                : null}
            </div>
          </header>

          <div className="post-body mt-10">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeHighlight],
                },
              }}
            />
          </div>
        </article>
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
              href={localizedPath(lang, "/blog")}
              className="link-sweep inline-flex min-h-6 items-center font-mono text-[11px] text-ink-faint transition-colors duration-150 hover:text-ink"
            >
              {blog.allPosts}
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
