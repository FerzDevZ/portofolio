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
    url: "https://ferzdevz.vercel.app",
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
    { label: "Pengalaman", value: "5 tahun merilis" },
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
    id: "northwind",
    index: "01",
    title: "Northwind Commerce",
    role: "Lead frontend · 2026",
    description:
      "Storefront headless untuk katalog 40 ribu SKU. Server component memangkas bundel klien 61%, dan alur checkout yang dibangun ulang menaikkan konversi 18% pada kuartal pertama.",
    year: "2026",
    stack: ["Next.js 15", "Stripe", "Sanity", "Turbo"],
    href: "/projects/northwind",
    caseStudy: {
      context:
        "Katalog 40 ribu SKU di storefront yang dirender di klien mengirim seluruh payload hidrasi di setiap halaman produk. Di ponsel Android kelas menengah halaman butuh lebih dari empat detik untuk bisa diinteraksi, dan pengguna pergi tepat di tempat yang paling bernilai — halaman produk dan checkout.",
      approach: [
        {
          title: "Server component sebagai default",
          detail:
            "Rute katalog, produk, dan pencarian dipindahkan ke server; hanya keranjang, pemilih varian, dan langkah pembayaran yang tetap menjadi pulau klien.",
        },
        {
          title: "Halaman katalog yang di-stream",
          detail:
            "Deretan kategori dirender di balik Suspense, sehingga kerangka halaman tampil sebelum data produk tiba dan cat terbesar tidak pernah menunggu kueri paling lambat.",
        },
        {
          title: "Checkout dibangun ulang",
          detail:
            "Alur satu halaman dengan validasi inline dan Stripe Elements yang dipasang saat interaksi pertama, bukan saat halaman dimuat.",
        },
      ],
      outcome:
        "Bundel klien turun 61% dan checkout baru menaikkan konversi 18% pada kuartal pertamanya. Largest contentful paint di ponsel kelas menengah berthrottle berhenti di 1,1 detik.",
      metrics: [
        { value: "61%", label: "bundel klien dipangkas" },
        { value: "+18%", label: "konversi checkout" },
        { value: "1,1s", label: "LCP di 4G berthrottle" },
      ],
    },
  },

  projects: [
    {
      id: "atlas",
      index: "02",
      title: "Atlas Design System",
      role: "Design engineer",
      description:
        "Pustaka 120 komponen dengan token OKLCH, mode gelap, dan audit WCAG 2.2 AA — dipakai enam tim produk.",
      year: "2025",
      stack: ["React", "TypeScript", "Storybook"],
      href: "/projects/atlas",
      caseStudy: {
        context:
          "Enam tim produk mengirim enam tombol yang sedikit berbeda. Setiap karyawan baru menghabiskan sepekan membaca tangkapan layar untuk menebak aturannya, dan mode gelap bergantung pada ingatan masing-masing tim.",
        approach: [
          {
            title: "Satu palet perseptual",
            detail:
              "Token OKLCH yang disusun bertingkat berdasarkan lightness, sehingga kontras bertahan di kedua skema tanpa memilih nilai hex satu per satu.",
          },
          {
            title: "State terdokumentasi, bukan diasumsikan",
            detail:
              "Setiap komponen membawa seluruh state-nya — rest, hover, focus, active, disabled, loading, error, empty — sehingga tidak ada halaman yang mengarang sendiri.",
          },
          {
            title: "Kontras diaudit di CI",
            detail:
              "Rasio WCAG 2.2 AA yang gagal memblokir merge, dan itu satu-satunya cara sebuah aturan bertahan melewati tenggat.",
          },
        ],
        outcome:
          "Enam tim mengadopsi pustaka ini. Halaman baru dimulai dari token, bukan tangkapan layar, dan tinjauan aksesibilitas berpindah dari proyek triwulanan menjadi langkah build.",
        metrics: [
          { value: "120", label: "komponen dirilis" },
          { value: "6", label: "tim mengadopsi" },
          { value: "AA", label: "diaudit di setiap pull request" },
        ],
      },
    },
    {
      id: "pulse",
      index: "03",
      title: "Pulse Analytics",
      role: "Frontend lead",
      description:
        "Dasbor realtime yang mengalirkan 12 ribu peristiwa per detik ke dalam grafik interaktif tanpa kehilangan satu frame pun.",
      year: "2025",
      stack: ["Next.js", "WebSockets", "ClickHouse"],
      href: "/projects/pulse",
      caseStudy: {
        context:
          "Tim operasi butuh pandangan langsung atas 12.000 peristiwa per detik di halaman yang sama yang merender grafik, tabel, dan peringatan. Prototipe pertama mendorong setiap peristiwa lewat state React dan mulai kehilangan frame begitu trafik memuncak.",
        approach: [
          {
            title: "Dibatch di edge",
            detail:
              "Peristiwa digabung menjadi frame 100ms sebelum sampai ke browser, jadi klien hanya merender sepuluh pembaruan per detik, bukan dua belas ribu.",
          },
          {
            title: "Canvas untuk timeseries",
            detail:
              "Grafik digambar ke canvas dengan loop rAF; hanya label sumbu dan tooltip yang hidup di DOM.",
          },
          {
            title: "Backpressure sejak desain",
            detail:
              "Tab yang tidak aktif hanya menerima frame tersampel dan memutar ringkasan saat kembali, bukan membanjiri antrean.",
          },
        ],
        outcome:
          "Dasbor bertahan di 60fps dengan seluruh aliran berjalan, dan memori tetap datar sepanjang shift delapan jam — mode kegagalan yang mematikan prototipe sebelumnya.",
        metrics: [
          { value: "12rb", label: "peristiwa per detik" },
          { value: "60fps", label: "bertahan di beban puncak" },
          { value: "8 jam", label: "memori datar satu shift" },
        ],
      },
    },
    {
      id: "kopinusa",
      index: "04",
      title: "Kopi Nusantara",
      role: "Dibangun sendiri",
      description:
        "E-commerce roastery dengan langganan, pembayaran lokal, dan skor Lighthouse 98 di jaringan 3G.",
      year: "2024",
      stack: ["Next.js", "Tailwind", "Midtrans"],
      href: "/projects/kopinusa",
      caseStudy: {
        context:
          "Roastery yang menjual ke seluruh Indonesia butuh langganan dan jalur pembayaran lokal tanpa biaya platform yang memakan margin — dan sebagian besar pelanggannya memakai ponsel di wilayah yang membuat 3G terasa cepat.",
        approach: [
          {
            title: "Langganan sebagai state machine",
            detail:
              "Setiap paket melewati state yang eksplisit — aktif, dijeda, menunggak, dibatalkan — sehingga kasus tepi perpanjangan dirancang sekali, bukan ditemukan di produksi.",
          },
          {
            title: "Satu pipeline, tiga jalur bayar",
            detail:
              "Kartu, dompet digital, dan transfer bank semuanya masuk ke satu model pesanan dengan penanganan webhook yang idempoten.",
          },
          {
            title: "Dianggarkan untuk 3G",
            detail:
              "Pemecahan kode per rute dan disiplin gambar menjaga muatan pertama di bawah 180KB.",
          },
        ],
        outcome:
          "Toko ini mencetak 98 di Lighthouse pada 3G berthrottle dan menjalankan 400+ langganan berulang tanpa staf operasional di belakangnya.",
        metrics: [
          { value: "98", label: "Lighthouse di 3G" },
          { value: "180KB", label: "muatan pertama" },
          { value: "400+", label: "pelanggan berlangganan" },
        ],
      },
    },
    {
      id: "ledgerly",
      index: "05",
      title: "Ledgerly",
      role: "Dibangun sendiri",
      description:
        "PWA keuangan pribadi yang mengutamakan offline — setiap ketukan tersimpan ke IndexedDB, tetap jalan tanpa koneksi.",
      year: "2024",
      stack: ["React", "IndexedDB", "Workbox"],
      href: "/projects/ledgerly",
      caseStudy: {
        context:
          "Aplikasi pencatat keuangan kehilangan kepercayaan saat pertama kali satu ketukan tidak tersimpan. Brambangnya adalah aplikasi yang tetap bekerja di zona mati sinyal dan tidak pernah menyuruh pengguna menunggu jaringan.",
        approach: [
          {
            title: "IndexedDB sebagai sumber kebenaran",
            detail:
              "Setiap penulisan mendarat secara lokal lebih dulu; antarmuka tidak pernah menunggu jaringan.",
          },
          {
            title: "Penggabungan per field",
            detail:
              "Catatan membawa stempel waktu monotonik dan digabung per field, sehingga dua penyuntingan pada satu baris tidak saling menghapus.",
          },
          {
            title: "Offline sebagai default",
            detail:
              "Service worker mem-precache kerangka aplikasi; aplikasi terbuka dan mencatat dengan radio dimatikan.",
          },
        ],
        outcome:
          "Setiap ketukan bertahan melewati muat ulang dalam mode pesawat, dan sepertiga pengunjung yang kembali memasang aplikasi ini di layar utama.",
        metrics: [
          { value: "0ms", label: "latensi penulisan" },
          { value: "100%", label: "alur bekerja offline" },
          { value: "33%", label: "pengunjung kembali memasang" },
        ],
      },
    },
    {
      id: "meridian",
      index: "06",
      title: "Meridian Docs",
      role: "Frontend engineer",
      description:
        "Platform dokumentasi dengan penulisan MDX dan pencarian instan di 2.300 halaman.",
      year: "2023",
      stack: ["Next.js", "MDX", "Algolia"],
      href: "/projects/meridian",
      caseStudy: {
        context:
          "2.300 halaman dokumentasi, kotak pencarian yang butuh 900ms per kueri, dan alur penerbitan yang memerlukan engineer hanya untuk memperbaiki satu salah ketik.",
        approach: [
          {
            title: "MDX dengan build yang memvalidasi",
            detail:
              "Penulis menyusun Markdown dengan komponen; build gagal saat menemukan tautan rusak dan frontmatter cacat sebelum apa pun terbit.",
          },
          {
            title: "Indeks dibangun saat deploy",
            detail:
              "Pencarian berjalan di atas indeks statis yang ikut terkirim bersama situs, jadi kueri dijawab lokal tanpa menyeberangi API.",
          },
          {
            title: "URL ber-versi",
            detail:
              "Setiap versi dokumentasi punya jalurnya sendiri, sehingga tautan lama tetap hidup setelah rilis.",
          },
        ],
        outcome:
          "Pencarian dijawab dalam 28ms tanpa perjalanan ke API, dan tim dokumentasi bisa menerbitkan tanpa membuka tiket.",
        metrics: [
          { value: "28ms", label: "respons pencarian" },
          { value: "2.300", label: "halaman terindeks" },
          { value: "0", label: "serah terima ke engineer" },
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
        tools: ["React 19", "Next.js 15", "TypeScript", "Framer Motion"],
      },
      {
        id: "systems",
        index: "02",
        title: "Design system",
        description:
          "Token OKLCH yang perseptual, skala tipografi fluid, dan state yang terdokumentasi — sehingga tombol terlihat sama di tangan siapa pun, di layar apa pun.",
        tools: ["Tailwind CSS", "Storybook", "Radix UI", "Figma"],
      },
      {
        id: "performance",
        index: "03",
        title: "Performa",
        description:
          "Anggaran yang ditegakkan di CI: LCP di bawah 1,2 detik, nol pergeseran tata letak, diff bundel di setiap pull request. Kecepatan itu fitur, bukan audit yang dijalankan belakangan.",
        tools: ["Core Web Vitals", "Lighthouse CI", "Analisis bundel"],
      },
      {
        id: "delivery",
        index: "04",
        title: "Pengiriman",
        description:
          "Tes yang menangkap regresi sebelum pengguna menemukannya, pratinjau di setiap cabang, dan rollback satu perintah.",
        tools: ["Playwright", "Vitest", "GitHub Actions", "Vercel"],
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
  },
};
