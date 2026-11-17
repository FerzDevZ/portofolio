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
      "Portofolio Ferdinand Dero Saputra, frontend engineer yang fokus pada design system, performa, dan antarmuka dengan pengekangan editorial.",
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

  pageLinks: [
    { label: "Blog", href: "/blog" },
    { label: "Kontak", href: "/contact" },
    { label: "Resume", href: "/resume" },
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
    role: "Bangun full-stack · proyek pribadi",
    description:
      "Marketplace jasa lokal untuk Indonesia: katalog dengan filter, checkout multi-item, papan pesanan penyedia, dan konsol admin, dengan uang QRIS ditahan dalam escrow sampai pekerjaan selesai.",
    year: "2026",
    stack: ["Next.js 15", "Prisma", "MongoDB", "NextAuth v5"],
    proof: "Live · rilis app-v1.0.1",
    href: "/projects/jasakite",
    repoUrl: "https://github.com/FerzDevZ/jasakite",
    liveUrl: "https://jasakite.vercel.app",
    preview: null,
    caseStudy: {
      context:
        "Pembeli dan penyedia jasa lokal butuh satu tempat untuk mencari, memesan, dan membayar pekerjaan. Uang melewati beberapa pihak sebelum pekerjaan selesai, jadi setiap peran harus melihat pesanan yang sama pada langkah yang sama.",
      approach: [
        {
          title: "Empat peran, satu model pesanan",
          detail:
            "Customer, provider, admin, dan super admin memakai satu siklus: diterima, dikerjakan, selesai, dibatalkan, masing-masing dengan linimasa berstempel waktu.",
        },
        {
          title: "Escrow sebelum penyerahan",
          detail:
            "Pembayaran QRIS ditahan terhadap pesanan dan dilepas saat selesai, masuk ke dompet yang bisa ditarik penyedia. Langganan yang menjaga penyedia tetap terdaftar dipotong dari saldo itu.",
        },
        {
          title: "Diuji di dua lapisan",
          detail:
            "Vitest menguji aturan harga dan pesanan; Playwright menjalankan alurnya di Chromium dan pada profil mobile 320px.",
        },
      ],
      outcome:
        "Alur dari katalog sampai ulasan berjalan utuh di repositori, dengan akun demo untuk keempat peran dan panduan operator. Pembayaran QRIS masih simulasi, dan README menyatakannya.",
      metrics: [
        { value: "4", label: "peran dalam satu aplikasi" },
        { value: "Escrow", label: "dana QRIS ditahan sampai selesai" },
        { value: "Rp10.000", label: "langganan penyedia per bulan" },
      ],
    },
  },

  projects: [
    {
      id: "webpos-apotek",
      index: "02",
      title: "WebPOS Apotek",
      role: "Bangun full-stack · proyek pribadi",
      description:
        "Sistem kasir dan stok apotek untuk toko Indonesia: penjualan per batch dengan FEFO, resep dengan signa, satuan jual ganda, dan laba dihitung dari batch yang benar-benar keluar.",
      year: "2026",
      stack: ["Next.js 16", "Prisma", "SQLite", "Tailwind CSS v4"],
      proof: "Pratinjau awal",
      href: "/projects/webpos-apotek",
      repoUrl: "https://github.com/FerzDevZ/webpos-apotek",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "Apotek Indonesia menjual dari batch yang masing-masing punya tanggal kadaluarsa, dan item yang sama dijual sebagai box, strip, atau tablet. Kasir generik mencatat penjualan tapi bukan batch-nya, jadi stok dan laba melenceng.",
        approach: [
          {
            title: "FEFO diputuskan di server",
            detail:
              "Kasir tidak pernah memilih batch. Alokasi berjalan first-expiry-first-out di dalam server action, dan setiap pergerakan ditulis ke ledger stok, sehingga HPP berasal dari batch yang benar-benar keluar.",
          },
          {
            title: "Sesi tanpa vendor auth",
            detail:
              "Sesi cookie ditandatangani HMAC, password di-hash scrypt, dan pemeriksaan peran ada di proxy maupun server action. Pengguna yang dinonaktifkan terkunci walau cookie-nya masih hidup.",
          },
          {
            title: "Offline sejak desain",
            detail:
              "Prisma di atas SQLite menaruh seluruh sistem di laptop toko. Berjalan tanpa internet, karena itulah kondisi yang jadi sasarannya.",
          },
        ],
        outcome:
          "Repositori memuat kasir, master item, penerimaan faktur, stok dan kadaluarsa, resep, laporan, pelanggan, struk, dan akses berbasis peran. Struk ditata untuk kertas termal 58mm dan dicetak dari browser.",
        metrics: [
          { value: "FEFO", label: "alokasi batch di server" },
          { value: "58mm", label: "tata letak struk termal" },
          { value: "0", label: "dependensi auth eksternal" },
        ],
      },
    },
    {
      id: "9router-aegisx",
      index: "03",
      title: "9Router AegisX",
      role: "Platform · fork yang dirawat",
      description:
        "Gateway AI self-hosted antara alat coding dan 40+ penyedia: satu endpoint kompatibel OpenAI, rantai fallback lintas akun dan tier, serta token saver yang melaporkan apa yang dihapus.",
      year: "2026",
      stack: ["TypeScript", "SolidJS", "SQLite", "Node.js"],
      proof: "Rilis v0.5.110-aegisx.1 · CI",
      href: "/projects/9router-aegisx",
      repoUrl: "https://github.com/FerzDevZ/9router-aegisx",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "Asisten coding yang terikat satu penyedia berhenti begitu penyedia itu membatasi laju atau mereset kuota. Merutekan lintas akun dan tier secara manual berarti mengonfigurasi setiap klien satu per satu.",
        approach: [
          {
            title: "Satu endpoint, empat format",
            detail:
              "Gateway menerima bentuk OpenAI, Responses, Anthropic, dan Gemini lalu menerjemahkannya, sehingga belasan klien menunjuk URL lokal yang sama dan memilih lewat id provider serta model.",
          },
          {
            title: "Fallback sebagai kebijakan",
            detail:
              "Combo merangkai tier langganan, murah, dan gratis dengan perutean berurutan, round-robin, sadar cache, atau fusi paralel, dipilih per model, bukan per klien.",
          },
          {
            title: "Pengeluaran yang bisa diaudit",
            detail:
              "Akuntansi token dan biaya per penyedia, model, dan kunci, dengan cache-hit rate, pelacakan kuota, dan papan skor penghematan tiap token saver.",
          },
        ],
        outcome:
          "Kredensial tersimpan di database SQLite lokal. Fork ini menjaga suite unit upstream tetap hijau (4.100+ tes), menambah hardening keamanan dan akuntansi token yang jujur, serta mencatat selisihnya di changelog.",
        metrics: [
          { value: "40+", label: "eksekutor penyedia" },
          { value: "4.100+", label: "tes unit di CI" },
          { value: "1", label: "endpoint untuk semua klien" },
        ],
      },
    },
    {
      id: "ferzdb",
      index: "04",
      title: "FerzDB",
      role: "Bangun sistem · proyek pribadi",
      description:
        "Mesin database SQL dalam Rust untuk pemakaian embedded dan offline-first: indeks B-tree, write-ahead log, dan format penyimpanan yang cukup kecil untuk diperiksa manual.",
      year: "2026",
      stack: ["Rust", "B-Tree", "WAL"],
      proof: "Sedang dikembangkan",
      href: "/projects/ferzdb",
      repoUrl: "https://github.com/FerzDevZ/ferzdb",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "SQLite adalah jawaban default untuk database embedded, tapi format halamannya praktis buram. Menulis mesinnya sendiri adalah satu-satunya cara memiliki format penyimpanan, batas transaksi, dan perilaku saat gagal.",
        approach: [
          {
            title: "B-tree sungguhan",
            detail:
              "Halaman indeks membentuk B-tree, jadi point lookup dan range scan menelusuri struktur, bukan memfilter berkas.",
          },
          {
            title: "Write-ahead log",
            detail:
              "Perubahan ditambahkan ke WAL dan diputar ulang saat dibuka. Itu yang mengubah halaman setengah tertulis menjadi keadaan yang bisa dipulihkan, bukan berkas rusak.",
          },
          {
            title: "Dua bentuk deployment",
            detail:
              "Mesin yang sama berjalan embedded sebagai library atau di belakang mode client-server, tanpa mengubah lapisan query.",
          },
        ],
        outcome:
          "Transaksi ACID, berkas penyimpanan transparan, dan pesan galat yang menyebut apa yang gagal. Konsol web di repositori memeriksa tabel tanpa klien terpisah. Ini inti yang sudah bekerja, belum pengganti SQLite.",
        metrics: [
          { value: "B-Tree", label: "struktur indeks" },
          { value: "WAL", label: "pemulihan setelah crash" },
          { value: "2", label: "mode embedded dan server" },
        ],
      },
    },
    {
      id: "ftrack",
      index: "05",
      title: "ftrack",
      role: "Tool sistem · proyek pribadi",
      description:
        "Pengarsip web berbasis Rust yang merayapi URL secara paralel, menulis arsip WARC, dan menandai rahasia serta endpoint API yang bocor.",
      year: "2026",
      stack: ["Rust", "Tokio", "SQLite", "Chromium"],
      proof: "Sedang dikembangkan",
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
      id: "oauth",
      index: "06",
      title: "Sistem OAuth",
      role: "Autentikasi · proyek pribadi",
      description:
        "Login Google dan GitHub yang ditulis tangan di Next.js: PKCE, sesi yang bisa dicabut, rate limit, dan log audit, tanpa library auth.",
      year: "2026",
      stack: ["Next.js", "SQLite", "PKCE"],
      proof: "Suite tes tersedia",
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
      id: "nanotok",
      index: "07",
      title: "nanotok",
      role: "Tooling · proyek pribadi",
      description:
        "Kompresor token deterministik dan offline untuk prompt serta log agen: pipeline enam tahap yang menjaga identifier, path, dan literal galat tetap utuh.",
      year: "2026",
      stack: ["Python", "CLI", "Standard library saja"],
      proof: "v3.0.0 · CI",
      href: "/projects/nanotok",
      repoUrl: "https://github.com/FerzDevZ/nanotok",
      liveUrl: null,
      preview: null,
      caseStudy: {
        context:
          "Sesi agen menghabiskan sebagian besar konteksnya pada log berulang, dump berkas, dan boilerplate. Memangkasnya manual menghilangkan literal persis yang dibutuhkan model untuk bertindak benar.",
        approach: [
          {
            title: "Span yang dilindungi",
            detail:
              "Path, flag, identifier, angka, dan literal galat ditandai sebelum kompresi dan dipulihkan sesudahnya, sehingga token yang mengubah makna tidak pernah ditulis ulang.",
          },
          {
            title: "Enam tahap, urutan tetap",
            detail:
              "Setiap tahap punya kontrak sendiri dan melaporkan penghematannya sendiri, sehingga keputusan kompresi bisa ditelusuri, bukan dipercaya.",
          },
          {
            title: "Tanpa dependensi, tanpa jaringan",
            detail:
              "Hanya standard library Python. Masukan yang sama menghasilkan keluaran yang sama, itulah yang membuatnya aman dipakai di hook CI.",
          },
        ],
        outcome:
          "Dirilis sebagai CLI dengan integrasi AgentSkills untuk agen coding, bagian benchmark terukur, dan target desain yang dipisahkan dari penghematan nyata.",
        metrics: [
          { value: "6", label: "lapisan pipeline" },
          { value: "0", label: "dependensi runtime" },
          { value: "Lokal", label: "deterministik dan offline" },
        ],
      },
    },
    {
      id: "fcopier",
      index: "08",
      title: "FCopier",
      role: "Tooling · proyek pribadi",
      description:
        "Penyalin situs berbasis Playwright dengan ekspor offline, rekaman API, dan pemindai rahasia pada aset yang disimpan.",
      year: "2026",
      stack: ["JavaScript", "Playwright"],
      proof: "Dokumentasi live",
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

  blog: {
    heading: "Blog",
    kicker: "Tulisan",
    description:
      "Catatan tentang craft frontend: design system, anggaran performa, dan detail yang menentukan apakah sebuah antarmuka terasa tenang.",
    emptyState: "Belum ada tulisan. Yang pertama sedang ditulis.",
    countTemplate: "{count} tulisan",
    allPosts: "Semua tulisan",
    backToHome: "Kembali ke beranda",
  },

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
    span: "2024 — sekarang",
    /* Hanya tonggak yang bisa dibuktikan repositori ini: delapan studi kasus
       dan tiga sertifikat. Riwayat kerja sengaja tidak dicantumkan — tidak ada
       sumber yang bisa diverifikasi, dan nama perusahaan yang tidak terbukti
       lebih buruk daripada tidak ada baris pengalaman sama sekali. */
    items: [
      {
        period: "2026 — Sekarang",
        role: "Pembangun independen",
        company: "Proyek pribadi",
        description:
          "Delapan proyek terbuka: marketplace jasa dan penyalin situs sudah live, marketplace dan gateway AI punya rilis bertag, dan semuanya tertaut ke repositori sumbernya sehingga klaimnya bisa diperiksa.",
      },
      {
        period: "2024 — 2026",
        role: "Jalur kompetisi",
        company: "OTN VI · LKS Babel · E-MOSTFET 11",
        description:
          "Juara I Desain Web di OTN VI (2024), Juara II IT Software Solution for Business di LKS Babel (2025), dan Juara 2 Web Design Online di E-MOSTFET 11 (2026).",
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

  contactPage: {
    kicker: "Kontak",
    heading: "Hubungi saya",
    lede: "Terbuka untuk proyek pilihan — design system, pekerjaan performa, atau antarmuka yang menuntut presisi. Ceritakan apa yang sedang kamu bangun dan di bagian mana terasanya sulit.",
    formLabel: "Kirim pesan",
    nameLabel: "Nama",
    namePlaceholder: "Nama kamu",
    emailLabel: "Email",
    emailPlaceholder: "email@kamu.com",
    messageLabel: "Pesan",
    messagePlaceholder: "Ceritakan proyekmu…",
    submitLabel: "Kirim pesan",
    submittingLabel: "Mengirim…",
    successTitle: "Pesan terkirim.",
    successBody: "Balasan datang dalam dua hari kerja, biasanya lebih cepat.",
    errorLabel: "Galat:",
    rateLimitNote: "Dibatasi 1 pesan per menit. Pesanmu tidak dibagikan ke siapa pun.",
    preferEmail: "Lebih suka email? Hubungi langsung:",
  },

  resumePage: {
    documentTitleTemplate: "{name} — Resume",
    summaryHeading: "Ringkasan Profesional",
    downloadLabel: "Unduh PDF",
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
    pagesLabel: "Halaman",
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
    notFound: {
      figure: "404",
      title: "Halaman tidak ditemukan",
      subtitle: "Halaman yang Anda cari tidak ada atau telah dipindahkan.",
      back: "Kembali ke beranda",
    },
  },
};
