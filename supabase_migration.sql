-- ============================================================
-- Skrinsut Study — Supabase Database Migration
-- Jalankan SQL ini di Supabase SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABEL: courses (Mata Kuliah)
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kode TEXT NOT NULL UNIQUE,
  dosen TEXT
);

-- ============================================================
-- 2. TABEL: class_schedules (Jadwal Kuliah)
-- ============================================================
CREATE TABLE IF NOT EXISTS class_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  hari TEXT NOT NULL CHECK (hari IN ('senin','selasa','rabu','kamis','jumat','sabtu','minggu')),
  jam_mulai TEXT NOT NULL,
  jam_selesai TEXT NOT NULL,
  ruang TEXT,
  dosen TEXT
);

-- ============================================================
-- 3. TABEL: exams (Jadwal Ujian)
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  jenis TEXT NOT NULL CHECK (jenis IN ('uts','uas')),
  tanggal DATE NOT NULL,
  jam TEXT,
  ruang TEXT
);

-- ============================================================
-- 4. TABEL: announcements (Pengumuman / Tugas)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  deadline_hanya_tanggal BOOLEAN DEFAULT false,
  catatan TEXT,
  ditambahkan_oleh TEXT,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu','disetujui','ditolak')),
  disetujui_oleh TEXT,
  disetujui_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TABEL: materials (Materi Pembelajaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  topik TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('slide','pdf','video','catatan')),
  tautan TEXT,
  catatan TEXT,
  ditambahkan_oleh TEXT,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu','disetujui','ditolak')),
  disetujui_oleh TEXT,
  disetujui_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TABEL: questions (Bank Soal)
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  topik TEXT NOT NULL,
  pertanyaan TEXT NOT NULL,
  opsi_a TEXT NOT NULL,
  opsi_b TEXT NOT NULL,
  opsi_c TEXT NOT NULL,
  opsi_d TEXT NOT NULL,
  kunci TEXT NOT NULL CHECK (kunci IN ('a','b','c','d')),
  pembahasan TEXT,
  sumber TEXT,
  tahun INTEGER,
  diverifikasi_oleh TEXT
);

-- ============================================================
-- 7. TABEL: question_reports (Laporan Soal Bermasalah)
-- ============================================================
CREATE TABLE IF NOT EXISTS question_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  alasan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'baru' CHECK (status IN ('baru','ditangani')),
  dibuat_pada TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. TABEL: question_stats (Statistik Soal — Agregat Anonim)
-- ============================================================
CREATE TABLE IF NOT EXISTS question_stats (
  question_id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
  jumlah_dijawab INTEGER DEFAULT 0,
  jumlah_benar INTEGER DEFAULT 0
);

-- ============================================================
-- 9. FUNCTION: increment_question_stat (RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_question_stat(q_id UUID, is_correct BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO question_stats (question_id, jumlah_dijawab, jumlah_benar)
  VALUES (q_id, 1, CASE WHEN is_correct THEN 1 ELSE 0 END)
  ON CONFLICT (question_id)
  DO UPDATE SET
    jumlah_dijawab = question_stats.jumlah_dijawab + 1,
    jumlah_benar = question_stats.jumlah_benar + CASE WHEN is_correct THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anon key can SELECT)
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read class_schedules" ON class_schedules FOR SELECT USING (true);
CREATE POLICY "Public read exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read materials" ON materials FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read question_reports" ON question_reports FOR SELECT USING (true);
CREATE POLICY "Public read question_stats" ON question_stats FOR SELECT USING (true);

-- Public insert for user-contributed content
CREATE POLICY "Public insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert materials" ON materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert question_reports" ON question_reports FOR INSERT WITH CHECK (true);

-- Public update for admin actions (status changes)
CREATE POLICY "Public update announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Public update materials" ON materials FOR UPDATE USING (true);
CREATE POLICY "Public update question_reports" ON question_reports FOR UPDATE USING (true);

-- Public delete for announcements and materials
CREATE POLICY "Public delete announcements" ON announcements FOR DELETE USING (true);
CREATE POLICY "Public delete materials" ON materials FOR DELETE USING (true);

-- Public full access for admin-managed tables
CREATE POLICY "Public insert courses" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update courses" ON courses FOR UPDATE USING (true);
CREATE POLICY "Public delete courses" ON courses FOR DELETE USING (true);

CREATE POLICY "Public insert class_schedules" ON class_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update class_schedules" ON class_schedules FOR UPDATE USING (true);
CREATE POLICY "Public delete class_schedules" ON class_schedules FOR DELETE USING (true);

CREATE POLICY "Public insert exams" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update exams" ON exams FOR UPDATE USING (true);
CREATE POLICY "Public delete exams" ON exams FOR DELETE USING (true);

CREATE POLICY "Public insert questions" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update questions" ON questions FOR UPDATE USING (true);
CREATE POLICY "Public delete questions" ON questions FOR DELETE USING (true);

CREATE POLICY "Public delete question_reports" ON question_reports FOR DELETE USING (true);

CREATE POLICY "Public upsert question_stats" ON question_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update question_stats" ON question_stats FOR UPDATE USING (true);

-- ============================================================
-- Done! ✅ All tables, RLS policies, and RPC functions created.
-- ============================================================

