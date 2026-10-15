# Roadmap UI/UX — Portfolio Ferdinand

> Disusun dari kondisi aktual file per 14 Oktober 2026. Diurutkan berdasar
> dampak terhadap persepsi perekrut/klien ÷ usaha. Item **P0** harus
> dikerjakan sebelum dipamerkan ke siapa pun; **P1** minggu ini; **P2**
> polish; **P3** wajah jika ada waktu.

---

## P0 — Kredibilitas konten (dampak terbesar, bukan estetika)

Website ini sudah di level desain yang bagus, tapi **materinya masih
menghianati** itu: enam proyek (Northwind, Atlas, Pulse, Kopi Nusantara,
Ledgerly, Meridian Docs), pengalaman kerja di Northlight Studio / Kreasi
Digital, dan klaim "5 years shipping" semuanya **placeholder dari template**
— tidak satu pun adalah karya Ferdinand asli. Perekrut yang mengklik satu
proyek dan menemukan repo mati akan langsung kalah kredibilitas oleh 3
sertifikat nyata yang sudah terpasang.

1. **Ganti semua data proyek dengan karya asli** dari repo GitHub
   `FerzDevZ`: riset dulu repo apa yang ada, pilih 4–6 karya terkuat,
   tulis deskripsi jujur (apa yang dibangun, dengan stack apa, hasil apa
   yang bisa dibuktikan).
2. **Jujurkan hero + meta rail**: "5 years shipping" / "Design systems,
   web apps" / "Open to freelance" → ganti dengan narasi asli: lulusan SMKN 2
   Pangkalpinang, Juara I OTN VI 2024, Juara II LKS Provinsi Babel. Section
   "Experience" juga perlu cerita yang real: organisasi/solo project/pkl apa
   pun yang nyata.
3. **Setiap proyek punya href yang hidup** — link repo atau demo, bukan
   `#work` yang memutar ke dirinya. Kalau belum ada demo, screenshot sendiri
   cukup, tapi href mati lebih buruk daripada tanpa href.

---

## P1 — Interaktivitas yang memberi cerita (upgrade UX)

Baru selesai: pill nav aktif-meluncur, scroll progress, parallax hero 2
lapisan, tilt 3D sertifikat, glare. Fondasi sudah pro; yang tersisa:

4. **Section reveal on scroll** — setiap section masuk dengan fade+rise lembut
   via IntersectionObserver (transform+opacity saja, hormati
   `prefers-reduced-motion`). Pattern `enter` yang sudah ada hanya berlaku di
   hero; perpanjang ke Work, Capabilities, Experience, Certificates, Contact.
5. **Lightbox sertifikat** — klik foto sertifikat membuka overlay full screen
   dengan gambar besar, backdrop blur, ESC + klik-outside menutup. Nilai:
   perekrut bisa memeriksa kredensial tanpa zoom browser.
6. **Cursor halo bergerak halus** (desktop saja, `@media (hover: hover)`)
   — polish bergaya Linear/Vercel: satu blob radial lembut yang mengikuti
   kursor dengan lag (rAF interpolation, bukan langsung), mix-blend screen,
   opacity sangat rendah (3–5%). Kecil tapi berkesan.
7. **Footer link polish** — footer masih memakai `hover:text-ink` saja;
   samakan bahasa visualnya dengan `link-sweep` yang sudah dipakai di nav.

---

## P2 — Sistem desain: token + detail mikro

8. **Perluas type scale** — heading section sertifikat memakai `text-title`
   yang sama besar dengan judul featured work; hierarki mereka berbeda
   narasinya. Tambah token `--text-section-heading` sendiri agar hierarki
   antar section lebih tegas.
9. **OKLCH light mode** — dark-only sekarang. Semua warna sudah tokenized,
   jadi cukup satu blok `prefers-color-scheme: light` yang mengatur ulang
   token di satu tempat. Jam kerja termahal di roadmap ini, tapi paling
   terlihat di laptop reviewer yang light-mode.
10. **Micro-states konsisten** — button primary sudah 8 states; slot
    sertifikat "foto menyusul" bisa dapat state klikable yang reveal
    placeholder interaktif — pola yang sama dengan offline chip.
11. **Print stylesheet bersih** — recruiter sering mencetak/mengekspor PDF:
    sembunyikan nav/offline chip/progress bar/parallax; tampilkan skill list
    dan sertifikat sebagai layout 2 kolom hitam-putih. `@media print` satu
    blok, ±40 baris CSS.

---

## P3 — Signature moves (bila waktu mengizinkan)

12. **Work panel pseudo-3D** — panel angka "61% client bundle removed"
    adalah div 2D; upgrade: grid bergeser halus mengikuti tilt kursor seperti
    tilt sertifikat, dan angka 61% menjadi counter yang menghitung naik saat
    masuk viewport (IntersectionObserver + rAF).
13. **Screenshot per proyek** — proyek sekarang index-row saja; satu
    screenshot asli per proyek (thumbnail 16:9, preview saat hover row di
    desktop) memperkaya visual. Menunggu P0 selesai — screenshot dari repo
    asli, bukan dummy.
14. **OG image dinamis** (route `opengraph-image` Next 15) — nama + role +
    badge Juara I, auto-generate saat build. Bagikan link di LinkedIn/X/WhatsApp
    sekarang polos; ini impression pertama yang belum ter-render.

---

## Urutan kerja yang disarankan

```
P0.1 riset repo GitHub → P0.2–3 rewrite konten → gate build
→ P1.4 reveal → P1.5 lightbox → verifikasi visual
→ P1.6–7 polish → P2.8–11 (satu per satu, masing-masing gated)
→ P3 terakhir, pilih bernilai: OG image dahulu, lalu work panel 3D.
```

## Kontrak kualitas yang dipertahankan

- Semua animasi transform/opacity, dinyatakan eksplisit — tidak ada
  `transition-all`, tidak ada animasi yang menggerakkan layout.
- Semua efek pointer dipagari `@media (hover: hover)`; sentuh tidak menyala.
- `prefers-reduced-motion` mematikan semuanya — global rule sudah ada di
  globals.css, jangan dilanggar oleh fitur baru.
- Keyboard aksesibilitas: focus-visible terlihat di elemen baru; lightbox
  harus tertutup dengan ESC dan overlay penuh memakai
  `role="dialog" aria-modal="true"`.
- Gate tetap: `npx tsc --noEmit` exit 0 + `npx next build` exit 0 di setiap
  langkah yang mengubah kode, dan verifikasi 320/768/1440
  `scrollWidth === clientWidth` tiap selesai satu fitur.

---

## Selesai per 15 Oktober 2026

- **P1.4 reveal on scroll** — `RevealSection` (IntersectionObserver, hanya
  transform+opacity, state dasar tetap terlihat tanpa JS).
- **P1.5 lightbox sertifikat** — overlay `role="dialog" aria-modal`, fokus
  dikurung lalu dikembalikan ke kartu pemicu, ESC + klik backdrop menutup.
- **P2.9 OKLCH light mode** — palet terang ada di dua blok (`@media` untuk
  pengunjung tanpa skrip + `:root[data-theme="light"]` untuk pilihan
  eksplisit), tombol tiga status (sistem/terang/gelap) dengan pintasan
  Ctrl/Cmd+Shift+L.
- **P3.14 OG image** — kartu 1200×630 di-*generate* saat build, **per bahasa**
  (`/en/opengraph-image/card`, `/id/opengraph-image/card`) plus varian terang
  `/en|id/og-light.png`.
- **Tambahan yang belum ada di roadmap ini**: halaman *case study* statis
  (`/en|id/projects/<slug>`), tekan-skip ke konten, dan **situs bilingual
  EN/ID** — rute `/en` + `/id` sebagai root layout per bahasa, middleware
  untuk memilih bahasa dari `Accept-Language`/cookie, `hreflang` + canonical
  per locale, sitemap dua bahasa, dan shell offline v2 yang menyimpan kedua
  dokumen.
- **P0.1 selesai**: proyek diambil dari repo GitHub nyata, dengan tautan
  repo dan metrik yang bisa ditelusuri ke README-nya. Klaim "5 years" dan
  metrik fiktif dihapus.
- **Masih terbuka di P0**: pengalaman kerja, berkas CV, dan screenshot per
  proyek. Ketiganya butuh data dari pemilik situs.
- **Kualitas yang sekarang diverifikasi**: tes Playwright (routing, metadata,
  overflow 320px, lightbox, count-up, pratinjau), axe pada beranda, ESLint,
  dan Lighthouse dengan ambang di `lighthouserc.json`.

