import { notFound } from "next/navigation";
import { getBlogPosts } from "@/lib/blog";
import { isLocale, type Locale } from "@/lib/locale";
import { getContent, resolveSiteUrl } from "@/lib/content";

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "id"];
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = getContent(lang as Locale);
  const siteUrl = resolveSiteUrl(content.site.url);

  return {
    title: lang === "en" ? "Blog" : "Blog",
    description:
      lang === "en"
        ? "Thoughts on development, design, and technology."
        : "Pemikiran tentang pengembangan, desain, dan teknologi.",
    alternates: {
      canonical: `${siteUrl}/${lang}/blog`,
      languages: {
        en: `${siteUrl}/en/blog`,
        id: `${siteUrl}/id/blog`,
      },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const posts = getBlogPosts(lang as Locale);
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
            href={`/${lang}#nav`}
            className="text-muted hover:text-ink transition-colors text-sm"
          >
            {lang === "en" ? "Back to home" : "Kembali ke beranda"}
          </a>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-ink mb-4">
            {lang === "en" ? "Blog" : "Blog"}
          </h1>
          <p className="text-lg text-muted">
            {lang === "en"
              ? "Thoughts on development, design, and technology."
              : "Pemikiran tentang pengembangan, desain, dan teknologi."}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p>
              {lang === "en"
                ? "No posts yet. Check back soon!"
                : "Belum ada postingan. Segera hadir!"}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-warm pb-12 last:border-0"
              >
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
                <h2 className="text-3xl font-bold text-ink mt-3 mb-4">
                  <a
                    href={`/${lang}/blog/${post.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {post.title}
                  </a>
                </h2>
                <p className="text-muted text-lg mb-4">{post.description}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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
              </article>
            ))}
          </div>
        )}
      </main>

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
