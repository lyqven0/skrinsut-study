-- ============================================================
-- Skrinsut Study — Seed Data (Data Awal)
-- Jalankan SETELAH migration berhasil
-- ============================================================

-- 1. Mata Kuliah
INSERT INTO courses (id, nama, kode, dosen) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Basis Data', 'BD101', 'Dr. Andi Wijaya, M.Kom.'),
  ('a1000000-0000-0000-0000-000000000002', 'Struktur Data & Algoritma', 'SD201', 'Dr. Budi Santoso, M.Cs.'),
  ('a1000000-0000-0000-0000-000000000003', 'Pemrograman Web Modern', 'PW301', 'Ibu Citra Dewi, S.Kom., M.T.'),
  ('a1000000-0000-0000-0000-000000000004', 'Matematika Diskrit', 'MD102', 'Prof. Darmawan Hidayat, Ph.D.');

-- 2. Jadwal Kuliah
INSERT INTO class_schedules (course_id, hari, jam_mulai, jam_selesai, ruang, dosen) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'senin', '08:00', '10:00', 'Lab Database A301', 'Dr. Andi Wijaya, M.Kom.'),
  ('a1000000-0000-0000-0000-000000000004', 'senin', '13:00', '15:30', 'Ruang Teori R.102', 'Prof. Darmawan Hidayat, Ph.D.'),
  ('a1000000-0000-0000-0000-000000000002', 'selasa', '08:00', '10:30', 'Lab Algoritma B204', 'Dr. Budi Santoso, M.Cs.'),
  ('a1000000-0000-0000-0000-000000000003', 'rabu', '10:00', '12:30', 'Lab Komputer 3', 'Ibu Citra Dewi, S.Kom., M.T.'),
  ('a1000000-0000-0000-0000-000000000001', 'kamis', '13:00', '15:00', 'Ruang Teori R.204', 'Dr. Andi Wijaya, M.Kom.'),
  ('a1000000-0000-0000-0000-000000000004', 'jumat', '08:30', '10:30', 'Ruang Teori R.101', 'Prof. Darmawan Hidayat, Ph.D.'),
  ('a1000000-0000-0000-0000-000000000002', 'sabtu', '09:00', '11:00', 'Online Zoom', 'Dr. Budi Santoso, M.Cs.');

-- 3. Jadwal Ujian
INSERT INTO exams (course_id, jenis, tanggal, jam, ruang) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'uts', (CURRENT_DATE + INTERVAL '12 days')::date, '08:00:00', 'Gedung Ujian Lt. 2 R.201'),
  ('a1000000-0000-0000-0000-000000000002', 'uts', (CURRENT_DATE + INTERVAL '14 days')::date, '10:00:00', 'Gedung Ujian Lt. 3 R.305'),
  ('a1000000-0000-0000-0000-000000000003', 'uts', (CURRENT_DATE + INTERVAL '16 days')::date, '13:00:00', 'Lab Komputer 2');

-- 4. Pengumuman / Tugas
INSERT INTO announcements (course_id, judul, deadline, deadline_hanya_tanggal, catatan, ditambahkan_oleh, status, disetujui_oleh, disetujui_pada) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Tugas 3: Query SQL JOIN & Agregasi Lanjutan',
   NOW() + INTERVAL '28 hours', false,
   'Kerjakan studi kasus e-commerce di bab 4. Kumpulkan dalam format PDF disertai screenshot hasil query execution plan.',
   'Rian (Ketua Kelas)', 'disetujui', 'Admin', NOW() - INTERVAL '2 days'),
  ('a1000000-0000-0000-0000-000000000003',
   'Proyek 1: REST API Backend Node.js & JWT Auth',
   NOW() + INTERVAL '3 days', false,
   'Kirim link repository GitHub ke Google Classroom. Pastikan menyertakan file README.md dan file .env.example.',
   'Sinta (PJ Praktikum)', 'disetujui', 'Admin', NOW() - INTERVAL '1 day'),
  ('a1000000-0000-0000-0000-000000000002',
   'Kuis Bab 5: Implementasi AVL Tree & Graph BFS/DFS',
   NOW() + INTERVAL '6 days', false,
   'Kuis online 45 menit melalui portal e-learning kampus. Materi mencakup penyeimbangan AVL Tree dan representasi Graph.',
   'Budi Santoso', 'disetujui', 'Admin', NOW() - INTERVAL '3 days');

-- 5. Materi Pembelajaran
INSERT INTO materials (course_id, judul, topik, jenis, tautan, catatan, ditambahkan_oleh, status, disetujui_oleh, disetujui_pada) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Slide Pertemuan 4: Normalisasi 1NF, 2NF, 3NF & BCNF',
   'Normalisasi Basis Data', 'slide',
   'https://docs.google.com/presentation/d/placeholder',
   'Slide resmi dari Dr. Andi Wijaya. Pelajari contoh anomali update, delete, dan insert.',
   'Rian (PJ Matkul)', 'disetujui', 'Admin', NOW() - INTERVAL '5 days'),
  ('a1000000-0000-0000-0000-000000000001',
   'Ringkasan Rumus Aljabar Relasional & SQL Mapping',
   'Aljabar Relasional', 'catatan',
   '', 'Operasi dasar: Seleksi σ, Proyeksi π, Cartesian Product ×, Set Difference −, dan Natural Join ⋈.',
   'Dimas', 'disetujui', 'Admin', NOW() - INTERVAL '3 days'),
  ('a1000000-0000-0000-0000-000000000002',
   'Video Penjelasan Singkat: Analisis Kompleksitas Big-O O(n log n)',
   'Analisis Algoritma', 'video',
   'https://www.youtube.com/watch?v=placeholder',
   'Penjelasan visual perbandingan Merge Sort vs Quick Sort vs Bubble Sort.',
   'Irfan', 'disetujui', 'Admin', NOW() - INTERVAL '7 days');

-- 6. Bank Soal Latihan
INSERT INTO questions (course_id, topik, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci, pembahasan, sumber, tahun, diverifikasi_oleh) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Normalisasi',
   'Sebuah relasi dikatakan memenuhi Bentuk Normal Kedua (2NF) jika telah memenuhi 1NF dan...',
   'Tidak memiliki atribut bernilai ganda',
   'Tidak memiliki ketergantungan parsial (partial functional dependency) terhadap primary key',
   'Tidak memiliki ketergantungan transitif',
   'Setiap determinan merupakan superkey kandidat',
   'b',
   '2NF mensyaratkan relasi sudah dalam 1NF dan setiap atribut bukan kunci primer bergantung penuh secara fungsional pada seluruh primary key.',
   'UTS Basis Data 2024', 2024, 'Admin'),
  ('a1000000-0000-0000-0000-000000000001',
   'Aljabar Relasional',
   'Simbol operasi aljabar relasional σ_{kondisi}(R) digunakan untuk merepresentasikan operasi SQL apa?',
   'SELECT DISTINCT',
   'SELECT kolom_tertentu',
   'WHERE kondisi (seleksi baris/tuple)',
   'ORDER BY kolom',
   'c',
   'Simbol σ (sigma) adalah operasi seleksi yang memfilter baris (tuple) yang memenuhi predikat kondisi, setara dengan klausa WHERE pada SQL.',
   'Kuis 1 Basis Data', 2024, 'Admin'),
  ('a1000000-0000-0000-0000-000000000002',
   'Struktur Data Tree',
   'Berapakah batas selisih tinggi (balance factor) maksimum antara subtree kiri dan subtree kanan pada sebuah AVL Tree?',
   '0', '1', '2', 'Tidak terbatas',
   'b',
   'AVL Tree adalah self-balancing BST di mana selisih tinggi pada setiap simpul tidak boleh lebih dari 1.',
   'UAS Struktur Data 2023', 2023, 'Admin'),
  ('a1000000-0000-0000-0000-000000000003',
   'React & State',
   'Hook manakah dalam React yang digunakan untuk menjalankan side effect seperti fetch data atau berlangganan event?',
   'useState', 'useMemo', 'useEffect', 'useCallback',
   'c',
   'useEffect digunakan untuk menangani side effects seperti request HTTP, pembaruan DOM manual, timer, atau subscription.',
   'Praktikum Web', 2024, 'Admin'),
  ('a1000000-0000-0000-0000-000000000001',
   'SQL Query',
   'Perintah SQL manakah yang digunakan untuk menggabungkan baris dari dua tabel berdasarkan kolom terkait?',
   'MERGE', 'JOIN', 'UNION', 'COMBINE',
   'b',
   'JOIN digunakan untuk menggabungkan baris dari dua atau lebih tabel berdasarkan kolom terkait di antara mereka.',
   'UTS Basis Data 2024', 2024, 'Admin'),
  ('a1000000-0000-0000-0000-000000000002',
   'Sorting',
   'Algoritma sorting manakah yang memiliki kompleksitas waktu rata-rata O(n log n) dan merupakan divide-and-conquer?',
   'Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort',
   'c',
   'Merge Sort menggunakan pendekatan divide-and-conquer dengan membagi array menjadi dua bagian, mengurutkan masing-masing, lalu menggabungkannya.',
   'UAS Struktur Data 2023', 2023, 'Admin'),
  ('a1000000-0000-0000-0000-000000000004',
   'Graf',
   'Pada graf berarah G = (V, E), jika |V| = 5, berapa jumlah maksimum sisi (edges) yang mungkin tanpa self-loop?',
   '10', '20', '25', '15',
   'b',
   'Pada graf berarah tanpa self-loop, jumlah maksimum sisi = |V| × (|V| - 1) = 5 × 4 = 20.',
   'Kuis Matematika Diskrit', 2024, 'Admin'),
  ('a1000000-0000-0000-0000-000000000003',
   'CSS & Layout',
   'Property CSS manakah yang membuat elemen menjadi flex container?',
   'display: block', 'display: flex', 'display: grid', 'display: inline',
   'b',
   'display: flex membuat elemen menjadi flex container sehingga child elements-nya mengikuti aturan flexbox layout.',
   'Praktikum Web', 2024, 'Admin');

-- ============================================================
-- Done! ✅ Seed data berhasil dimasukkan.
-- ============================================================

