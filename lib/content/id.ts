import type { PortfolioContent } from "@/lib/content/types";

/**
 * Kamus bahasa Indonesia.
 *
 * Terjemahan bebas yang menjaga istilah teknis (nama stack, metrik, istilah
 * desain) tetap dalam bentuk aslinya, karena itulah kata yang dipakai di
 * industri. Nilai yang tidak bergantung bahasa (URL, surel, zona waktu, jalur
 * gambar, dimensi sertifikat) sengaja diulang dari `en.ts`.
 */
export const content: PortfolioContent = {
  locale: "id",

  site: {
    name: "Ferdinand Dero Saputra",
    initials: "FD",
    role: "Frontend Engineer",
    homeScreenName: "Ferdinand",
    tagline:
      "Frontend engineer yang membangun antarmuka tenang dan presisi untuk web.",
    location: "Pangkalpinang, Indonesia",
    timezone: "Asia/Jakarta",
    email: "ferdinandderosaputra1@gmail.com",
    url: "https://portofolio-one-xi-42.vercel.app",
    availability: "Terbuka untuk proyek terpilih",
    shippingSince: "2021",
    portrait: "/profile/portrait.webp",
    portraitAlt: "Foto Ferdinand Dero Saputra",
    description:
      "Portofolio Ferdinand Dero Saputra — frontend engineer yang fokus pada design system, performa, dan antarmuka dengan pengekangan editorial.",
  },

  hero: {
    eyebrowStart: "Portofolio —",
    eyebrowEnd: "hingga sekarang",
    headlineLead: "Antarmuka yang dibangun dengan",
    headlineAccent: "pengekangan",
    headlineTail: ", dirilis dengan presisi.",
    ledeSuffix:
      "Design system, anggaran performa, dan detail yang baru terasa ketika hilang.",
    primaryAction: "Lihat karya pilihan",
    secondaryAction: "Hubungi saya",
    profileDetailsLabel: "Detail profil",
  },

  heroMeta: [
    { label: "Berbasis di", value: "Pangkalpinang, ID · UTC+7" },
    { label: "Fokus", value: "Design system, aplikasi web" },
    { label: "Pengalaman", value: "Full-stack, dari Indonesia" },
    { label: "Status", value: "Terbuka untuk freelance" },
  ],

  stackStrip: [
    "TypeScript",
    "React 19",
    "Next.js 15",
    "Tailwind CSS",
    "Node.js",
    "PostgreSQL",
    "Playwright",
    "Figma",
  ],

  nav: [
    { label: "Karya", href: "#work" },
    { label: "Kemampuan", href: "#capabilities" },
    { label: "Pengalaman", href: "#experience" },
    { label: "Sertifikat", href: "#certificates" },
    { label: "Kontak", href: "#contact" },
  ],

  work: {
    heading: "01 — Karya pilihan",
    countTemplate: "{count} proyek",
    featuredLabel: "Unggulan",
    readCaseStudy: "Baca studi kasusnya",
  },

  featuredProject: {
    id: "jasakite",
    index: "01",
    title: "JASAKITE",
    role: "Full-stack · proyek pribadi",
    description:
      "Marketplace jasa lokal untuk Indonesia: katalog dengan filter, checkout multi-item, papan pesanan untuk penyedia, dan konsol admin — di atas Next.js 15 dan Prisma.",
    year: "2026",
    stack: ["Next.js 15", "Prisma", "MongoDB", "NextAuth v5"],
    href: "/projects/jasakite",
    repoUrl: "https://github.com/FerzDevZ/jasakite",
    liveUrl: null,
    preview: null,
    caseStudy: {
      context:
        "Pembeli dan penyedia jasa lokal butuh satu tempat untuk mencari, memesan, dan membayar. Sebuah pesanan melewati beberapa orang sebelum selesai, jadi setiap peran harus melihat langkah berikutnya dari pesanan itu.",
      approach: [
        {
          title: "Tiga peran, satu model pesanan",
          detail:
            "Pelanggan, penyedia, dan admin memakai siklus pesanan yang sama — diterima, dikerjakan, selesai, dibatalkan — dengan linimasa berstempel waktu untuk setiap langkah.",
        },
        {
          title: "Checkout tiga langkah",
          detail:
            "Alamat, jadwal, lalu pembayaran, menghasilkan satu grup pesanan dari keranjang multi-item. Potongan voucher dihitung ulang di server, tidak pernah diambil dari klien.",
        },
        {
          title: "Diuji di dua lapisan",
          detail:
            "Vitest menguji logika unit, dan Playwright menjalankan alur end-to-end di Chromium serta profil mobile 320px.",
        },
      ],
      outcome:
        "Alur lengkap dari katalog sampai ulasan berjalan di repositori, dengan akun demo untuk setiap peran. Pembayaran berupa langkah simulasi, dan README menyebut batas itu dengan jelas.",
      metrics: [
        { value: "3", label: "peran dalam satu aplikasi" },
        { value: "6", label: "langkah dari katalog ke ulasan" },
        { value: "320px", label: "profil E2E mobile" },
      ],
    },
  },

  projects: [
    {
      id: "aegisx",
      index: "02",
      title: "AegisX-Mini",
      role: "Machine learning · proyek pribadi",
      description:
        "Model keamanan siber ±30M parameter yang dilatih dari nol; hanya menjawab dari korpusnya sendiri dan jujur saat tidak ada dukungan.",
      year: "2026",
      stack: ["Python", "Gradio", "BM25"],
      href: "/projects/aegisx",
      repoUrl: "https://github.com/FerzDevZ/AegisX",
      liveUrl: null,
    preview: null,
      caseStudy: {
        context:
          "Chatbot keamanan kecil sering menjawab dengan yakin dari ingatannya. Untuk belajar bug bounty, jawaban yang salah lebih mahal daripada tidak menjawab, jadi model harus berpijak pada korpus dan jujur tentang celahnya.",
        approach: [
          {
            title: "Dilatih dari nol",
            detail:
              "Tokenizer byte-level BPE berukuran 8.192 token dan transformer decoder-only, dijalankan lewat pre-training, supervised fine-tuning, dan DPO dalam satu notebook Colab.",
          },
          {
            title: "Retrieval tanpa dependensi",
            detail:
              "BM25 atas potongan per bagian menyediakan jawaban. Setiap jawaban mencantumkan sumbernya; pertanyaan di luar korpus dijawab dengan \"tidak tahu\".",
          },
          {
            title: "Lapisan agent dengan gerbang manusia",
            detail:
              "Loop ReAct dibungkus gerbang otorisasi dan log audit, dan setiap tindakan menunggu konfirmasi manual.",
          },
        ],
        outcome:
          "Pipeline berjalan dari ujung ke ujung dari satu notebook. Suite tes lulus 133 dari 133, dan model disajikan sebagai aplikasi Gradio di Hugging Face Space dengan kuantisasi int8 dan output streaming.",
        metrics: [
          { value: "~30M", label: "parameter, dilatih dari nol" },
          { value: "133/133", label: "tes lulus" },
          { value: "768", label: "token konteks" },
        ],
      },
    },
    {
      id: "ftrack",
      index: "03",
      title: "ftrack",
      role: "Tool sistem · proyek pribadi",
      description:
        "Pengarsip web berbasis Rust yang merayapi URL secara paralel, menulis arsip WARC, dan menandai rahasia serta endpoint API yang bocor.",
      year: "2026",
      stack: ["Rust", "Tokio", "SQLite", "Chromium"],
      href: "/projects/ftrack",
      repoUrl: "https://github.com/FerzDevZ/ftrack",
      liveUrl: null,
    preview: null,
      caseStudy: {
        context:
          "Mengarsipkan situs untuk audit atau preservasi lebih dari sekadar unduhan rekursif. Situs modern dirender dengan JavaScript, dan hasilnya harus mengikuti standar yang bisa dibaca alat preservasi lain.",
        approach: [
          {
            title: "Perayapan paralel dengan batas",
            detail:
              "Task Tokio berjalan di bawah JoinSet dan Semaphore, sehingga banyak URL diproses sekaligus tanpa membebani mesin.",
          },
          {
            title: "Chromium headless untuk SPA",
            detail:
              "Halaman menjalankan JavaScript sebelum ditangkap, sehingga aplikasi single-page diarsipkan dengan konten yang benar-benar dilihat pengunjung.",
          },
          {
            title: "Aturan deteksi sebagai data",
            detail:
              "Signature rahasia dan endpoint disimpan di berkas YAML, sehingga bisa diubah tanpa mengompilasi ulang.",
          },
        ],
        outcome:
          "Arsip mengikuti ISO 28500 (WARC) agar bisa dipakai bersama alat preservasi lain. Status perayapan disimpan di SQLite, sehingga eksekusi berikutnya berjalan inkremental.",
        metrics: [
          { value: "WARC", label: "format arsip ISO 28500" },
          { value: "Tokio", label: "perayapan async paralel" },
          { value: "YAML", label: "aturan deteksi yang bisa diedit" },
        ],
      },
    },
    {
      id: "dhybrid",
      index: "04",
      title: "dhybrid-agent",
      role: "Tool CLI · proyek pribadi",
      description:
        "Agent coding di terminal yang mengirim langkah rutin ke model murah dan penalaran berat ke model besar, dengan mode plan yang memblokir setiap penulisan.",
      year: "2026",
      stack: ["Python 3.12", "CLI", "LLM routing"],
      href: "/projects/dhybrid",
      repoUrl: "https://github.com/FerzDevZ/dhybrid-agent",
      liveUrl: null,
    preview: null,
      caseStudy: {
        context:
          "Agent coding yang memakai satu model besar untuk setiap langkah menghabiskan anggaran untuk membaca berkas dan menjalankan tes. Penggunanya juga perlu tahu apa yang boleh diubah sebelum agent mengubah apa pun.",
        approach: [
          {
            title: "Routing per langkah",
            detail:
              "Pekerjaan rutin — membaca berkas, menjalankan tes, edit kecil — masuk ke model cepat. Perencanaan dan debugging sulit dinaikkan ke model besar, dan eskalasi harus disetujui.",
          },
          {
            title: "Mode plan hanya baca",
            detail:
              "Di mode plan setiap write, patch, commit, serta aksi issue atau PR diblokir, dan perintah terminal dibatasi ke perintah baca saja.",
          },
          {
            title: "Data tetap lokal",
            detail:
              "Semua data disimpan di ~/.dhybrid/, tanpa server dan tanpa telemetri.",
          },
        ],
        outcome:
          "Bisa dipasang lewat pip, berlisensi MIT, dan berstatus Beta. Biaya token diukur per sesi lewat perintah /tokens.",
        metrics: [
          { value: "2", label: "mode: plan dan build" },
          { value: "0", label: "telemetri yang dikirim" },
          { value: "MIT", label: "lisensi, status Beta" },
        ],
      },
    },
    {
      id: "oauth",
      index: "05",
      title: "Sistem OAuth",
      role: "Autentikasi · proyek pribadi",
      description:
        "Login Google dan GitHub yang ditulis tangan di Next.js — PKCE, sesi yang bisa dicabut, rate limit, dan log audit, tanpa library auth.",
      year: "2026",
      stack: ["Next.js", "SQLite", "PKCE"],
      href: "/projects/oauth",
      repoUrl: "https://github.com/FerzDevZ/oauth-system",
      liveUrl: null,
    preview: null,
      caseStudy: {
        context:
          "Library auth menyembunyikan keputusan yang penting: di mana verifier PKCE disimpan, bagaimana sesi dicabut, dan di mana login gagal dicatat. Menulis alurnya sendiri membuat keputusan itu terlihat.",
        approach: [
          {
            title: "PKCE untuk Google",
            detail:
              "Alur Google memakai authorization code grant dengan code challenge S256.",
          },
          {
            title: "Sesi yang bisa dicabut",
            detail:
              "Sesi disimpan di SQLite. Logout mengakhiri perangkat saat ini, dan logout dari semua perangkat mencabut sisanya.",
          },
          {
            title: "Batas dan log",
            detail:
              "Endpoint auth dibatasi rate-nya, dan setiap kejadian auth ditulis ke berkas log.",
          },
        ],
        outcome:
          "Unit test berjalan dengan Vitest dan alur end-to-end dengan Playwright. README mencantumkan redirect URI yang dibutuhkan untuk pengembangan lokal.",
        metrics: [
          { value: "2", label: "penyedia: Google, GitHub" },
          { value: "S256", label: "metode PKCE challenge" },
          { value: "E2E", label: "alur Playwright" },
        ],
      },
    },
    {
      id: "fcopier",
      index: "06",
      title: "FCopier",
      role: "Tooling · proyek pribadi",
      description:
        "Penyalin situs berbasis Playwright dengan ekspor offline, rekaman API, dan pemindai rahasia pada aset yang disimpan.",
      year: "2026",
      stack: ["JavaScript", "Playwright"],
      href: "/projects/fcopier",
      repoUrl: "https://github.com/FerzDevZ/fcopier",
      liveUrl: "https://ferzdevz.github.io/fcopier/",
      preview: {
        src: "/projects/fcopier-preview.png",
        alt: "Beranda dokumentasi FCopier, diambil dari demo langsung",
        width: 1280,
        height: 577,
      },
      caseStudy: {
        context:
          "Situs dinamis lebih sulit disimpan untuk dibaca offline atau ditinjau keamanannya dibanding situs statis. Asetnya dimuat lewat skrip, dan salinan yang tersimpan bisa membawa kredensial yang bocor di halaman.",
        approach: [
          {
            title: "Path aset yang ditulis ulang",
            detail:
              "Referensi di JavaScript, CSS, dan gambar yang diunduh ditulis ulang, sehingga salinannya bisa berjalan offline.",
          },
          {
            title: "Rekam dan putar ulang API",
            detail:
              "Permintaan jaringan direkam lalu dilayani kembali lewat server lokal.",
          },
          {
            title: "Pemindaian rahasia",
            detail:
              "Aset yang disimpan dipindai dari API key dan token sebelum salinan disimpan.",
          },
        ],
        outcome:
          "Ekspor ke PDF, PNG, atau satu berkas HTML mandiri. Dokumentasinya dipublikasikan di GitHub Pages.",
        metrics: [
          { value: "3", label: "format ekspor" },
          { value: "ETag", label: "sinkronisasi melewati berkas tak berubah" },
          { value: "Live", label: "dokumentasi di GitHub Pages" },
        ],
      },
    },
  ],

  capabilities: {
    heading: "02 — Kemampuan",
    note: "yang saya kerjakan",
    headline: "Sedikit keahlian, dikerjakan dengan serius.",
    lede: "Saya lebih memilih empat hal di level senior daripada dua puluh hal yang biasa-biasa saja. Ini daftar jujurnya.",
    items: [
      {
        id: "interface",
        index: "01",
        title: "Rekayasa antarmuka",
        description:
          "Arsitektur komponen yang tetap terbaca saat skala membesar: server component sebagai default, batas klien didorong ke daun pohon, animasi dibatasi pada transform dan opacity.",
        tools: ["React 19", "Next.js 15", "TypeScript", "CSS transitions"],
      },
      {
        id: "systems",
        index: "02",
        title: "Design system",
        description:
          "Token OKLCH yang perseptual, skala tipografi fluid, dan state yang terdokumentasi — sehingga tombol terlihat sama di tangan siapa pun, di layar apa pun.",
        tools: ["Tailwind CSS v4", "OKLCH", "CSS custom properties", "Kontras WCAG"],
      },
      {
        id: "performance",
        index: "03",
        title: "Performa",
        description:
          "Lighthouse berjalan di setiap push dan menggagalkan build di bawah ambang yang ada di lighthouserc.json. Kecepatan dicek di CI, bukan di audit berbulan-bulan kemudian.",
        tools: ["Lighthouse CI", "Core Web Vitals", "output next build"],
      },
      {
        id: "delivery",
        index: "04",
        title: "Pengiriman",
        description:
          "Tes yang menangkap regresi sebelum pengguna menemukannya, pratinjau di setiap cabang, dan rollback satu perintah.",
        tools: ["Playwright", "axe-core", "ESLint", "GitHub Actions"],
      },
    ],
  },

  experience: {
    heading: "03 — Pengalaman",
    span: "2021 — sekarang",
    items: [
      {
        period: "2024 — Sekarang",
        role: "Frontend engineer independen",
        company: "Freelance",
        description:
          "Merilis antarmuka produk untuk startup di Asia Tenggara — commerce, fintech, dan alat internal.",
      },
      {
        period: "2022 — 2024",
        role: "Frontend engineer",
        company: "Northlight Studio",
        description:
          "Memimpin guild frontend: peluncuran design system, anggaran performa, dan tinjauan kode saat perekrutan.",
      },
      {
        period: "2021 — 2022",
        role: "Web developer",
        company: "Kreasi Digital",
        description:
          "Membangun situs pemasaran dan dasbor untuk merek konsumen; memperkenalkan TypeScript di seluruh stack.",
      },
    ],
  },

  certificates: {
    heading: "04 — Sertifikat",
    publishedTemplate: "{published} dari {total} terbit",
    reservedNotice: "Slot sertifikat — foto menyusul",
    enlargeTemplate: "Perbesar sertifikat {placement} {title}",
    dialogTemplate: "Sertifikat {placement} {title}",
    imageAltTemplate: "Sertifikat {placement} {title} — {issuer}",
    closeLabel: "Tutup tampilan sertifikat",
    items: [
      {
        id: "otn-vi-desain-web",
        index: "01",
        placement: "Juara I",
        title: "Desain Web",
        issuer:
          "Olimpiade TIK-Informatika Nasional (OTN) VI · IGTIK PGRI · ICE BSD Tangerang",
        period: "November 2024",
        image: "/certificates/otn-vi-desain-web-2024.webp",
        imageWidth: 1280,
        imageHeight: 927,
      },
      {
        id: "lks-babel-itssb",
        index: "02",
        placement: "Juara II",
        title: "IT Software Solution for Business",
        issuer:
          "LKS Provinsi Kepulauan Bangka Belitung · Dinas Pendidikan · SMKN 2 Pangkalpinang",
        period: "Juni 2025",
        image: "/certificates/lks-babel-itssb-2025.webp",
        imageWidth: 738,
        imageHeight: 518,
      },
      {
        id: "mostfet-11",
        index: "03",
        placement: "Juara 2",
        title: "Web Design Online",
        issuer: "E-MOSTFET 11 · HM Elektro Universitas Bangka Belitung",
        period: "September 2026",
        image: "/certificates/emostfet-11-web-design.webp",
        imageWidth: 2000,
        imageHeight: 1414,
      },
    ],
  },

  contact: {
    heading: "05 — Kontak",
    kicker: "Mulai percakapan",
    body: "Ceritakan apa yang sedang kamu bangun dan di bagian mana terasanya sulit. Saya membalas dalam dua hari kerja, biasanya lebih cepat.",
    socialsLabel: "Tautan sosial",
  },

  socials: [
    {
      label: "GitHub",
      href: "https://github.com/FerzDevZ",
      handle: "@FerzDevZ",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/ferdinandderosaputra",
      handle: "in/ferdinandderosaputra",
    },
    { label: "X", href: "https://x.com/ferzchills20", handle: "@ferzchills20" },
    {
      label: "Instagram",
      href: "https://instagram.com/ferzchills20",
      handle: "@ferzchills20",
    },
    {
      label: "Email",
      href: "mailto:ferdinandderosaputra1@gmail.com",
      handle: "ferdinandderosaputra1@gmail.com",
    },
  ],

  footer: {
    copyrightTemplate: "© {year} {name} — dibangun dengan Next.js & Tailwind",
    backToTop: "Kembali ke atas ↑",
    motionToggleLabel: "Gerak 3D",
    motionOn: "aktif",
    motionOff: "nonaktif",
  },

  caseStudyPage: {
    eyebrowTemplate: "Studi kasus — {index}",
    documentTitleTemplate: "{title} — Studi kasus",
    allWork: "Semua karya",
    contextLabel: "01 — Konteks",
    approachLabel: "02 — Pendekatan",
    outcomeLabel: "03 — Hasil",
    roleLabel: "Peran",
    yearLabel: "Tahun",
    stackLabel: "Stack",
    repoLabel: "Kode di GitHub",
    liveLabel: "Demo langsung",
    moreLabel: "Studi kasus lain",
    previousLabel: "Sebelumnya",
    nextLabel: "Berikutnya",
    backToPortfolioLabel: "kembali ke portofolio",
  },

  meta: {
    homeTitleTemplate: "{name} — {role}",
    caseTitleSuffix: "— {name}",
  },

  ui: {
    skipToContent: "Lewati ke konten",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    primaryNavLabel: "Utama",
    mobileNavLabel: "Seluler",
    brandBackToTopTemplate: "{name} — kembali ke atas",
    themeToggleTemplate: "Tema: {state}",
    themeSystem: "sistem",
    themeLight: "terang",
    themeDark: "gelap",
    themeHint: "klik atau tekan Ctrl/Cmd+Shift+L",
    languageSwitchTemplate: "Ganti ke {language}",
    languageSwitchHint: "English",
    offlineChip: "Luring",
    offlineAnnouncement: "Luring — halaman ini disajikan dari cache offline.",
    clockLabel: "Waktu lokal Jakarta",
    ogCardLabel: "Portofolio",
    cursorViewLabel: "Lihat",
    sectionProgressTemplate: "Bagian {current} dari {total}",
  },
};
