import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ClassSchedule, Course, Hari } from '@/lib/types'
import { formatJam } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'

const HARI_OPTIONS: { id: Hari; label: string }[] = [
  { id: 'senin', label: 'Senin' },
  { id: 'selasa', label: 'Selasa' },
  { id: 'rabu', label: 'Rabu' },
  { id: 'kamis', label: 'Kamis' },
  { id: 'jumat', label: 'Jumat' },
  { id: 'sabtu', label: 'Sabtu' },
]

export function ManageSchedules() {
  const { showToast } = useToast()
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [courseId, setCourseId] = useState('')
  const [hari, setHari] = useState<Hari>('senin')
  const [jamMulai, setJamMulai] = useState('08:00')
  const [jamSelesai, setJamSelesai] = useState('09:40')
  const [ruang, setRuang] = useState('')
  const [dosen, setDosen] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [schedRes, courseRes] = await Promise.all([
      supabase.from('class_schedules').select('*, courses(*)').order('jam_mulai'),
      supabase.from('courses').select('*').order('nama'),
    ])

    if (schedRes.data) setSchedules(schedRes.data)
    if (courseRes.data) setCourses(courseRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setCourseId(courses[0]?.id || '')
    setHari('senin')
    setJamMulai('08:00')
    setJamSelesai('09:40')
    setRuang('')
    setDosen('')
    setIsModalOpen(true)
  }

  const openEditModal = (s: ClassSchedule) => {
    setEditingId(s.id)
    setCourseId(s.course_id)
    setHari(s.hari)
    setJamMulai(s.jam_mulai.slice(0, 5))
    setJamSelesai(s.jam_selesai.slice(0, 5))
    setRuang(s.ruang || '')
    setDosen(s.dosen || '')
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !hari || !jamMulai || !jamSelesai) {
      showToast('Lengkapi data mata kuliah, hari, dan jam kuliah.', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        course_id: courseId,
        hari,
        jam_mulai: `${jamMulai}:00`,
        jam_selesai: `${jamSelesai}:00`,
        ruang: ruang.trim() || null,
        dosen: dosen.trim() || null,
      }

      if (editingId) {
        const { error } = await supabase.from('class_schedules').update(payload).eq('id', editingId)
        if (error) throw error
        showToast('Jadwal kuliah berhasil diperbarui!', 'success')
      } else {
        const { error } = await supabase.from('class_schedules').insert([payload])
        if (error) throw error
        showToast('Jadwal kuliah baru berhasil ditambahkan!', 'success')
      }

      setIsModalOpen(false)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return

    const { error } = await supabase.from('class_schedules').delete().eq('id', id)
    if (error) {
      showToast('Gagal menghapus jadwal: ' + error.message, 'error')
    } else {
      showToast('Jadwal berhasil dihapus.', 'success')
      fetchData()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Kelola Jadwal Kuliah
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Atur jadwal mingguan untuk seluruh mata kuliah kelas.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={courses.length === 0}
          className="liquid-button-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white cursor-pointer disabled:opacity-50"
        >
          <Plus size={16} />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {HARI_OPTIONS.map(({ id: dayId, label: dayLabel }) => {
            const daySchedules = schedules
              .filter((s) => s.hari === dayId)
              .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))

            return (
              <div key={dayId} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08] pb-1.5">
                  <h3 className="font-bold text-sm tracking-wide capitalize" style={{ color: 'var(--color-text)' }}>
                    {dayLabel}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full liquid-glass-pill text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5 font-semibold">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                {daySchedules.length === 0 ? (
                  <p className="text-xs py-2 text-slate-400 italic font-medium">Tidak ada jadwal pada hari ini.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {daySchedules.map((s) => (
                      <div
                        key={s.id}
                        className="liquid-glass-card p-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold liquid-glass-pill bg-blue-500/10 text-[var(--color-accent)] border border-blue-500/20">
                              {formatJam(s.jam_mulai, s.jam_selesai)}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {s.ruang || 'Ruang -'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm mt-1.5" style={{ color: 'var(--color-text)' }}>
                            {s.courses?.nama || 'Mata Kuliah'}
                          </h4>

                          {s.dosen && (
                            <p className="text-xs mt-0.5 font-medium text-slate-500 dark:text-slate-400">
                              Dosen: {s.dosen}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl border border-white/60 dark:border-white/10 liquid-glass shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08] pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="dark:bg-neutral-900">
                      {c.nama} ({c.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Hari <span className="text-red-500">*</span>
                </label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value as Hari)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  {HARI_OPTIONS.map((h) => (
                    <option key={h.id} value={h.id} className="dark:bg-neutral-900">
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Jam Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Jam Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Ruang Kuliah <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={ruang}
                  onChange={(e) => setRuang(e.target.value)}
                  placeholder="Contoh: Gedung A Lt. 3 Ruang 302"
                  maxLength={50}
                  className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Dosen Pengajar Khusus Sesi Ini <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={dosen}
                  onChange={(e) => setDosen(e.target.value)}
                  placeholder="Bila berbeda dengan dosen pengampu umum"
                  maxLength={100}
                  className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 rounded-xl font-medium border border-slate-200/60 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--color-text)' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="liquid-button-primary px-5 h-10 rounded-xl font-semibold text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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

