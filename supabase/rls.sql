-- =============================================================================
-- Skrinsut Study — Row Level Security Policies
-- =============================================================================
-- This file enables RLS on every table and defines:
--   • Anonymous (public) read access for approved content
--   • Anonymous insert for submissions (forced to 'menunggu')
--   • Full admin access for authenticated admin users
--   • Function execution grants
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE courses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins           ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER: reusable admin check
-- =============================================================================
-- Used in WITH CHECK and USING clauses below.
-- auth.uid() IN (SELECT user_id FROM admins)

-- =============================================================================
-- ANONYMOUS READ POLICIES (public / anon)
-- =============================================================================

-- courses — semua orang bisa lihat daftar mata kuliah
CREATE POLICY "anon_select_courses"
  ON courses FOR SELECT
  TO anon, authenticated
  USING (true);

-- class_schedules — semua orang bisa lihat jadwal
CREATE POLICY "anon_select_schedules"
  ON class_schedules FOR SELECT
  TO anon, authenticated
  USING (true);

-- exams — semua orang bisa lihat jadwal ujian
CREATE POLICY "anon_select_exams"
  ON exams FOR SELECT
  TO anon, authenticated
  USING (true);

-- questions — semua orang bisa lihat bank soal
CREATE POLICY "anon_select_questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- announcements — hanya yang disetujui DAN deadline belum lewat
CREATE POLICY "anon_select_announcements"
  ON announcements FOR SELECT
  TO anon, authenticated
  USING (
    status = 'disetujui'
    AND (
      CASE
        WHEN deadline_hanya_tanggal THEN
          -- Jika hanya tanggal, dianggap berlaku sampai akhir hari WIB (23:59)
          (deadline AT TIME ZONE 'Asia/Jakarta')::date + interval '23 hours 59 minutes'
            >= now() AT TIME ZONE 'Asia/Jakarta'
        ELSE
          deadline >= now()
      END
    )
  );

-- materials — hanya yang disetujui
CREATE POLICY "anon_select_materials"
  ON materials FOR SELECT
  TO anon, authenticated
  USING (status = 'disetujui');

-- =============================================================================
-- ANONYMOUS INSERT POLICIES (submissions)
-- =============================================================================

-- announcements — siapa saja boleh submit, tapi harus berstatus menunggu
CREATE POLICY "anon_insert_announcements"
  ON announcements FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'menunggu'
    AND disetujui_oleh IS NULL
    AND disetujui_pada IS NULL
  );

-- materials — siapa saja boleh submit, tapi harus berstatus menunggu
CREATE POLICY "anon_insert_materials"
  ON materials FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'menunggu'
    AND disetujui_oleh IS NULL
    AND disetujui_pada IS NULL
  );

-- question_reports — siapa saja boleh melaporkan soal
CREATE POLICY "anon_insert_question_reports"
  ON question_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =============================================================================
-- ADMIN POLICIES — full access on ALL tables
-- =============================================================================

-- Macro: admin can do everything
-- We create one ALL policy per table for admin users.

CREATE POLICY "admin_all_courses"
  ON courses FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_schedules"
  ON class_schedules FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_exams"
  ON exams FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_announcements"
  ON announcements FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_materials"
  ON materials FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_questions"
  ON questions FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_question_reports"
  ON question_reports FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_question_stats"
  ON question_stats FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "admin_all_admins"
  ON admins FOR ALL
  TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

-- =============================================================================
-- FUNCTION GRANTS
-- =============================================================================
-- question_stats diakses via RPC saja oleh publik (tidak ada SELECT policy anon).
-- Grant execute pada fungsi increment_question_stat ke anon dan authenticated.

GRANT EXECUTE ON FUNCTION increment_question_stat(uuid, boolean) TO anon;
GRANT EXECUTE ON FUNCTION increment_question_stat(uuid, boolean) TO authenticated;
