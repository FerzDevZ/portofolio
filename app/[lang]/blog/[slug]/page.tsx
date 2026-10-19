import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getBlogPost, getAllBlogSlugs } from "@/lib/blog";
import { isLocale, type Locale } from "@/lib/locale";
import { getContent, resolveSiteUrl } from "@/lib/content";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  const locales: Locale[] = ["en", "id"];

  const params: { lang: string; slug: string }[] = [];
  for (const slug of slugs) {
    for (const lang of locales) {
      params.push({ lang, slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const post = getBlogPost(slug, lang as Locale);
  if (!post) notFound();

  const content = getContent(lang as Locale);
  const siteUrl = resolveSiteUrl(content.site.url);

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${siteUrl}/${lang}/blog/${slug}`,
      languages: {
        en: `${siteUrl}/en/blog/${slug}`,
        id: `${siteUrl}/id/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/${lang}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [content.site.name],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const post = getBlogPost(slug, lang as Locale);
  if (!post) notFound();

  const content = getContent(lang as Locale);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-canvas/80 border-b border-warm">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href={`/${lang}`}
            className="text-ink font-semibold hover:text-accent transition-colors"
          >
            {content.site.name}
          </a>
          <a
            href={`/${lang}/blog`}
            className="text-muted hover:text-ink transition-colors text-sm"
          >
            {lang === "en" ? "← All posts" : "← Semua postingan"}
          </a>
        </nav>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-12">
          <time className="text-sm text-muted font-mono">
            {new Date(post.date).toLocaleDateString(
              lang === "en" ? "en-US" : "id-ID",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </time>
          <h1 className="text-5xl font-bold text-ink mt-3 mb-6">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-xl text-muted leading-relaxed">
              {post.description}
            </p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-tint text-accent text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg prose-warm max-w-none">
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

      <footer className="border-t border-warm mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-muted text-sm">
          <p>
            {content.footer.copyrightTemplate
              .replace("{year}", new Date().getFullYear().toString())
              .replace("{name}", content.site.name)}
          </p>
        </div>
      </footer>
    </div>
  );
}
