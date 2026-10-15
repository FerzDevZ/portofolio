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

Enam proyek, riwayat pengalaman, dan klaim "5 years shipping" di halaman ini
**masih placeholder** dari template; yang sudah nyata adalah tiga sertifikat
(Juara I OTN VI, Juara II LKS Provinsi Babel, Juara 2 E-MOSTFET 11). Rencana
menggantinya ada di `docs/roadmap-ui-ux.md` (bagian P0).
