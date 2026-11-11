-- =============================================================================
-- Skrinsut Study — Student Class Information Board
-- Schema Definition
-- =============================================================================
-- This file creates the complete database schema including:
--   • Custom enum types
--   • All tables with constraints
--   • Indexes for common query patterns
--   • RPC function for question stats
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

-- Status for community-submitted announcements & materials
CREATE TYPE status_usulan AS ENUM ('menunggu', 'disetujui', 'ditolak');

-- Status for question reports (error/typo reports)
CREATE TYPE status_laporan AS ENUM ('baru', 'ditangani');

-- Days of the week (Indonesian)
CREATE TYPE hari_enum AS ENUM (
  'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'
);

-- Exam types
CREATE TYPE jenis_ujian AS ENUM ('uts', 'uas');

-- Material types
CREATE TYPE jenis_materi AS ENUM ('slide', 'pdf', 'video', 'catatan');

-- =============================================================================
-- TABLES
-- =============================================================================

-- -------------------------
-- 1. courses — Mata kuliah
-- -------------------------
CREATE TABLE courses (
  id    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama  text NOT NULL CONSTRAINT courses_nama_length  CHECK (length(nama)  <= 100),
  kode  text NOT NULL CONSTRAINT courses_kode_length  CHECK (length(kode)  <= 20),
  dosen text          CONSTRAINT courses_dosen_length CHECK (length(dosen) <= 100)
);

COMMENT ON TABLE  courses       IS 'Daftar mata kuliah';
COMMENT ON COLUMN courses.kode  IS 'Kode mata kuliah, misal BD101';
COMMENT ON COLUMN courses.dosen IS 'Dosen pengampu (opsional, bisa diisi di jadwal)';

-- -------------------------
-- 2. class_schedules — Jadwal kelas
-- -------------------------
CREATE TABLE class_schedules (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id  uuid      NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  hari       hari_enum NOT NULL,
  jam_mulai  time      NOT NULL,
  jam_selesai time     NOT NULL,
  ruang      text      CONSTRAINT schedules_ruang_length CHECK (length(ruang) <= 50),
  dosen      text      CONSTRAINT schedules_dosen_length CHECK (length(dosen) <= 100),

  CONSTRAINT schedules_jam_valid CHECK (jam_selesai > jam_mulai)
);

COMMENT ON TABLE class_schedules IS 'Jadwal perkuliahan mingguan';

-- -------------------------
-- 3. exams — Ujian (UTS / UAS)
-- -------------------------
CREATE TABLE exams (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id  uuid        NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  jenis      jenis_ujian NOT NULL,
  tanggal    date        NOT NULL,
  jam        time,
  ruang      text        CONSTRAINT exams_ruang_length CHECK (length(ruang) <= 50)
);

COMMENT ON TABLE exams IS 'Jadwal ujian tengah semester dan akhir semester';

-- -------------------------
-- 4. announcements — Pengumuman / tugas
-- -------------------------
CREATE TABLE announcements (
  id                    uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id             uuid          REFERENCES courses (id) ON DELETE CASCADE,
  judul                 text          NOT NULL CONSTRAINT ann_judul_length   CHECK (length(judul)  <= 200),
  deadline              timestamptz   NOT NULL,
  deadline_hanya_tanggal boolean      DEFAULT false,
  catatan               text          CONSTRAINT ann_catatan_length CHECK (length(catatan) <= 1000),
  ditambahkan_oleh      text          CONSTRAINT ann_ditambahkan_length CHECK (length(ditambahkan_oleh) <= 50),
  status                status_usulan DEFAULT 'menunggu',
  disetujui_oleh        uuid,
  disetujui_pada        timestamptz,
  dibuat_pada           timestamptz   DEFAULT now()
);

COMMENT ON TABLE  announcements                       IS 'Pengumuman tugas/deadline kelas';
COMMENT ON COLUMN announcements.deadline_hanya_tanggal IS 'True jika deadline hanya tanggal (bukan jam spesifik)';
COMMENT ON COLUMN announcements.ditambahkan_oleh       IS 'Nama/alias pengirim (anonim)';

-- -------------------------
-- 5. materials — Materi kuliah
-- -------------------------
CREATE TABLE materials (
  id                uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id         uuid          REFERENCES courses (id) ON DELETE CASCADE,
  judul             text          NOT NULL CONSTRAINT mat_judul_length  CHECK (length(judul)  <= 200),
  topik             text          NOT NULL CONSTRAINT mat_topik_length  CHECK (length(topik)  <= 100),
  jenis             jenis_materi  NOT NULL,
  tautan            text          CONSTRAINT mat_tautan_length CHECK (length(tautan) <= 500),
  catatan           text          CONSTRAINT mat_catatan_length CHECK (length(catatan) <= 2000),
  ditambahkan_oleh  text          CONSTRAINT mat_ditambahkan_length CHECK (length(ditambahkan_oleh) <= 50),
  status            status_usulan DEFAULT 'menunggu',
  disetujui_oleh    uuid,
  disetujui_pada    timestamptz,
  dibuat_pada       timestamptz   DEFAULT now(),

  -- Tautan harus berupa URL valid (http/https) jika diisi
  CONSTRAINT mat_tautan_url CHECK (
    tautan IS NULL
    OR tautan LIKE 'http://%'
    OR tautan LIKE 'https://%'
  ),

  -- Minimal salah satu harus diisi: tautan atau catatan
  CONSTRAINT mat_tautan_atau_catatan CHECK (
    tautan IS NOT NULL OR catatan IS NOT NULL
  )
);

COMMENT ON TABLE materials IS 'Materi kuliah yang dibagikan mahasiswa';

-- -------------------------
-- 6. questions — Bank soal latihan
-- -------------------------
CREATE TABLE questions (
  id               uuid   PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id        uuid   NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  topik            text   NOT NULL CONSTRAINT q_topik_length      CHECK (length(topik)      <= 100),
  pertanyaan       text   NOT NULL CONSTRAINT q_pertanyaan_length CHECK (length(pertanyaan) <= 5000),
  opsi_a           text   NOT NULL CONSTRAINT q_opsi_a_length     CHECK (length(opsi_a)     <= 1000),
  opsi_b           text   NOT NULL CONSTRAINT q_opsi_b_length     CHECK (length(opsi_b)     <= 1000),
  opsi_c           text   NOT NULL CONSTRAINT q_opsi_c_length     CHECK (length(opsi_c)     <= 1000),
  opsi_d           text   NOT NULL CONSTRAINT q_opsi_d_length     CHECK (length(opsi_d)     <= 1000),
  kunci            char(1) NOT NULL CONSTRAINT q_kunci_valid      CHECK (kunci IN ('a','b','c','d')),
  pembahasan       text   CONSTRAINT q_pembahasan_length CHECK (length(pembahasan) <= 5000),
  sumber           text   CONSTRAINT q_sumber_length     CHECK (length(sumber)     <= 100),
  tahun            integer,
  diverifikasi_oleh text  CONSTRAINT q_diverifikasi_length CHECK (length(diverifikasi_oleh) <= 100)
);

COMMENT ON TABLE  questions       IS 'Bank soal pilihan ganda untuk latihan';
COMMENT ON COLUMN questions.kunci IS 'Jawaban benar: a, b, c, atau d';

-- -------------------------
-- 7. question_reports — Laporan kesalahan soal
-- -------------------------
CREATE TABLE question_reports (
  id          uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id uuid          NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  alasan      text          NOT NULL CONSTRAINT qr_alasan_length CHECK (
    length(alasan) >= 5 AND length(alasan) <= 500
  ),
  status      status_laporan DEFAULT 'baru',
  dibuat_pada timestamptz    DEFAULT now()
);

COMMENT ON TABLE question_reports IS 'Laporan mahasiswa tentang soal yang salah/bermasalah';

-- -------------------------
-- 8. question_stats — Statistik jawaban soal
-- -------------------------
CREATE TABLE question_stats (
  question_id    uuid    PRIMARY KEY REFERENCES questions (id) ON DELETE CASCADE,
  jumlah_dijawab integer DEFAULT 0 CONSTRAINT qs_dijawab_non_negatif CHECK (jumlah_dijawab >= 0),
  jumlah_benar   integer DEFAULT 0 CONSTRAINT qs_benar_non_negatif   CHECK (jumlah_benar   >= 0),

  -- Jumlah benar tidak boleh melebihi jumlah dijawab
  CONSTRAINT qs_benar_lte_dijawab CHECK (jumlah_benar <= jumlah_dijawab)
);

COMMENT ON TABLE question_stats IS 'Statistik akumulatif jawaban per soal';

-- -------------------------
-- 9. admins — Daftar admin
-- -------------------------
CREATE TABLE admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE
);

COMMENT ON TABLE admins IS 'User yang memiliki akses admin penuh';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Pengumuman: filter status + deadline (query paling sering)
CREATE INDEX idx_announcements_status_deadline
  ON announcements (status, deadline);

-- Materi: filter status + mata kuliah
CREATE INDEX idx_materials_status_course
  ON materials (status, course_id);

-- Soal: filter mata kuliah + topik
CREATE INDEX idx_questions_course_topik
  ON questions (course_id, topik);

-- Jadwal: filter hari
CREATE INDEX idx_schedules_hari
  ON class_schedules (hari);

-- =============================================================================
-- RPC FUNCTION — Increment question stats safely (upsert)
-- =============================================================================
CREATE OR REPLACE FUNCTION increment_question_stat(q_id uuid, is_correct boolean)
RETURNS void AS $$
BEGIN
  INSERT INTO question_stats (question_id, jumlah_dijawab, jumlah_benar)
  VALUES (
    q_id,
    1,
    CASE WHEN is_correct THEN 1 ELSE 0 END
  )
  ON CONFLICT (question_id) DO UPDATE SET
    jumlah_dijawab = question_stats.jumlah_dijawab + 1,
    jumlah_benar   = question_stats.jumlah_benar + CASE WHEN is_correct THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_question_stat IS 'Atomically increment answer stats for a question (upsert)';
