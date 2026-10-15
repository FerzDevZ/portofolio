# Roadmap UI/UX v2 — Full 3D & Interaktif (Profesional, Ringan)

> Desain upgrade untuk portofolio Ferdinand, Oktober 2026.
> Prinsip dasar: **3D adalah lapisan pengalaman, bukan wadah konten.**
> Kredibilitas (P0 dari roadmap lama) tetap syarat masuk: konten asli dulu,
> lalu efek-efek ini di atasnya.

---

## 0. Kebijakan arsitektur (kenapa bukan "game seperti bruno-simon.com")

Riset 2025–2026 (Bruno Simon, Awwwards case study, R3F docs, web.dev lucid)
menunjukkan tiga hal:

1. **Portofolio 3D terbaik menjadikan interaksi sebagai bukti keahlian**, bukan
   dekorasi. Bruno Simon pakai mobil 3D karena ia creative developer — 3D
   *adalah* portofolionya. Ferdinand frontend engineer: 3D harus terasa seperti
   "orang ini paham view pipeline dan perf", bukan "orang ini bisa deploy demo".
2. **Konten inti harus tetap HTML server-rendered.** H1, deskripsi proyek,
   tautan, dan nav tidak boleh hidup di dalam canvas — recruiter yang screenshot
   buat deck, search engine, dan screen reader membaca HTML, bukan WebGL.
3. **Angka beban Three.js: ~181 kB gzip (`three`) + ~56 kB gzip (R3F)** — hanya
   layak bila scene memang membawa nilai yang CSS 3D tidak bisa. Pilih
   teknologi per efek:

   | Efek               | Teknologi                    | Biaya             |
   |--------------------|------------------------------|-------------------|
   | Hero scene interaktif (draggable) | R3F + drei, dynamic import | ~237 kB gzip (lazy) |
   | Shader ambient satu layar | OGL langsung / WebGL raw | ~8–29 kB          |
   | Tilt/depth pada kartu DOM | CSS 3D (`perspective`)   | 0 kB              |
   | Partikel/garis 2D  | Canvas 2D buatan sendiri      | 0 kB              |
   | Reveal berbasis scroll | CSS `animation-timeline` + fallback `RevealSection` yang sudah ada | 0 kB (di Chrome/Edge/Safari 26+; Firefox 161+) |

Aturan keputusan: **uji dulu "bisa ini CSS?"** lalu "bisa ini canvas 2D?" — baru
R3F. Setiap penambahan wajib lulus gate yang sudah ada: `tsc --noEmit` exit 0,
`next build` exit 0, `prefers-reduced-motion` mematikan semuanya, hover-only,
dan verifikasi `scrollWidth === clientWidth` di 320/768/1440.

---

## 1. Signature move #1 — Hero WebGL interaktif (R3F, lazy)

**Kondisi sekarang:** hero punya parallax grid 2D + portrait tilt. Bagus, tapi
"datar" dibanding tren 2026.

**Desain:** lapisan 3D hidup di belakang teks — tetap bold, tetap on-brand:

- **Scene proposal (pilih satu):**
  a) **"Capabilities field"** — grid partikel/kubus kecil membentuk relief
     alpha/oklch yang bergelombang perlahan (noise shader + instancing). Saat
     kursor mendekat, near-field sedikit pagination terdorong (dampak halus,
     atau *repulsion* ringan). Saat scroll, kamera rise sedikit → transisi
     organik menuju Work. **Rekomendasi: ini,** karena konsepnya memetakan
     langsung ke narasi "design systems & precision".
  b) **Distori metallic logo "F3"** low-poly yang dilingkari perlahan
     (lebih personal, lebih "fun", lebih mahal di asset pipeline — butuh file
     `.glb`).

- **Pola teknis (dari riset, wajib):**
  - Komponen server tetap menyajikan **teks + CTA sebagai HTML** di atas canvas
    (lapisan zalist `pointer-events: none` untuk canvas supaya teks tetap
    selectable).
  - `next/dynamic(() => import('./hero-scene'), { ssr: false })` dipanggil
    **dari Client Component kecil** (`HeroSceneLoader`) yang hidup di dalam
    Server Component — Next 15 tidak mengizinkan `ssr: false` di Server
    Component.
  - `loading:` fallback = **poster CSS statis** (gradient + grid) yang
    menempati slot ukurannya tetap → **LCP tetap ≤ 2,5 detik**, zero CLS.
  - `<Canvas frameloop="demand" dpr={[1, 1.5]}>` + **IntersectionObserver:
    hanya render saat hero terlihat** (scroll keluar hero = `frameloop: 'never'`
    atau pause). Ini memangkas konsumsi GPU 90%+ saat mengscroll ke bawah.
  - Semua interaksi kursor **hanya di `@media (hover: hover)`**. Di sentuh,
    scene diam (atau auto-drift lembut).
  - Hormati `prefers-reduced-motion`: scene diganti poster statis.
  - Budget bundle: total JS halaman home naik max **≤ 250 kB gzip** —
    pastikan berada di chunk terpisah (`next/dynamic`) sehingga First Load JS
    rute lain tidak ikut kena (cukup cek output `next build`).

---

## 2. Signature move #2 — Cursor spotlight + magnetic CTA (0,3 kB, besar efek)

- **Spotlight cursor** (desktop `hover: hover` saja): satu radial-gradient
  (`oklch accent, opacity 3–5%`) diepi di `transform: translate()` lewat rAF
  interpolasi (lag lembut ala Linear). Ini pola yang Direktori UI/UX 2026
  sekarang standar pada situs Vercel/Linear-style. Ganti emisi warna di
  light mode jadi ink-alpha 4%.
- **Magnetic buttons** pada dua CTA hero ("View selected work", "Get in
  touch"): pointer mendekat → tombol bergeser halus ke arah kursor (max
  6 px, ease-out, transform only). Kursor keluar → kembali ke 0 degan
  spring sederhana (rAF spring, bukan library). Tetap keyboard-focusable,
  tetap `<a>` semantik.
- Total tambahan: ~1 kB JS. Tidak ada yang bergantung pada hover untuk bisa
  dipeluk olenm fungsional — murni hiasan yang biaya nol bila tidak tersedia.

---

## 3. Scroll-driven tanpa library (upgrade pola yang sudah ada)

`RevealSection` sudah ada (IO + transform/opacity). Upgrade progresif dengan
**CSS scroll-driven animations** supaya di Chromium/Safari 26+ bahkan tanpa JS
saat first paint efek tetap jalan:

```css
@supports (animation-timeline: view()) {
  /* Section masuk: naik + fade sinkron pakai timeline viewport */
  .section-reveal {
    animation: reveal-in linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 45%;
  }
  /* Progress bar gradient juga bisa murni CSS di Chromium:
     scroll-progress yang sekarang JS-driven dapat memakai
     animation-timeline: scroll(root). Fallback: kode saat ini tetap. */
}

@media (prefers-reduced-motion: reduce) {
  .section-reveal { animation: none; }
}
```

- **Baru: 3D scroll depth pada featured work panel.** Panel "61%" yang sekarang
  statis diberi perso apa yang tilt sertifikat pakai (grid di belakangnya ber-
  shift halus mengikuti kursor). Plus: angka 61% menjadi **counter yang naik
  saat masuk viewport** (rAF + IO, tanpa library). Ini nama-nama item #12 dari
  roadmap lama — kini bisa dikerjakan murni CSS 3D + JS kecil.

---

## 4. Signature move #3 — Project hover preview 3D

Roadmap lama sudah rencanakan hover preview per project row. Upgrade terbaiknya:

- Hover baris project di desktop → **thumbnail screenshot** muncul mengambang
  di sisi kursor, dengan **perspective CSS 3D**: kartu mengerti sedikit sesuai
  posisi kursor, dengan sparkle highlight. Ini sensasi "105% effort" tanpa
  WebGL, < 40 baris CSS + 20 baris JS. Touch: thumbnail jadi inline thumbnail
  statis.
- Data thumbnail dari **screenshot asli proyek asli** (menunggu P0 konten asli
  — tanpa proyek asli, ini saatnya belum datang).

---

## 5. Micro-experience tambahan (peringkat: murah → besar)

| # | Upgrade | Teknologi | Effort | Dampak |
|---|---------|-----------|--------|--------|
| 5.1 | **Stack strip 3D marquee** — strip stack di bawah hero jadi dua baris marquee berlawanan arah dengan mask fade edges, pause on hover | CSS keyframes `translateX` | S | menambah "alive" tanpa JS |
| 5.2 | **Certificate tilt → full 3D scene card** — tilt saat existing ditambah depth layers: foto + nama + issuer masing-masing beda `translateZ` (memakai `perspective` milik frame) → saat tilt, teks "melayang" di atas foto | CSS 3D | M | 3D yang berarti, bukan dekorasi |
| 5.3 | **KPI case-study: animated counters** — angka 61%, 3.2×, dsb. naik saat masuk viewport (IO + rAF, `will-change: transform` tidak perlu, cukup textContent) dan **tabular-nums** supaya tidak jitter | JS ±20 baris | S | so kompetensi "detail yang Fer cleric" |
| 5.4 | **Page transition fade/slide** antar rute case-study dengan View Transitions API (`@view-transition {navigation: auto}`) — di Chromium/Chrome 126+ bahkan dengan MPA — dengan fallback instan di browser lama | CSS satu blok | XS | terasa "SPA premium" tanpa JS |
| 5.5 | **Audio-reactive / scroll-scrub hero scene** — kamera R3F digerakkan dari progress scroll (sudah ada scrollY; cukup konsultasi uniform) | wiring ringan | M | sinematik |
| 5.6 | **Smooth scroll ala Lenis** | JS 5 kB | M | opsional — biasanya tidak worth untuk situs ini; scroll native lebih aksesibel (rujuk riset) |

---

## 6. Sistem desain biar semuanya "professional", tidak "slop"

- **Kontras tetap AA**: efek tidak boleh menumpulkan teks. Spotlight cursor
  tidak melewati teks utama (z-index di bawah `ink` layer).
- **Satu bahasa gerak**: semua easing memakai kurva cubic-bezier(0.22, 0.7,
  0.3, 1) yang sudah jadi identitas situs. Tidak menambah kurva baru.
- **Budget berat**: define contract — JS halaman home (dengan hero scene lazy
  chunk) tertap ≤ 450 kB gzip, LCP ≤ 2,5 s, CLS 0. Setelah selesai
  setiap signature move, jalankan+catat Lighthouse mobile.
- **3D harus punya "off switch"**: panel kecil di header/model terbuka bila
  user ingin "mode hemat" (menyimpan pilihan di localStorage) — beri jalan
  keluar bagi pengguna GPU lemah. Plus otomatis: `navigator.hardwareConcurrency
  <= 4` atau WebGL context gagal dibuat → poster statis.

---

## 7. Urutan kerja yang disarankan

```
P0 konten asli (roadmap lama, masih terbuka) →
1. Spotlight cursor + magnetic CTA (2 jam, dry-run big win)
2. Scroll-driven CSS reveal upgrade (@supports, no-JS menang)
3. Counter KPI + work panel tilt 3D (CSS-3D, no WebGL)
4. Hero R3F "Capabilities field" (lazy, postered, frameloop demand)
5. Project hover preview 3D thumbnail (butuh screenshot asli)
6. Marquee stack strip + view transitions + polish
```

Setiap langkah diakhiri: `tsc --noEmit` 0, `next build` 0, checklist overlay
manual 320/768/1440,OrFail spot-check Lighthouse.

---

## Rujukan

- Next.js lazy loading client components — nextjs.org/docs/app/guides/lazy-loading
- R3F Canvas & scaling performance — r3f.docs.pmnd.rs
- web.dev Optimize LCP — web.dev/articles/optimize-lcp
- Bundlephobia: three.js ~180,6 kB gzip; @react-three/fiber ~56,3 kB gzip
- MDN scroll-driven animations; WebKit blog 2025 — Safari 26
- Motion.dev — magnetic cursors dengan prefers-reduced-motion
- Awwwards case study bruno-simon — pola "3D sebagai kompetensi"
