import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Calendar, Clock, Loader2, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Exam, Course, JenisUjian } from '@/lib/types'
import { formatTanggal } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'

export function ManageExams() {
  const { showToast } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [courseId, setCourseId] = useState('')
  const [jenis, setJenis] = useState<JenisUjian>('uts')
  const [tanggal, setTanggal] = useState('')
  const [jam, setJam] = useState('')
  const [ruang, setRuang] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [examRes, courseRes] = await Promise.all([
      supabase.from('exams').select('*, courses(*)').order('tanggal', { ascending: true }),
      supabase.from('courses').select('*').order('nama'),
    ])

    if (examRes.data) setExams(examRes.data)
    if (courseRes.data) {
      setCourses(courseRes.data)
      if (!courseId && courseRes.data.length > 0) {
        setCourseId(courseRes.data[0].id)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setJenis('uts')
    setTanggal('')
    setJam('')
    setRuang('')
    setIsModalOpen(true)
  }

  const openEditModal = (exam: Exam) => {
    setEditingId(exam.id)
    setCourseId(exam.course_id)
    setJenis(exam.jenis)
    setTanggal(exam.tanggal)
    setJam(exam.jam ? exam.jam.slice(0, 5) : '')
    setRuang(exam.ruang || '')
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !tanggal) {
      showToast('Pilih mata kuliah dan tanggal ujian.', 'error')
      return
    }

    setSaving(true)
    const payload = {
      course_id: courseId,
      jenis,
      tanggal,
      jam: jam ? `${jam}:00` : null,
      ruang: ruang.trim() || null,
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('exams').update(payload).eq('id', editingId)
        if (error) throw error
        showToast('Jadwal ujian berhasil diperbarui!', 'success')
      } else {
        const { error } = await supabase.from('exams').insert([payload])
        if (error) throw error
        showToast('Jadwal ujian berhasil ditambahkan!', 'success')
      }

      setIsModalOpen(false)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan jadwal ujian.'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ujian ini?')) return
    const { error } = await supabase.from('exams').delete().eq('id', id)
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error')
    } else {
      showToast('Jadwal ujian dihapus.', 'success')
      fetchData()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Kelola Jadwal Ujian (UTS / UAS)
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Jadwal ujian akan memicu hitung mundur otomatis di Beranda dan Kalender.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={courses.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Plus size={16} />
          <span>Tambah Jadwal Ujian</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : exams.length === 0 ? (
        <div
          className="p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Calendar size={30} className="opacity-40" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Belum ada jadwal ujian yang dimasukkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="p-4 rounded-xl border flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      exam.jenis === 'uts'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                    }`}
                  >
                    {exam.jenis.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                    {exam.courses?.nama || 'Mata Kuliah'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar size={13} />
                    <span>{formatTanggal(exam.tanggal)}</span>
                  </span>
                  {exam.jam && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{exam.jam.slice(0, 5)} WIB</span>
                    </span>
                  )}
                  {exam.ruang && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      <span>{exam.ruang}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(exam)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(exam.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md p-6 rounded-2xl border shadow-xl flex flex-col gap-4"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {editingId ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="dark:bg-neutral-900">
                      {c.nama} ({c.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Jenis Ujian <span className="text-red-500">*</span>
                </label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as JenisUjian)}
                  className="w-full h-11 px-3 rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="uts" className="dark:bg-neutral-900">UTS (Ujian Tengah Semester)</option>
                  <option value="uas" className="dark:bg-neutral-900">UAS (Ujian Akhir Semester)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Tanggal Ujian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Jam Mulai <span className="text-xs font-normal text-gray-500">(opsional)</span>
                  </label>
                  <input
                    type="time"
                    value={jam}
                    onChange={(e) => setJam(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Ruang Ujian <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={ruang}
                  onChange={(e) => setRuang(e.target.value)}
                  placeholder="Contoh: Gedung B Ruang 204"
                  maxLength={50}
                  className="w-full h-11 px-3 rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 rounded-lg font-medium border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 h-10 rounded-lg font-bold text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

