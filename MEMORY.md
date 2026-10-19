# 🧠 MEMORY.md — Learned Invariants & Failure Post-Mortems

### 🧠 Learned Invariants & Failure Post-Mortems

- **[26-10-19 · i18n/locales]**: Menambahkan `"ja"` ke `lib/locale.ts` tanpa mendaftarkan kamusnya meledakkan semua `Record<Locale, …>` (dictionary barrel, `error-copy.ts`, `NotFoundView`) → **Root Cause**: `Locale` adalah union tuple, sehingga menambah anggota menuntut key baru di _setiap_ pemetaan per-locale; barrel `lib/content/index.ts` hanya memuat `en`/`id`, sementara `ja.ts` belum diimpor → **Invariant Rule**: menambah locale adalah perubahan lintas-file yang harus menyentuh `lib/locale.ts` + `lib/content/index.ts` + `lib/content/error-copy.ts` + boundary `not-found` dalam satu perubahan; jalankan `npx tsc --noEmit` sebelum menganggap locale siap.

- **[26-10-19 · build/lib/blog.ts]**: Halaman blog & feed mengimport `resolveSiteUrl` dari `@/lib/brand` → **Root Cause**: fungsi memang pindah ke `lib/content/index.ts`, import lama tak diperbarui saat file baru dibuat; ditambah `match[1]` regex bertipe `string | undefined` pada mode strict → **Invariant Rule**: fungsi publik hanya diekspor dari satu path canonical (`@/lib/content`); parser nama file tidak boleh mengindeks regex match tanpa guard `match[i] === undefined`.

- **[26-10-19 · test/vitest.config.ts]**: `npx vitest run` banyak gagal `connect ECONNREFUSED 127.0.0.1:3000` → **Root Cause**: pattern include default Vitest (`**/*.spec.ts`) menelan spec Playwright di `tests/` yang menuntut server berjalan → **Invariant Rule**: pisahkan runner — unit = `*.test.ts` (Vitest), E2E = `tests/*.spec.ts` (Playwright); file `.spec.ts` harus di-exclude dari Vitest.

- **[26-10-19 · test/ekspektasi]**: Tiga test basi gagal setelah perilaku berubah (isLocale ja, localeAlternates berisi ja, formatTemplate tanpa word boundary) → **Root Cause**: test ditulis sebelum `ja` diterapkan dan satu ekspektasi pun salah sejak awal (regex token memang menelan `{name}ing`) → **Invariant Rule**: saat mengubah perilaku domain (`locales`, regex publik), audit dan perbarui test pada commit yang sama; jangan biarkan ekspektasi basi menutupi regresi atau memaksa implementasi diubah.

- **[26-10-19 · lint]**: ESLint menolak apostrof mentah (`react/no-unescaped-entities`) dan assignment ke `module` → **Invariant Rule**: gunakan `&apos;` untuk copy JSX, hindari nama literal ES keyword (`module`) sebagai variabel; jalankan `pnpm lint` bersamaan dengan `tsc` karena keduanya menangkap kelas error berbeda.
