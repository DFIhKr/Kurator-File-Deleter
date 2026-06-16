# Kurator — Batch File Deleter

Aplikasi pendamping Kurator untuk menghapus file secara batch dengan aman. 100% berjalan di browser (client-side), tanpa backend.

## Fitur

- ✅ Input daftar file via paste, import TXT, import CSV, atau drag & drop
- ✅ Pemilihan folder target menggunakan File System Access API
- ✅ Pencocokan nama file **exact match** (100% presisi)
- ✅ Preview hasil pencocokan sebelum penghapusan
- ✅ Konfirmasi modal sebelum eksekusi
- ✅ Progress bar real-time
- ✅ Log aktivitas lengkap
- ✅ Export log (TXT/CSV)
- ✅ Dark mode & Light mode
- ✅ Pencarian file dalam daftar
- ✅ Scan subfolder (opsional)

## Keamanan

- Hanya **exact string match** (`===`) yang digunakan
- Tidak ada fuzzy matching, wildcard, regex, atau partial matching
- Double-check guard sebelum setiap penghapusan
- Preview wajib sebelum eksekusi
- Konfirmasi dialog wajib sebelum penghapusan
- Folder tidak pernah dihapus
- Semua aktivitas di-log

## Persyaratan

- **Browser:** Google Chrome 86+ atau Microsoft Edge 86+ (desktop)
- **Node.js:** 18+ (untuk development)

## Instalasi & Development

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Jalankan unit tests
npm run test

# Build untuk produksi
npm run build

# Preview build produksi
npm run preview
```

## Struktur Project

```
src/
├── main.js              # Bootstrap
├── styles/              # CSS design system
├── components/          # Reusable UI components
├── views/               # Application views (5 steps)
├── services/            # Business logic
├── core/                # File System Access API wrapper
├── state/               # Reactive state store
├── utils/               # Constants & helpers
└── icons/               # Lucide SVG icons
tests/                   # Unit tests (Vitest)
```

## Teknologi

- Vite 6 (build tool)
- Vanilla JavaScript (ES2022+)
- Vanilla CSS (Custom Properties)
- File System Access API
- Vitest (testing)

## Limitasi

- File yang dihapus via `removeEntry()` **tidak masuk Recycle Bin** — penghapusan bersifat permanen
- Hanya berfungsi di browser berbasis Chromium (Chrome, Edge)
- Tidak mendukung Firefox, Safari, atau browser mobile
