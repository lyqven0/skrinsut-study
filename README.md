# Skrinsut Study 📸📚

> Solusi digital kehidupan mahasiswa satu kelas: papan pengumuman tugas, jadwal kuliah & ujian, materi, dan bank soal latihan. Ringan, mobile-first, tanpa login untuk mahasiswa umum.

---

## 🚀 Fitur Utama

### 📌 Fase 1: Papan Pengumuman & Jadwal Kuliah (Selesai)

1. **Papan Pengumuman Tugas**
   - Usulan terbuka untuk seluruh mahasiswa kelas (mata kuliah, judul tugas, tanggal/jam deadline, catatan singkat, nama penambah).
   - Filter ketat: Usulan baru masuk dengan status `menunggu` dan hanya tayang setelah disetujui admin.
   - Papan publik hanya menampilkan tugas yang berstatus `disetujui` dan belum melewati deadline.
   - Chip urgensi otomatis: 🟢 Hijau (>3 hari), 🟡 Kuning (≤3 hari), 🔴 Merah (hari ini / besok).
   - Ekspor kalender satu-klik (`.ics`) per tugas.
   - Banner pasif otomatis di Beranda jika ada tugas yang jatuh tempo dalam 48 jam.

2. **Jadwal Kuliah Mingguan**
   - Tampilan mobile-first: tab per hari (Senin–Sabtu) dengan penyorotan "HARI INI".
   - Tampilan desktop: grid mingguan 6 hari.
   - Ekspor seluruh jadwal ke file kalender `.ics`.

3. **Panel Admin Khusus Pengurus Kelas (Dasar)**
   - Login terpisah di `/admin/login` menggunakan Supabase Auth.
   - Verifikasi ganda: session Supabase + whitelist di tabel `admins` dan Row Level Security (RLS) PostgreSQL.
   - Antrean usulan tugas: setujui (langsung tayang), tolak, atau hapus.
   - Kelola mata kuliah (tambah, edit, hapus kode & nama mata kuliah).
   - Kelola jadwal kuliah mingguan (atur hari, jam mulai/selesai, ruang kelas, dan dosen).

4. **Pencarian Cepat & Navigasi Mobile-First**
   - `/cari`: Pencarian cepat (case-insensitive `ilike`) untuk tugas dan mata kuliah.
   - Bottom navigation 4 tab untuk HP, top navbar untuk layar desktop.
   - Mode gelap (dark mode) sinkron dengan preferensi sistem + toggle manual (tersimpan di `localStorage`).
   - Ukuran tap target minimal 44px, tipografi responsif dan terbaca di layar HP 360px.
   - Status urgensi tidak hanya bergantung pada warna (selalu dilengkapi label teks).

---

### 🎓 Fase 2: Bank Soal & Pusat Belajar Terpadu (Selesai)

1. **Pusat Belajar & Materi Kuliah (`/belajar`, `/belajar/:courseId`)**
   - **Katalog Terpadu**: Tampilan ringkasan mata kuliah dengan jumlah materi dan bank soal tersedia.
   - **Detail Mata Kuliah**: Daftar materi terverifikasi yang dapat difilter berdasarkan jenis (`slide`, `catatan`, `video`, `link`, `rekaman`, `lainnya`) dan kolom pencarian.
   - **Usulan Materi Terbuka**: Seluruh mahasiswa dapat mengusulkan tautan materi (Google Drive, YouTube, Notion, dsb.) dengan status antrean moderasi admin.
   - **Akses Cepat Belajar**: Navigasi langsung ke Mode Latihan dan Simulasi Ujian dari mata kuliah yang dipilih.

2. **Bank Soal & Mode Latihan Mandiri (`/latihan`)**
   - **Filter Fleksibel**: Pilih mata kuliah, filter multi-topik/bab, jumlah soal (5, 10, 20, atau semua), serta opsi khusus "Hanya yang Dibookmark".
   - **Umpan Balik Instan**: Kunci jawaban dan penjelasan pembahasan langsung ditampilkan setelah mahasiswa memilih opsi.
   - **Dukungan Formula KaTeX**: Rendering rumus matematika, sains, dan ekspresi logika secara presisi via LaTeX (`$...$` untuk inline dan `$$...$$` untuk blok display).
   - **Personalisasi Belajar (Client-Side / Privat)**:
     - **Bookmark Soal**: Tandai soal penting atau sulit untuk diulang kembali.
     - **Catatan Pribadi**: Tambahkan catatan penjelasan pribadi per soal yang tersimpan aman di `localStorage`.
   - **Lapor Soal (`ReportModal`)**: Formulir pelaporan kesalahan kunci jawaban, typo, atau materi membingungkan yang langsung masuk ke antrean admin.
   - **Rangkuman Hasil Latihan**: Tampilan skor akhir, persentase benar, dan tombol khusus "Ulangi Soal yang Salah".

3. **Simulasi Ujian Real-Time (`/simulasi`)**
   - **Aturan Ujian Terkontrol**: Pengaturan durasi countdown timer (15, 30, 45, atau 60 menit) dengan peringatan visual saat waktu hampir habis.
   - **Navigasi Soal Grid Interaktif**: Palet nomor soal dengan indikator status warna (Belum Dijawab, Sudah Dijawab, Ditandai Ragu-Ragu).
   - **Fitur Ragu-Ragu**: Menandai nomor tertentu sebelum melakukan submit akhir.
   - **Pencegah Kesalahan Submit**: Peringatan otomatis jika masih ada nomor soal yang belum terisi.
   - **Review Nilai & Pembahasan Lengkap**: Kartu skor total (skala 0–100), rekapitulasi benar/salah/kosong, dan peninjauan pembahasan per nomor soal.

4. **Pengaturan & Manajemen Data Pribadi (`/pengaturan`)**
   - Pengaturan tema: Terang, Gelap, atau Otomatis (Sistem).
   - **Backup & Restore Data Lokal**: Ekspor seluruh bookmark dan catatan belajar mahasiswa ke file JSON, serta impor kembali ke perangkat lain kapan saja tanpa perlu akun login.
   - Reset data tersimpan di browser secara mandiri.

5. **Panel Admin Fase 2 Lengkap (`/admin/*`)**
   - **Antrean Usulan Materi (`/admin/materi`)**: Moderasi materi kiriman mahasiswa (setujui, tolak, edit URL, atau hapus).
   - **Manajemen Bank Soal (`/admin/soal`)**:
     - Tambah & edit soal secara visual lengkap dengan live-preview LaTeX/KaTeX.
     - **Import Massal Soal via CSV**: Upload ratusan soal sekaligus dengan validasi format kolom otomatis dan pratinjau sebelum disimpan ke database.
     - Ekspor bank soal ke file CSV atau JSON untuk cadangan data.
   - **Antrean Laporan Soal (`/admin/laporan-soal`)**: Daftar laporan keluhan soal dari mahasiswa, pintasan langsung untuk mengedit soal bermasalah, dan penutupan tiket laporan.
   - **Kelola Jadwal Ujian (`/admin/ujian`)**: Manajemen jadwal UTS & UAS per mata kuliah (tanggal, waktu mulai/selesai, jenis ujian, ruang kelas, dan catatan pengawas).
   - **Statistik & Analisis Soal (`/admin/statistik-soal`)**: Analisis tingkat kesulitan soal (persentase akurasi jawaban benar/salah via RPC Supabase `get_question_stats`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6
- **Styling & Ikon**: Tailwind CSS v3, Lucide React (ringan & konsisten)
- **Mathematical Rendering**: KaTeX (render LaTeX cepat tanpa dependensi berat)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Row Level Security + RPC)
- **Penyimpanan Lokal**: Browser LocalStorage & SessionStorage (data privat: bookmark & catatan belajar)
- **Timezone**: Asia/Jakarta (WIB)

---

## ⚙️ Panduan Setup Supabase

### 1. Buat Project Baru di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com).
2. Buat project baru (pilih region terdekat, misal Singapore `ap-southeast-1`).

### 2. Jalankan Skrip Database SQL
Buka menu **SQL Editor** di Supabase Dashboard, lalu jalankan file SQL berikut secara berurutan:
1. `supabase/schema.sql` — Membuat enum, tabel (`courses`, `class_schedules`, `exams`, `announcements`, `materials`, `questions`, `question_reports`, `question_stats`, `admins`), constraint panjang teks, dan fungsi RPC statistik.
2. `supabase/rls.sql` — Mengaktifkan Row Level Security (RLS) untuk melindungi akses anonim dan membatasi manipulasi data hanya untuk admin.
3. `supabase/seed.sql` — Mengisi data awal (mata kuliah, jadwal kelas, beberapa pengumuman tugas, dan 15 contoh soal).

### 3. Buat Akun Admin Pertama
1. Buka menu **Authentication** > **Users** di Supabase Dashboard.
2. Klik **Add User** > **Create User**.
3. Masukkan Email dan Password untuk admin kelas (misal: `admin@kelas.ac.id`).
4. Salin **User UID** dari pengguna yang baru dibuat.
5. Kembali ke **SQL Editor** dan jalankan query berikut untuk mendaftarkannya sebagai admin resmi:
   ```sql
   INSERT INTO admins (user_id) 
   VALUES ('MASUKKAN_USER_UID_DISINI');
   ```

---

## 🔑 Konfigurasi Lingkungan (.env)

Buat file `.env` di root project dengan menyalin `.env.example`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Kedua nilai tersebut bisa didapatkan di Supabase Dashboard: **Project Settings** > **API**.

---

## 💻 Cara Menjalankan Secara Lokal

```bash
# 1. Pastikan dependencies sudah terpasang
npm install

# 2. Jalankan server pengembangan
npm run dev

# 3. Akses di browser:
# Publik: http://localhost:5173
# Admin:  http://localhost:5173/admin/login
```

Untuk build produksi:
```bash
npm run build
```

---

## 📋 Format CSV Import Soal (Fase 2)

Header dan contoh baris file CSV untuk import massal bank soal melalui panel admin (`/admin/soal`):
```csv
mata_kuliah,topik,pertanyaan,opsi_a,opsi_b,opsi_c,opsi_d,kunci,pembahasan,sumber,tahun
Basis Data,SQL Dasar,"Perintah SQL untuk mengambil data adalah...","SELECT","INSERT","DELETE","UPDATE",a,"SELECT digunakan untuk membaca data dari tabel","UAS 2023",2023
Kalkulus,Turunan,"Berapakah turunan dari $f(x) = x^2$?","$x$","$2x$","$x^2$","$2$",b,"Turunan dari $x^n$ adalah $n x^{n-1}$","Latihan Mandiri",2024
```

> **Tips Penulisan Rumus**: Teks pertanyaan, pilihan opsi, maupun pembahasan mendukung sintaks LaTeX KaTeX secara langsung menggunakan tanda `$ ... $` untuk rumus sebaris (inline) atau `$$ ... $$` untuk rumus blok.

---

## 📌 Asumsi Desain & Arsitektur

1. **Satu Kelas Homogen**: Seluruh mahasiswa mengambil mata kuliah yang sama, sehingga tidak diperlukan fitur pemilihan kelompok/semester yang rumit.
2. **Deadline Tanggal Saja**: Jika pengusul tidak mengisi jam deadline, waktu deadline otomatis dianggap berakhir pada pukul `23:59:00 WIB` di tanggal tersebut.
3. **Zona Waktu Tunggal (WIB)**: Sesuai spesifikasi, seluruh perhitungan deadline dan jam kuliah menggunakan zona waktu `Asia/Jakarta`.
4. **Anti-Spam Sederhana**: Disediakan cooldown 30 detik di level browser (`sessionStorage`) dan hidden honeypot field pada formulir usulan tugas & materi.
5. **Kemandirian & Privasi Mahasiswa**:
   - Mahasiswa umum tidak perlu login untuk membaca pengumuman, materi, atau mengerjakan latihan.
   - Bookmark dan catatan belajar disimpan di `localStorage` per peramban, dengan fitur ekspor/impor JSON agar data dapat dicadangkan.
6. **Arsitektur Serverless & Jamstack**: Seluruh data publik ditarik langsung dari Supabase tanpa server backend Node.js perantara, dengan keamanan dijamin oleh Row Level Security (RLS) PostgreSQL.

