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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Plus size={16} />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {HARI_OPTIONS.map(({ id: dayId, label: dayLabel }) => {
            const daySchedules = schedules
              .filter((s) => s.hari === dayId)
              .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))

            return (
              <div key={dayId} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    {dayLabel}
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {daySchedules.length} Sesi
                  </span>
                </div>

                {daySchedules.length === 0 ? (
                  <p className="text-xs py-2 text-gray-400 italic">Tidak ada jadwal pada hari ini.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {daySchedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                        style={{
                          backgroundColor: 'var(--color-card)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-accent)',
                              }}
                            >
                              {formatJam(s.jam_mulai, s.jam_selesai)}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                              {s.ruang || 'Ruang -'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm mt-1" style={{ color: 'var(--color-text)' }}>
                            {s.courses?.nama || 'Mata Kuliah'}
                          </h4>

                          {s.dosen && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                              Dosen: {s.dosen}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md p-6 rounded-2xl border shadow-xl flex flex-col gap-4"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {editingId ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
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
                  className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
                  Hari <span className="text-red-500">*</span>
                </label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value as Hari)}
                  required
                  className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Jam Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Jam Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Ruang Kuliah <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={ruang}
                  onChange={(e) => setRuang(e.target.value)}
                  placeholder="Contoh: Gedung A Lt. 3 Ruang 302"
                  maxLength={50}
                  className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Dosen Pengajar Khusus Sesi Ini <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={dosen}
                  onChange={(e) => setDosen(e.target.value)}
                  placeholder="Bila berbeda dengan dosen pengampu umum"
                  maxLength={100}
                  className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 rounded-lg font-medium border hover:bg-gray-100 dark:hover:bg-neutral-800"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 h-10 rounded-lg font-semibold text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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

