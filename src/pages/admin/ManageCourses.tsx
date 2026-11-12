import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, BookOpen, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'

export function ManageCourses() {
  const { showToast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [kode, setKode] = useState('')
  const [dosen, setDosen] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('courses').select('*').order('nama')
    if (error) {
      showToast('Gagal memuat mata kuliah: ' + error.message, 'error')
    } else if (data) {
      setCourses(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setNama('')
    setKode('')
    setDosen('')
    setIsModalOpen(true)
  }

  const openEditModal = (course: Course) => {
    setEditingId(course.id)
    setNama(course.nama)
    setKode(course.kode)
    setDosen(course.dosen || '')
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim() || !kode.trim()) {
      showToast('Nama dan kode mata kuliah wajib diisi.', 'error')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('courses')
          .update({
            nama: nama.trim(),
            kode: kode.trim().toUpperCase(),
            dosen: dosen.trim() || null,
          })
          .eq('id', editingId)

        if (error) throw error
        showToast('Mata kuliah berhasil diperbarui!', 'success')
      } else {
        // Insert
        const { error } = await supabase.from('courses').insert([
          {
            nama: nama.trim(),
            kode: kode.trim().toUpperCase(),
            dosen: dosen.trim() || null,
          },
        ])

        if (error) throw error
        showToast('Mata kuliah baru berhasil ditambahkan!', 'success')
      }

      setIsModalOpen(false)
      fetchCourses()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, namaCourse: string) => {
    if (!confirm(`Yakin ingin menghapus mata kuliah "${namaCourse}"? Jadwal dan materi terkait mungkin ikut terpengaruh.`)) {
      return
    }

    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) {
      showToast('Gagal menghapus mata kuliah: ' + error.message, 'error')
    } else {
      showToast(`Mata kuliah "${namaCourse}" berhasil dihapus.`, 'success')
      fetchCourses()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Kelola Mata Kuliah
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Mata kuliah yang terdaftar menjadi acuan untuk pengumuman, materi, dan jadwal kelas.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="liquid-button-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      ) : courses.length === 0 ? (
        <div className="liquid-glass-card p-8 text-center flex flex-col items-center justify-center gap-2.5">
          <BookOpen size={32} className="opacity-40 text-[var(--color-accent)]" />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Belum ada mata kuliah yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {courses.map((c) => (
            <div
              key={c.id}
              className="liquid-glass-card p-4.5 flex items-center justify-between gap-3"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider liquid-glass-pill bg-blue-500/10 text-[var(--color-accent)] border border-blue-500/20">
                  {c.kode}
                </span>
                <h3 className="font-bold text-base mt-1.5" style={{ color: 'var(--color-text)' }}>
                  {c.nama}
                </h3>
                {c.dosen && (
                  <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Dosen: {c.dosen}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Edit Mata Kuliah"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.nama)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Hapus Mata Kuliah"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl border border-white/60 dark:border-white/10 liquid-glass shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08] pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
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
                  Kode Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="Contoh: BD101"
                  required
                  maxLength={20}
                  className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Nama Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Basis Data"
                  required
                  maxLength={100}
                  className="w-full h-11 px-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Dosen Pengampu <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={dosen}
                  onChange={(e) => setDosen(e.target.value)}
                  placeholder="Contoh: Dr. Andi Wijaya, M.Kom"
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

