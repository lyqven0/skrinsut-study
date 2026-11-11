export type StatusUsulan = 'menunggu' | 'disetujui' | 'ditolak'
export type StatusLaporan = 'baru' | 'ditangani'
export type Hari = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu'
export type JenisUjian = 'uts' | 'uas'
export type JenisMateri = 'slide' | 'pdf' | 'video' | 'catatan'

export interface Course {
  id: string
  nama: string
  kode: string
  dosen: string | null
}

export interface ClassSchedule {
  id: string
  course_id: string
  hari: Hari
  jam_mulai: string
  jam_selesai: string
  ruang: string | null
  dosen: string | null
  courses?: Course
}

export interface Exam {
  id: string
  course_id: string
  jenis: JenisUjian
  tanggal: string
  jam: string | null
  ruang: string | null
  courses?: Course
}

export interface Announcement {
  id: string
  course_id: string
  judul: string
  deadline: string
  deadline_hanya_tanggal: boolean
  catatan: string | null
  ditambahkan_oleh: string | null
  status: StatusUsulan
  disetujui_oleh: string | null
  disetujui_pada: string | null
  dibuat_pada: string
  courses?: Course
}

export interface Material {
  id: string
  course_id: string
  judul: string
  topik: string
  jenis: JenisMateri
  tautan: string | null
  catatan: string | null
  ditambahkan_oleh: string | null
  status: StatusUsulan
  disetujui_oleh: string | null
  disetujui_pada: string | null
  dibuat_pada: string
  courses?: Course
}

export interface Question {
  id: string
  course_id: string
  topik: string
  pertanyaan: string
  opsi_a: string
  opsi_b: string
  opsi_c: string
  opsi_d: string
  kunci: 'a' | 'b' | 'c' | 'd'
  pembahasan: string | null
  sumber: string | null
  tahun: number | null
  diverifikasi_oleh: string | null
  courses?: Course
}

export interface QuestionReport {
  id: string
  question_id: string
  alasan: string
  status: StatusLaporan
  dibuat_pada: string
}

export interface QuestionStat {
  question_id: string
  jumlah_dijawab: number
  jumlah_benar: number
}
