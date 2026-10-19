import type { Locale } from "@/lib/content/types";

/**
 * The strings the error boundary needs, in one small module.
 *
 * `app/[lang]/error.tsx` is a client component and receives no route params,
 * so it cannot read the server dictionary without dragging `getContent` (and
 * therefore both complete dictionaries) into every route bundle. This is the
 * deliberate exception to "copy lives in en.ts/id.ts": six short strings that
 * exist only for the boundary that has no other way to be localised.
 */
export const errorCopy: Record<
  Locale,
  { eyebrow: string; title: string; body: string; retry: string; home: string }
> = {
  en: {
    eyebrow: "Error",
    title: "Something went wrong",
    body: "This page failed to render. The rest of the site still works.",
    retry: "Try again",
    home: "Back to home",
  },
  id: {
    eyebrow: "Kesalahan",
    title: "Terjadi kesalahan",
    body: "Halaman ini gagal dirender. Bagian lain situs tetap berjalan.",
    retry: "Coba lagi",
    home: "Kembali ke beranda",
  },
  /* Placeholder until the Japanese dictionary ships — same contract as
     every other Record<Locale, …> consumer. */
  ja: {
    eyebrow: "エラー",
    title: "エラーが発生しました",
    body: "このページのレンダリングに失敗しました。サイトの他の部分は動作しています。",
    retry: "再試行",
    home: "ホームへ戻る",
  },
};
