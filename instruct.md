# Alur Logika (Instruction & Flow)
## Proyek: Kurator Companion - Batch File Deleter

Dokumen ini menjelaskan rancangan alur kerja dan logika untuk membangun aplikasi pendamping (secara khusus *Batch File Deleter*). Aplikasi ini bertugas menghapus file secara lokal berdasarkan daftar nama file tertentu (misalnya, dari hasil *report REJECTED* yang diberikan oleh alat Kurator utama).

> **PRINSIP KEAMANAN (CRITICAL):** Karena tugas utamanya adalah menghapus data lokal secara langsung, tingkat akurasi (presisi pencocokan) dan *user consent* (konfirmasi pengguna) tidak boleh dilompati.

### 1. Alur Penggunaan (User Flow)

#### Tahap Awal: Memasukkan Target Data
1. **Input Daftar Nama File:**
   - Aplikasi menyediakan *Text Area* (area teks) berukuran besar atau fitur *file drop* untuk file teks `.txt/.csv` hasil unduhan Kurator.
   - Pengguna menempelkan (paste) list nama-nama file.
   - **Logika Sistem:** Sistem mem-parsing teks (berdasarkan ganti-baris atau koma), melakukan *trim* (membersihkan spasi ekstra), dan memfilter baris kosong. Menghasilkan *Array* String murni dari nama file yang dibidik.

#### Tahap Menengah: Pemilihan dan Pencocokan
2. **Pilih Direktori/Folder Eksekusi:**
   - Pengguna menekan tombol "Pilih Folder Sumber".
   - Browser memunculkan otorisasi baca/tulis lokal. (Browser API: `window.showDirectoryPicker()` dari *File System Access API*).
   - Pengguna memilih folder dimana foto-foto aslinya berada.

3. **Verifikasi dan Pencocokan (Matching Process):**
   - Aplikasi membaca struktur file di folder tujuan.
   - Aplikasi melakukan *Cross-Reference* antara array target pengguna dengan *handle nama file* sungguhan di dalam folder.
   - **Preview Data:** Muncul daftar tabel rangkuman **sebelum** eksekusi apa pun dlkakukan:
     - *Daftar Ditemukan (Matched)*: Item ada di list pengguna, dan ada di folder secara fisik.
     - *Daftar Tidak Ditemukan (Not Found)*: Item ada di list pengguna, namun fisiknya tidak ditemukan di folder lokal.
   - Tampilan ini mencegah proses penghapusan "membabi-buta" dan membiarkan pengguna memvalidasi data jika folder yang dipilih salah.

#### Tahap Eksekusi: Penghapusan Aman
4. **Eksekusi Penghapusan:**
   - Tombol eksekusi merah "Hapus Permanen X File" muncul.
   - **(PENTING = CEGATAN AKHIR)** Harus ada satu jendela peringatan akhir (Dialog/Modal): *"Tindakan ini tidak bisa dibatalkan dan file mungkin tidak masuk ke Recycle Bin. Lanjutkan menghapus %n file?"*.
   - **Logika Internal (Keamanan Penuh):** Saat iterasi loop untuk hapus, HANYA izinkan eksekusi `fileHandle.remove()` JIKA nama `fileHandle.name` secara PERSIS (Exact String Match) ada di daftar target teks. File apa pun yang berbeda sedikit namanya atau tidak ada draf target MUTLAK HARUS diabaikan.

#### Tahap Akhir
5. **Ringkasan (Summary):**
   - Aplikasi melaporkan hasil tugas: "Selesai! X file berhsil dihapus.".
   - Opsi untuk kembali ke menu awal untuk tugas baru.

### 2. Panduan Eksekusi Teknis

- **Metode Pendekatan (Client-Side Only):**
  Aplikasi Deleter harus berjalan 100% menggunakan browser pengguna tanpa server backend (tanpa Node.js untuk I/O file). Kenapa? Memastikan kepercayaaan dan kecepatan; mentransfer data lokal ke backend cuma untuk dihapus adalah sia-sia dan mengancam privasi.
- **API Khusus:**
  Gunakan **File System Access API**. Fungsi kunci:
  - `await window.showDirectoryPicker({ mode: 'readwrite' })` untuk mendapat Handle.
  - Looping isi direktori dengan async iterator: `for await (const entry of directoryHandle.values()) { ... }`.
  - Hapus file: `await directoryHandle.removeEntry(matchedFileName)`.
- **Kompatibilitas:**
  Selalu lakukan *feature detection*. Jika browser tidak mendukung File System Access API (contohnya Firefox atau mobile iOS lama), berikan layar pemberitahuan yang sopan menyarankan Google Chrome atau Edge Desktop.
