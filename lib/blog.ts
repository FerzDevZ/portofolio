import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "@/lib/locale";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  locale: Locale;
  tags?: string[];
  content: string;
};

const postsDirectory = path.join(process.cwd(), "content/blog");

/**
 * How a post's date reads in each locale.
 *
 * A `Record<Locale, …>` rather than a chain of ternaries: adding a locale is a
 * compile error here, instead of quietly formatting its dates in English.
 */
const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  id: "id-ID",
  ja: "ja-JP",
};

/** `2026-10-20` → "20 Oktober 2026" (id) / "October 20, 2026" (en). */
export function formatPostDate(date: string, locale: Locale): string {
  return new Date(date).toLocaleDateString(INTL_LOCALE[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Nama file postingan berformat `slug.<locale>.mdx`; slug tidak boleh kosong. */
const POST_FILE_PATTERN = /^(.+)\.(en|id|ja)\.mdx$/;

/** Mengurai nama file MDX menjadi slug-nya, atau null bila format tidak cocok. */
function parsePostFileName(fileName: string): string | null {
  const match = POST_FILE_PATTERN.exec(fileName);
  if (!match || match[1] === undefined) return null;
  return match[1];
}

/**
 * Get all blog posts for a specific locale, sorted by date descending.
 */
export function getBlogPosts(locale: Locale): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith(`.${locale}.mdx`))
    .flatMap((fileName) => {
      /* Nama file sudah difilter berdasarkan suffix locale, sehingga slug
         selamanya cocok dengan pola postingan; format liar dibuang, bukan
         melempar error saat build. */
      const slug = parsePostFileName(fileName);
      if (!slug) return [];

      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return [
        {
          slug,
          title: data.title || slug,
          description: data.description || "",
          date: data.date || new Date().toISOString().split("T")[0],
          locale,
          tags: data.tags || [],
          content,
        } satisfies BlogPost,
      ];
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}

/**
 * Get a single blog post by slug and locale.
 */
export function getBlogPost(slug: string, locale: Locale): BlogPost | null {
  const fileName = `${slug}.${locale}.mdx`;
  const fullPath = path.join(postsDirectory, fileName);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    date: data.date || new Date().toISOString().split("T")[0],
    locale,
    tags: data.tags || [],
    content,
  };
}

/**
 * Get all unique slugs across both locales.
 */
export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const slugs = new Set<string>();

  fileNames.forEach((fileName) => {
    const slug = parsePostFileName(fileName);
    if (slug) slugs.add(slug);
  });

  return Array.from(slugs);
}
