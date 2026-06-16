# Panduan Desain (Kurator Branding)

Dokumen ini berisi panduan gaya visual (branding) dari aplikasi **Kurator**, yang dapat digunakan sebagai referensi untuk membangun aplikasi alat bantu lain (seperti Batch File Deleter) agar memiliki konsistensi visual dan pengalaman pengguna (UI/UX) yang sama.

## 1. Tipografi (Typography)
- **Font Utama (Body/UI):** `Inter` (sans-serif)
  - Penggunaan: Teks paragraf, label formulir, deskripsi metrik, input area, dan tombol kecil.
  - Karakter: Bersih, profesional, teknikal, dan sangat mudah dibaca.
- **Font Display (Headings):** `Space Grotesk`
  - Penggunaan: Judul utama aplikasi (H1, H2), nilai angka yang besar, logo teks.
  - Karakter: Modern, sedikit geometris, memberikan identitas yang unik dan "tech-forward".

## 2. Palet Warna (Color Palette)
Aplikasi difokuskan menggunakan antarmuka **Dark Mode** secara default dengan prinsip kontras tinggi.

- **Background (Latar Belakang):**
  - Global Background: Deep Charcoal / Zinc-950 (`#09090b`)
  - Permukaan Kartu (Cards): Zinc-900 (`#18181b`)
  - Elemen Sekunder/Hover: Zinc-800 (`#27272a`)
- **Teks (Text):**
  - Utama: White (`#ffffff`) atau White/90 untuk judul dan data penting.
  - Sekunder/Redup: Zinc-400 (`#a1a1aa`) atau Zinc-500 (`#71717a`) untuk deskripsi bantuan.
- **Warna Aksen (Brand Color - Kurator):**
  - Utama: **Lime Green** / Brand-500 (`#84cc16`)
  - Interaksi Hover: Brand-400 (`#a3e635`)
  - Warna ini memberi kontras mencolok terhadap latar gelap, pas untuk highlight yang menunjukkan kesuksesan, outline input yang aktif, atau badge status.
- **Warna Aksi Spesifik (Saran untuk Deleter):**
  - Destruktif (Hapus/Danger): Red-500 (`#ef4444`) untuk tombol eksekusi hapus.
  - Peringatan (Warning): Amber-500 (`#f59e0b`)

## 3. Tata Letak & Bentuk (Layout & Shapes)
- **Rounded Corners (Sudut Membulat):** Elemen UI menggunakan gaya melengkung seperti `rounded-xl` atau `rounded-2xl` untuk container/kartu. Tombol input menggunakan `rounded-lg` atau `rounded-full`.
- **Borders (Garis Tepi):** Jangan gunakan bayangan tebal (box-shadow). Gantikan dengan garis batas tipis yang transparan seperti `border border-white/5` atau `border border-white/10` untuk memberi efek kartu yang melayang rata.
- **Pusat Elemen (Centered layout):** Pusatkan fokus pengguna. Gunakan max-width (misalnya `max-w-xl` atau `max-w-2xl mx-auto`) dengan white-space/negative space yang lega di luar komponen.

## 4. Komunikasi & Interaktivitas
- **Ikonografi:** Menggunakan pustaka *Lucide React* (style garis bersih / line icons).
- **Animasi:** Transisi masuk yang mulus seperti *fade-in* sangat direkomendasikan dibandingkan animasi yang terlalu banyak melompat/bounce.
- **State Kosong (Empty State):** Jika daftar masih kosong, berikan placeholder terpusat dengan ikon ilustratif dan instruksi yang ramah.

---

**Contoh Variabel CSS (Tailwind):**
```css
@theme {
  --color-zinc-950: #09090b;
  --color-zinc-900: #18181b;
  
  --font-sans: "Inter", sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  
  --color-brand-500: #84cc16; /* Lime untuk Kurator Core */
  --color-danger-500: #ef4444; /* Merah untuk Deleter App */
}
```
