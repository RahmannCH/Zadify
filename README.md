<p align="center">
  <img src="public/readme-banner.png" alt="Zadify Banner" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <img src="public/zadify-logo.svg" alt="Zadify Logo" width="84" height="84" />
</p>

<h1 align="center">Zadify</h1>

<p align="center">
  <strong>The Comprehensive Digital Al-Qur'an Provision for Muslims</strong><br>
  <em>Platform Super-App Islami All-in-One: Al-Qur'an Reader Pro, Murottal per Ayat, Jadwal Sholat, Kompas Kiblat 3D, Learn Academy, 6 Arcade Games, Kalkulator Syariat, dan Asisten AI.</em>
</p>

<p align="center">
  <a href="https://zadify.vercel.app/"><img src="https://img.shields.io/badge/Live_Demo-zadify.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/RahmannCH/Zadify"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
  <a href="#-lisensi"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16.3-Turbopack-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-087EA4?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand_v5-IndexedDB-orange?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA" />
</p>

<p align="center">
  <a href="https://zadify.vercel.app/"><strong>🚀 Buka Aplikasi</strong></a> •
  <a href="#-showcase-fitur--modul"><strong>✨ Showcase Modul</strong></a> •
  <a href="#-arsitektur-sistem"><strong>🏛️ Arsitektur</strong></a> •
  <a href="#-panduan-instalasi-lokal"><strong>⚙️ Instalasi</strong></a> •
  <a href="#-struktur-direktori"><strong>📁 Direktori</strong></a>
</p>

---

## 📑 Daftar Isi
1. [Tentang Zadify](#-tentang-zadify)
2. [Showcase Fitur & Modul](#-showcase-fitur--modul)
3. [Arsitektur Sistem](#-arsitektur-sistem)
4. [Tech Stack](#-tech-stack)
5. [Struktur Direktori](#-struktur-direktori)
6. [Panduan Instalasi Lokal](#-panduan-instalasi-lokal)
7. [Progressive Web App (PWA)](#-progressive-web-app-pwa)
8. [Kontribusi & Lisensi](#-lisensi)

---

## 📖 Tentang Zadify

**Zadify** (berasal dari kata *Zad* / زاد yang bermakna bekal) dirancang sebagai bekal digital komprehensif bagi setiap muslim dalam menjalani rutinitas ibadah, pembelajaran syariat, dan penguatan literasi Al-Qur'an harian.

Dibangun dengan arsitektur **Next.js 16.3 (Turbopack)** dan **React 19**, Zadify menggabungkan ketelitian pembacaan mushaf bersanad (Tajweed visual 7 warna, terjemahan Kemenag RI, dan audio per-ayat) dengan gamifikasi Islami modern, analitik tilawah ala GitHub heatmap, serta kecerdasan buatan (*Zad Mentor AI*).

---

## ✨ Showcase Fitur & Modul

### 1. 📖 Al-Qur'an Reader Pro & Audio Murottal
* **Tajweed 7 Warna Otomatis:** Deteksi hukum tajwid resmi (Qalqalah, Ghunnah, Mad Far'i, Mad Thobi'i, Ikhfa, Iqlab, Idgham) langsung pada teks Uthmani tanpa merusak layout.
* **Transliterasi Latin Mengalir:** Bantuan bacaan fonetik latin per ayat dengan saklar toggle instan.
* **Murottal Per-Ayat & Auto-Scroll:** Audio Syekh Mishari Rasyid Al-Afasy per ayat dengan animasi gulir otomatis mengikuti lantunan bacaan.
* **Dynamic Island Audio Pill:** Bar kontrol audio melayang responsif di atas layar saat bernavigasi antar halaman.
* **Ekspor Gambar Ayat (Native Canvas 2D):** Buat kartu kutipan ayat estetik resolusi tinggi format PNG tanpa watermark library pihak ketiga.

### 2. 🕌 Jadwal Sholat, Syuruq & Kompas Kiblat 3D
* **Waktu Sholat Presisi:** Subuh, Terbit (Syuruq), Dhuha, Dzuhur, Ashar, Maghrib, Isya, hingga Qiyamul Lail (Tengah Malam).
* **Kompas Kiblat Sensorik 3D:** Menggunakan Hardware Device Orientation API dengan visual Ka'bah 3D real-time.
* **Dual-Mode Lokasi:** GPS otomatis atau penentuan manual 25+ kota besar di Indonesia.
* **Pelacak Sholat Wajib & Sunnah:** Checklist sholat fardhu berjamaah dan amalan sunnah (Dhuha, Tahajjud, Rawatib) berhadiah Zad Points (ZP).

### 3. 🗓️ Kalender Hijriyah & 18 Hari Besar Islam
* **Lembar Penanggalan Realistis:** Algoritma penanggalan Hijriyah akurat (Ummul Qura) tanpa dependensi library eksternal.
* **3D Flip Card Hari Besar:** 18 momentum agung Islam (Idul Fitri, Idul Adha, Nisfu Sya'ban, Asyura, Maulid Nabi, dll.) yang dapat dibalik untuk melihat dalil, sejarah, dan amalan sunnah yang dianjurkan.

### 4. 🎓 Learn Academy (Jalur Belajar Mualaf & Pemula)
* **9 Modul Terstruktur:** Mulai dari Rukun Iman, Fiqih Wudhu, Tata Cara Sholat, hingga Adab & Muamalah.
* **Alur Belajar 3 Sesi:**
  1. *Virtual Class:* Rangkuman materi komprehensif + video YouTube terverifikasi.
  2. *Uji Pemahaman:* Kuis interaktif 4 pertanyaan dengan ambang kelulusan minimal 70%.
  3. *Kelulusan:* Layar selebrasi animasi + reward 50 ZP per modul.

### 5. ⚖️ Kalkulator Syariat Komprehensif
* **Zakat Multi-Kategori:** Kalkulator Zakat Mal, Profesi, Fitrah, dan Emas/Perak terkalibrasi nishab harga emas dunia.
* **Waris Faraid Berdasarkan Surah An-Nisa:** Perhitungan warisan otomatis mencakup furudh dzawil arham, 'ashabah, hingga kasus khusus *Gharrawain* dan pembagian anak perempuan.
* **Haji & Umroh Savings Planner:** Proyeksi inflasi masa depan, kalkulasi potongan tabungan bulanan, tracking streak, dan checklist 8 etape rukun haji.

### 6. 🕹️ 6 Arcade Games & PvP Arena
* **Trivia Islami:** Kuis adaptif 3 fase berbasis tema Sirah Nabawiyah dan Al-Qur'an.
* **PvP Arena 1v1:** Mode tanding pengetahuan Islami melawan bot cerdas dengan reward Zad Points.
* **Harf-le (Wordle Arab):** Tebak kosakata bahasa Arab 5 huruf dengan indikator warna harian.
* **Tebak Ayat & Sambung Ayat:** Uji hafalan dengan menyusun dan menyambung potongan ayat acak.
* **Tajwid Ninja:** Tantangan cepat menentukan hukum tajwid potongan kata sebelum waktu habis.
* **Leaderboard & Liga:** Sistem pemeringkatan liga Bronze, Silver, Gold, Diamond, hingga Master.

### 7. 🔍 Smart Search Engine Berbasis Frasa
* **Pencarian Luas 30 Juz:** Mesin pencari internal yang membedah arti, tafsir, maupun kata Arab secara instan.
* **Stopword Bypass:** Tetap menemukan kata penghubung umum ("jika", "maka", "apabila") tanpa terhalang filter stopword API.
* **Highlighter Emas Sinkron:** Penyorotan kata kunci tepat sasaran pada terjemahan bahasa Indonesia dan teks Arab.

### 8. 📊 Tilawah Heatmap Analytics
* **GitHub-Style Contribution Grid:** Matriks visual 70 hari pencatatan tilawah dan progres membaca per surah.
* **Khatam Tracker:** Estimasi waktu penyelesaian khatam 30 juz berdasarkan rata-rata bacaan harian.

### 9. 🤖 Zad Mentor AI Companion
* **Asisten Chatbot Cerdas:** Terintegrasi langsung dengan model Google Gemini AI (`gemini-1.5-flash`).
* **Persona Rujukan Shahih:** Menjawab pertanyaan fiqih, tafsir ayat, dan adab harian dengan referensi dalil Al-Qur'an dan Sunnah shahih.
* **Floating Bubble Interface:** Desain melayang interaktif yang dapat diakses dari seluruh modul tanpa refresh halaman.

---

## 🏛️ Arsitektur Sistem

```text
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                    |
|  [Next.js 16 App Router] <---> [React 19 Server/Client Components]                |
|  [Framer Motion 12]      <---> [Tailwind CSS v4 & Base UI Design Tokens]         |
+-----------------------------------------------------------------------------------+
                                         |
             +---------------------------+---------------------------+
             |                                                       |
             v                                                       v
+--------------------------+                               +------------------------+
|    SERVICE WORKER        |                               |   STATE MANAGEMENT     |
|   (public/sw.js)         |                               |   (Zustand v5)         |
|  * Cache-First (Assets)  |                               |  * Quran / Audio Store |
|  * SWR (Next Chunks)     |                               |  * Prayer / Sunnah     |
|  * Network-First (Pages) |                               |  * Gamification (ZP)   |
|  * Fallback Offline AI   |                               |  * IndexedDB / Persist |
+--------------------------+                               +------------------------+
             |                                                       |
             +---------------------------+---------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                NEXT.JS BACKEND (API)                              |
|  * /api/chat     --> Google Gemini 1.5 Flash (Rate Limited: 15 req/min/IP)        |
|  * /api/search   --> Quran.com Proxy API (Stopword bypass + Arabic Matcher)      |
+-----------------------------------------------------------------------------------+
                                         |
             +---------------------------+---------------------------+
             |                                                       |
             v                                                       v
+--------------------------+                               +------------------------+
|    QURAN.COM CDN & API   |                               |   GOOGLE GEMINI API    |
|  * Uthmani Tajweed Text  |                               |  * Zad Mentor AI Core  |
|  * Alafasy MP3 Audio     |                               |  * Fiqh & Adab Answers |
+--------------------------+                               +------------------------+
```

---

## 🛠️ Tech Stack

| Kategori | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3 (Turbopack) | App Router, Server Components, Route Handlers |
| **UI Library** | React 19 | State, Actions, Transition, Dynamic Imports |
| **Language** | TypeScript 5 | Type Safety ketat di seluruh 57 rute |
| **Styling** | Tailwind CSS v4 | CSS Variables, Performance Engine, Zero-Runtime |
| **Components** | shadcn/ui (Base UI) | Dialog, Drawer, Tooltip, Sheet, Progress Bar |
| **Animations** | Framer Motion v12 | Transisi halaman, 3D Flip Card, Tab slide |
| **State** | Zustand v5 + IndexedDB | Manajemen state global offline-first |
| **Audio Engine** | Singleton Web Audio | Pemutaran murottal ayat, SFX game arcade |
| **AI Integration**| Google Gemini API | Model `gemini-1.5-flash` dengan rate limiter internal |
| **Deployment** | Vercel | CI/CD otomatis dari branch `master` |

---

## 📁 Struktur Direktori

```text
Zadify/
├── public/                     # Aset statis, ikon PWA, logo, audio sfx
│   ├── zadify-logo.svg         # Logo resmi Zadify
│   ├── readme-banner.png       # Banner showcase GitHub
│   └── sw.js                   # Service Worker cache offline
├── src/
│   ├── app/                    # Next.js App Router (57+ rute)
│   │   ├── api/                # API route handlers (chat, search)
│   │   ├── calculator/         # Faraid waris, zakat, haji-umroh
│   │   ├── games/              # Trivia, harf-le, pvp, sambung-ayat
│   │   ├── kids/               # Kisah 15 nabi, edukasi gender/fitrah
│   │   ├── learn/              # Learn academy 9 modul & quiz
│   │   ├── prayer-times/       # Jadwal sholat & kompas kiblat
│   │   ├── quran/              # Mushaf Al-Qur'an 30 juz
│   │   ├── surah/[id]/         # Detail pembacaan per surah
│   │   ├── analytics/          # Heatmap tilawah 70 hari
│   │   └── page.tsx            # Beranda hub bento-grid
│   ├── components/             # Reusable UI components
│   │   ├── quran/              # AyahCard, TajweedText, MurottalPlayer
│   │   ├── prayer/             # PrayerClock, QiblaCompass3D
│   │   ├── layout/             # Header, BottomNav, DynamicIsland
│   │   └── ui/                 # shadcn base primitives
│   ├── data/                   # Data lokal statis (doa, asmaul husna, surah)
│   ├── hooks/                  # Custom hooks (audio, geolocation, store)
│   ├── lib/                    # Engine tajweed, arabic matcher, sfx singleton
│   └── store/                  # Zustand stores (bookmark, audio, gamification)
├── package.json
└── tailwind.config.ts
```

---

## ⚙️ Panduan Instalasi Lokal

Ikuti langkah-langkah berikut untuk menjalankan Zadify di lingkungan pengembangan lokal:

### 1. Clone Repositori
```bash
git clone https://github.com/RahmannCH/Zadify.git
cd Zadify
```

### 2. Pasang Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Buat file `.env.local` pada direktori root projek dan masukkan kunci API Google Gemini Anda:
```env
GEMINI_API_KEY=kunci_api_gemini_anda_disini
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```

Buka browser dan akses `http://localhost:3000`. Aplikasi siap digunakan.

---

## 📱 Progressive Web App (PWA)

Zadify dapat diinstal langsung ke perangkat Android, iOS, Windows, maupun macOS layaknya aplikasi native:
1. Akses [zadify.vercel.app](https://zadify.vercel.app/) melalui Chrome atau Safari.
2. Klik tombol **"Install"** atau **"Add to Home Screen"**.
3. Aplikasi siap diakses secara offline dengan caching Service Worker cerdas.

---

## 📄 Lisensi

Projek ini didistribusikan di bawah lisensi **MIT License**. Lihat file [LICENSE](LICENSE) untuk informasi selengkapnya.

---

<p align="center">
  Dibuat dengan kesungguhan oleh <a href="https://github.com/RahmannCH"><strong>Rahman CH</strong></a><br>
  <em>Semoga menjadi amal jariyah dan bekal kebaikan bagi umat Islam di seluruh dunia.</em>
</p>
