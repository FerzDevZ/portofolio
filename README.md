# portofolio

Situs portofolio pribadi Ferdinand Dero Saputra — **dua bahasa (EN/ID)**, seluruh
halamannya statis, dibangun dengan Next.js 15 (App Router) + React 19 +
Tailwind CSS v4 dan tanpa satu pun library i18n.

- `/en` dan `/id` adalah dua kamus lengkap, bukan terjemahan mesin: setiap kata
  yang dirender berasal dari `lib/content/en.ts` atau `lib/content/id.ts`.
- `/` memilih bahasa dari cookie `NEXT_LOCALE`, lalu `Accept-Language`, lalu
  jatuh ke bahasa default — keputusan itu dibuat di `middleware.ts` sebelum
  routing, supaya semua halaman tetap bisa di-prerender.
- Setiap halaman punya `canonical`, `hreflang` (`en`, `id`, `x-default`),
  kartu Open Graph sendiri per bahasa, dan entri sitemap sendiri.

## Menjalankan

```bash
pnpm install
pnpm dev      # http://localhost:3000  → dialihkan ke /en
pnpm build    # 26 halaman statis
pnpm start
```

Gate yang dipakai sebelum setiap perubahan dianggap selesai:

```bash
npx tsc --noEmit   # exit 0
npx next build     # exit 0, tanpa rute dinamis kecuali middleware
```

> Catatan: jalankan `next build` **hanya** saat `next dev` mati — keduanya
> memakai direktori `.next` yang sama.

## Peta berkas

| Path | Isi |
| --- | --- |
| `app/[lang]/` | Root layout per bahasa (`<html lang>`), beranda, halaman case study |
| `lib/content/` | Kontrak tipe + kamus EN/ID + `formatTemplate` dan `localizedPath` |
| `components/` | Header, hero, work, capabilities, certificates + lightbox, contact, toggle tema |
| `middleware.ts` | Pemilihan bahasa untuk URL tanpa prefix |
| `app/opengraph-image.tsx` | Kartu 1200×630 per bahasa, dirender saat build |
| `public/sw.js` | Shell offline (network-first untuk navigasi, cache-first untuk aset) |
| `docs/roadmap-ui-ux.md` | Rencana kerja dan item yang sudah selesai |
| `MEMORY.md` | Catatan pasca-mortem: apa yang pernah gagal dan aturan yang lahir darinya |

## Prinsip yang dipegang

- Semua animasi hanya `transform`/`opacity`, properti transisi ditulis
  eksplisit (tidak ada `transition-all`), dan `prefers-reduced-motion`
  mematikannya.
- Palet OKLCH dengan palet terang di dua blok (media query untuk pengunjung
  tanpa skrip, atribut `[data-theme]` untuk pilihan eksplisit).
- Efek pointer dipagari `@media (hover: hover)`; sentuh tidak menyala.
- Tombol/kartu 8 state, target sentuh ≥ 24×24, skip link ke konten, fokus
  dikembalikan dengan benar dari lightbox.

## Status konten

Enam proyek di halaman ini diambil dari repositori GitHub `FerzDevZ`, dan
deskripsi serta metriknya mengikuti README masing-masing repo. Metrik yang
tidak bisa dibuktikan dari repo sudah dihapus.

Bagian Experience hanya memuat tonggak yang bisa dibuktikan: enam proyek di
halaman ini dan tiga sertifikat kompetisi. Riwayat kerja formal (nama
perusahaan dan tanggal) tidak diklaim, karena tidak ada sumber yang bisa
diverifikasi di repo.

Yang masih terbuka dan butuh data dari pemilik situs:

- Riwayat kerja formal, bila ada yang ingin dipublikasikan.
- Berkas CV. Belum ada tautan unduh.
- Screenshot per proyek. Hanya FCopier yang punya pratinjau, dan itu
  dokumentasi FCopier, bukan karya desain.

Rencana P0 ada di `docs/roadmap-ui-ux.md`.

## Verifikasi

```bash
pnpm run verify   # typecheck, lint, build, lalu Playwright
pnpm run test     # hanya Playwright (butuh `pnpm run test:install` sekali)
```

Lighthouse dijalankan oleh CI dengan ambang di `lighthouserc.json`. Untuk
menjalankannya secara lokal:

```bash
npx @lhci/cli@0.15.1 autorun --config=lighthouserc.json
```

CI ada di `.github/workflows/ci.yml`: verifikasi di setiap push dan pull
request, lalu Lighthouse setelah verifikasi berhasil.
