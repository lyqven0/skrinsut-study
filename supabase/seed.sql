-- =============================================================================
-- Skrinsut Study — Seed Data
-- =============================================================================
-- Data realistis untuk kelas Ilmu Komputer di universitas Indonesia.
-- Semua deadline menggunakan NOW() + interval agar selalu relatif.
-- =============================================================================

-- =============================================================================
-- COURSES (Mata Kuliah)
-- =============================================================================
INSERT INTO courses (id, nama, kode, dosen) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Basis Data',         'BD101', 'Dr. Andi Wijaya, M.Kom.'),
  ('a1000000-0000-0000-0000-000000000002', 'Struktur Data',      'SD201', 'Dr. Budi Santoso, M.Cs.'),
  ('a1000000-0000-0000-0000-000000000003', 'Pemrograman Web',    'PW301', 'Ibu Citra Dewi, S.Kom., M.T.'),
  ('a1000000-0000-0000-0000-000000000004', 'Matematika Diskrit', 'MD102', 'Prof. Darmawan Hidayat, Ph.D.');

-- =============================================================================
-- CLASS SCHEDULES (Jadwal Kelas)
-- =============================================================================
INSERT INTO class_schedules (course_id, hari, jam_mulai, jam_selesai, ruang, dosen) VALUES
  -- Basis Data
  ('a1000000-0000-0000-0000-000000000001', 'senin', '08:00', '10:00', 'A301', 'Dr. Andi Wijaya, M.Kom.'),
  ('a1000000-0000-0000-0000-000000000001', 'rabu',  '10:00', '12:00', 'A301', 'Dr. Andi Wijaya, M.Kom.'),
  -- Struktur Data
  ('a1000000-0000-0000-0000-000000000002', 'selasa', '10:00', '12:00', 'B202', 'Dr. Budi Santoso, M.Cs.'),
  ('a1000000-0000-0000-0000-000000000002', 'kamis',  '08:00', '10:00', 'B202', 'Dr. Budi Santoso, M.Cs.'),
  -- Pemrograman Web
  ('a1000000-0000-0000-0000-000000000003', 'rabu',  '13:00', '15:00', 'Lab Komputer 1', 'Ibu Citra Dewi, S.Kom., M.T.'),
  ('a1000000-0000-0000-0000-000000000003', 'jumat', '10:00', '12:00', 'Lab Komputer 1', 'Ibu Citra Dewi, S.Kom., M.T.'),
  -- Matematika Diskrit
  ('a1000000-0000-0000-0000-000000000004', 'senin', '13:00', '15:00', 'C103', 'Prof. Darmawan Hidayat, Ph.D.'),
  ('a1000000-0000-0000-0000-000000000004', 'kamis', '13:00', '15:00', 'C103', 'Prof. Darmawan Hidayat, Ph.D.');

-- =============================================================================
-- EXAMS (Ujian)
-- =============================================================================
INSERT INTO exams (course_id, jenis, tanggal, jam, ruang) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'uts', (CURRENT_DATE + interval '30 days')::date, '08:00', 'Gedung Ujian Lt. 2'),
  ('a1000000-0000-0000-0000-000000000002', 'uts', (CURRENT_DATE + interval '31 days')::date, '10:00', 'Gedung Ujian Lt. 3'),
  ('a1000000-0000-0000-0000-000000000003', 'uts', (CURRENT_DATE + interval '32 days')::date, '13:00', 'Lab Komputer 2'),
  ('a1000000-0000-0000-0000-000000000004', 'uts', (CURRENT_DATE + interval '33 days')::date, '08:00', 'Gedung Ujian Lt. 1');

-- =============================================================================
-- ANNOUNCEMENTS (Pengumuman)
-- =============================================================================

-- 1. Disetujui, deadline 7 hari dari sekarang
INSERT INTO announcements (course_id, judul, deadline, deadline_hanya_tanggal, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Tugas 3: Query JOIN dan Subquery',
   NOW() + interval '7 days',
   false,
   'Kerjakan soal 1-10 di halaman 45 buku "Database System Concepts". Upload ke e-learning dalam format PDF.',
   'Rizki',
   'disetujui',
   NOW() - interval '1 day');

-- 2. Disetujui, deadline 3 hari dari sekarang
INSERT INTO announcements (course_id, judul, deadline, deadline_hanya_tanggal, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000002',
   'Kuis Online: Linked List & Stack',
   NOW() + interval '3 days',
   false,
   'Kuis dilaksanakan via Google Forms. Link ada di grup WhatsApp kelas. Durasi 30 menit.',
   'Sinta',
   'disetujui',
   NOW() - interval '2 days');

-- 3. Disetujui, deadline besok (urgent!)
INSERT INTO announcements (course_id, judul, deadline, deadline_hanya_tanggal, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000003',
   'Deadline Laporan Praktikum Modul 2',
   NOW() + interval '1 day',
   false,
   'Kumpulkan laporan praktikum HTML & CSS. Format: PDF, nama file NIM_Modul2.pdf.',
   'Fajar',
   'disetujui',
   NOW() - interval '5 days');

-- 4. Menunggu persetujuan (pending)
INSERT INTO announcements (course_id, judul, deadline, deadline_hanya_tanggal, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000004',
   'Info: Kelas Pengganti Matematika Diskrit',
   NOW() + interval '5 days',
   false,
   'Kelas pengganti hari Sabtu jam 09:00-11:00 di ruang C103. Materi: Graf dan Pohon.',
   'Dewi',
   'menunggu',
   NOW());

-- 5. Disetujui, dengan deadline_hanya_tanggal = true
INSERT INTO announcements (course_id, judul, deadline, deadline_hanya_tanggal, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Pengumpulan Proposal Proyek Akhir Basis Data',
   (NOW() + interval '10 days')::date::timestamptz,
   true,
   'Proposal proyek akhir dikumpulkan dalam format PDF ke e-learning. Topik bebas terkait DBMS. Minimal 5 halaman.',
   'Andi',
   'disetujui',
   NOW() - interval '3 days');

-- =============================================================================
-- MATERIALS (Materi)
-- =============================================================================

-- Disetujui: slide untuk Basis Data
INSERT INTO materials (course_id, judul, topik, jenis, tautan, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Slide Pertemuan 5: Normalisasi Database',
   'Normalisasi',
   'slide',
   'https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsT/view',
   'Slide dari dosen. Mencakup 1NF, 2NF, 3NF, dan BCNF.',
   'Rizki',
   'disetujui',
   NOW() - interval '7 days');

-- Disetujui: PDF untuk Struktur Data
INSERT INTO materials (course_id, judul, topik, jenis, tautan, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000002',
   'Rangkuman Materi Linked List',
   'Linked List',
   'pdf',
   'https://drive.google.com/file/d/2xYzAbCdEfGhIjKlMnOpQ/view',
   'Rangkuman buatan sendiri berdasarkan buku "Data Structures and Algorithms in Java". Cocok untuk persiapan UTS.',
   'Sinta',
   'disetujui',
   NOW() - interval '5 days');

-- Disetujui: video untuk Pemrograman Web
INSERT INTO materials (course_id, judul, topik, jenis, tautan, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000003',
   'Tutorial JavaScript DOM Manipulation',
   'JavaScript DOM',
   'video',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'Video tutorial 45 menit, sangat membantu untuk memahami event handling dan manipulasi elemen HTML.',
   'Fajar',
   'disetujui',
   NOW() - interval '3 days');

-- Disetujui: catatan tanpa tautan untuk Matematika Diskrit
INSERT INTO materials (course_id, judul, topik, jenis, tautan, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000004',
   'Catatan Kuliah: Logika Proposisi',
   'Logika Proposisi',
   'catatan',
   NULL,
   E'Rangkuman singkat:\n• Proposisi: pernyataan yang bernilai benar atau salah\n• Konjungsi (∧): AND\n• Disjungsi (∨): OR\n• Negasi (¬): NOT\n• Implikasi (→): IF...THEN\n• Biimplikasi (↔): IF AND ONLY IF\n\nTabel kebenaran wajib dihafal untuk UTS!',
   'Dewi',
   'disetujui',
   NOW() - interval '10 days');

-- Menunggu persetujuan (pending)
INSERT INTO materials (course_id, judul, topik, jenis, tautan, catatan, ditambahkan_oleh, status, dibuat_pada) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Cheatsheet SQL Commands',
   'SQL Dasar',
   'pdf',
   'https://drive.google.com/file/d/3qRsTuVwXyZaBcDeFgHiJ/view',
   'Kumpulan perintah SQL yang sering dipakai. Disusun per kategori: DDL, DML, DCL.',
   'Bima',
   'menunggu',
   NOW() - interval '1 day');

-- =============================================================================
-- QUESTIONS — Bank Soal Basis Data (15 soal)
-- =============================================================================
-- Topik: SQL Dasar, Normalisasi, ER Diagram

-- ----- SQL Dasar (5 soal) -----

INSERT INTO questions (id, course_id, topik, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci, pembahasan, sumber, tahun, diverifikasi_oleh) VALUES
  ('b1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'SQL Dasar',
   'Perintah SQL yang digunakan untuk mengambil data dari tabel adalah...',
   'INSERT', 'SELECT', 'UPDATE', 'DELETE',
   'b',
   'SELECT adalah perintah DML (Data Manipulation Language) yang digunakan untuk mengambil/membaca data dari satu atau lebih tabel dalam database.',
   'UTS 2024', 2024, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'SQL Dasar',
   'Apa fungsi dari klausa WHERE dalam pernyataan SQL?',
   'Mengurutkan hasil query',
   'Memfilter baris berdasarkan kondisi tertentu',
   'Mengelompokkan data',
   'Menggabungkan dua tabel',
   'b',
   'Klausa WHERE digunakan untuk memfilter baris yang memenuhi kondisi tertentu. Tanpa WHERE, semua baris akan ditampilkan. ORDER BY untuk mengurutkan, GROUP BY untuk mengelompokkan, dan JOIN untuk menggabungkan tabel.',
   'UTS 2024', 2024, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'SQL Dasar',
   'Perhatikan query berikut:\nSELECT nama, COUNT(*) FROM mahasiswa GROUP BY nama HAVING COUNT(*) > 1;\n\nApa yang dilakukan query tersebut?',
   'Menampilkan semua mahasiswa',
   'Menampilkan nama mahasiswa yang muncul lebih dari sekali (duplikat)',
   'Menghitung total mahasiswa',
   'Menghapus data duplikat',
   'b',
   'Query ini mengelompokkan data berdasarkan kolom "nama", lalu HAVING COUNT(*) > 1 memfilter hanya kelompok yang memiliki lebih dari satu baris, artinya nama yang duplikat.',
   'UAS 2023', 2023, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'SQL Dasar',
   'Jenis JOIN yang mengembalikan semua baris dari tabel kiri meskipun tidak ada pasangan di tabel kanan adalah...',
   'INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN',
   'c',
   'LEFT JOIN (atau LEFT OUTER JOIN) mengembalikan semua baris dari tabel kiri. Jika tidak ada baris yang cocok di tabel kanan, kolom dari tabel kanan akan bernilai NULL.',
   'UTS 2024', 2024, 'AI diverifikasi'),

  ('b1000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'SQL Dasar',
   'Perintah SQL berikut termasuk kategori apa?\nCREATE TABLE mahasiswa (id INT PRIMARY KEY, nama VARCHAR(50));',
   'DML (Data Manipulation Language)',
   'DDL (Data Definition Language)',
   'DCL (Data Control Language)',
   'TCL (Transaction Control Language)',
   'b',
   'CREATE TABLE adalah perintah DDL karena digunakan untuk mendefinisikan struktur objek database (tabel). DDL lainnya: ALTER, DROP, TRUNCATE. DML: SELECT, INSERT, UPDATE, DELETE.',
   'UAS 2023', 2023, 'Dr. Andi Wijaya');

-- ----- Normalisasi (5 soal) -----

INSERT INTO questions (id, course_id, topik, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci, pembahasan, sumber, tahun, diverifikasi_oleh) VALUES
  ('b1000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000001',
   'Normalisasi',
   'Suatu relasi dikatakan memenuhi 1NF (First Normal Form) jika...',
   'Tidak ada atribut yang bergantung transitif pada primary key',
   'Setiap atribut hanya mengandung nilai atomik (tidak ada repeating group)',
   'Setiap atribut non-key bergantung penuh pada primary key',
   'Tidak ada ketergantungan fungsional parsial',
   'b',
   '1NF mensyaratkan bahwa setiap sel dalam tabel hanya berisi satu nilai (atomik), tidak ada repeating group atau array. Contoh pelanggaran: kolom "telepon" berisi "081xxx, 082xxx".',
   'UAS 2023', 2023, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000001',
   'Normalisasi',
   'Anomali yang terjadi ketika kita tidak bisa menambah data karena data lain yang dibutuhkan belum tersedia disebut...',
   'Update Anomaly',
   'Delete Anomaly',
   'Insert Anomaly',
   'Read Anomaly',
   'c',
   'Insert Anomaly terjadi ketika kita tidak bisa memasukkan data baru karena ada kolom wajib lain yang belum memiliki nilai. Ini sering terjadi pada tabel yang belum dinormalisasi dengan benar.',
   'UTS 2024', 2024, 'AI diverifikasi'),

  ('b1000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000001',
   'Normalisasi',
   'Relasi R(A, B, C, D) dengan FD: {A → B, A → C, C → D}. Relasi ini memenuhi bentuk normal tertinggi apa jika A adalah primary key?',
   '1NF',
   '2NF',
   '3NF',
   'BCNF',
   'b',
   'Karena C → D dan C bukan superkey, terdapat ketergantungan transitif (A → C → D), sehingga melanggar 3NF. Relasi ini memenuhi 2NF karena tidak ada ketergantungan parsial (primary key hanya satu atribut A).',
   'UAS 2023', 2023, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000001',
   'Normalisasi',
   'Apa tujuan utama dari proses normalisasi database?',
   'Mempercepat semua query tanpa pengecualian',
   'Mengurangi redundansi data dan mencegah anomali',
   'Menambah jumlah tabel agar lebih terstruktur',
   'Mengamankan data dari akses tidak sah',
   'b',
   'Tujuan utama normalisasi adalah mengurangi redundansi (pengulangan) data dan mencegah anomali (insert, update, delete anomaly). Walaupun jumlah tabel bisa bertambah, itu efek samping, bukan tujuan.',
   'UTS 2024', 2024, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000001',
   'Normalisasi',
   'BCNF (Boyce-Codd Normal Form) mensyaratkan bahwa untuk setiap FD X → Y yang non-trivial, X harus...',
   'Berupa candidate key',
   'Berupa superkey',
   'Berupa primary key',
   'Berupa foreign key',
   'b',
   'BCNF mensyaratkan bahwa untuk setiap ketergantungan fungsional non-trivial X → Y, X harus merupakan superkey. Ini lebih ketat dari 3NF yang masih mengizinkan Y sebagai bagian dari candidate key.',
   'UAS 2023', 2023, 'AI diverifikasi');

-- ----- ER Diagram (5 soal) -----

INSERT INTO questions (id, course_id, topik, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci, pembahasan, sumber, tahun, diverifikasi_oleh) VALUES
  ('b1000000-0000-0000-0000-000000000011',
   'a1000000-0000-0000-0000-000000000001',
   'ER Diagram',
   'Dalam ER Diagram, entitas digambarkan dengan bentuk...',
   'Belah ketupat (diamond)',
   'Oval / elips',
   'Persegi panjang (rectangle)',
   'Segitiga',
   'c',
   'Dalam notasi Chen, entitas digambarkan dengan persegi panjang, atribut dengan oval/elips, dan relasi (relationship) dengan belah ketupat (diamond).',
   'UTS 2024', 2024, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000012',
   'a1000000-0000-0000-0000-000000000001',
   'ER Diagram',
   'Hubungan antara entitas "Mahasiswa" dan "Mata Kuliah" dimana satu mahasiswa bisa mengambil banyak mata kuliah, dan satu mata kuliah bisa diambil banyak mahasiswa, termasuk jenis kardinalitas...',
   'One-to-One (1:1)',
   'One-to-Many (1:N)',
   'Many-to-Many (M:N)',
   'Unary',
   'c',
   'Ini merupakan relasi Many-to-Many (M:N) karena satu mahasiswa bisa mengambil banyak mata kuliah dan sebaliknya. Dalam implementasi, relasi M:N memerlukan tabel penghubung (junction/bridge table).',
   'UTS 2024', 2024, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000013',
   'a1000000-0000-0000-0000-000000000001',
   'ER Diagram',
   'Atribut yang nilainya bisa diturunkan dari atribut lain disebut...',
   'Composite attribute',
   'Multivalued attribute',
   'Derived attribute',
   'Key attribute',
   'c',
   'Derived attribute (atribut turunan) adalah atribut yang nilainya dapat dihitung atau diturunkan dari atribut lain. Contoh: "umur" yang dihitung dari "tanggal_lahir". Dalam ER Diagram, digambarkan dengan garis putus-putus.',
   'UAS 2023', 2023, 'AI diverifikasi'),

  ('b1000000-0000-0000-0000-000000000014',
   'a1000000-0000-0000-0000-000000000001',
   'ER Diagram',
   'Apa yang dimaksud dengan weak entity dalam ER Diagram?',
   'Entitas yang memiliki banyak atribut',
   'Entitas yang tidak memiliki primary key sendiri dan bergantung pada entitas lain',
   'Entitas yang hanya memiliki satu atribut',
   'Entitas yang tidak memiliki relasi',
   'b',
   'Weak entity adalah entitas yang tidak memiliki atribut yang cukup untuk membentuk primary key sendiri. Ia bergantung pada entitas kuat (strong entity) melalui identifying relationship. Contoh: entitas "Tanggungan" yang bergantung pada "Karyawan".',
   'UAS 2023', 2023, 'Dr. Andi Wijaya'),

  ('b1000000-0000-0000-0000-000000000015',
   'a1000000-0000-0000-0000-000000000001',
   'ER Diagram',
   'Pada proses mapping ER ke model relasional, relasi Many-to-Many (M:N) antara dua entitas dipetakan menjadi...',
   'Menambah foreign key di salah satu tabel',
   'Menggabungkan kedua tabel menjadi satu',
   'Membuat tabel baru yang berisi primary key kedua entitas sebagai foreign key',
   'Tidak perlu perubahan, langsung gunakan kedua tabel',
   'c',
   'Relasi M:N dipetakan dengan membuat tabel penghubung baru (junction table) yang memiliki foreign key ke kedua tabel entitas. Primary key tabel penghubung biasanya berupa composite key dari kedua FK tersebut.',
   'UTS 2024', 2024, 'Dr. Andi Wijaya');

-- =============================================================================
-- QUESTION STATS (seed beberapa statistik awal)
-- =============================================================================
INSERT INTO question_stats (question_id, jumlah_dijawab, jumlah_benar) VALUES
  ('b1000000-0000-0000-0000-000000000001', 42, 38),  -- soal mudah, 90% benar
  ('b1000000-0000-0000-0000-000000000002', 35, 28),  -- 80% benar
  ('b1000000-0000-0000-0000-000000000003', 30, 15),  -- 50% benar, soal lebih susah
  ('b1000000-0000-0000-0000-000000000006', 28, 22),  -- 78% benar
  ('b1000000-0000-0000-0000-000000000008', 25, 8),   -- 32% benar, soal sulit
  ('b1000000-0000-0000-0000-000000000011', 40, 36),  -- soal mudah, 90% benar
  ('b1000000-0000-0000-0000-000000000012', 38, 30);  -- 79% benar

-- =============================================================================
-- QUESTION REPORTS (contoh laporan)
-- =============================================================================
INSERT INTO question_reports (question_id, alasan, status) VALUES
  ('b1000000-0000-0000-0000-000000000008',
   'Menurut saya jawaban seharusnya 3NF bukan 2NF, karena tidak ada partial dependency. Mohon dicek ulang.',
   'baru');
