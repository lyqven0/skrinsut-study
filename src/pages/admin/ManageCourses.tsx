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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Plus size={16} />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : courses.length === 0 ? (
        <div
          className="p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <BookOpen size={28} className="opacity-40" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Belum ada mata kuliah yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {courses.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {c.kode}
                </span>
                <h3 className="font-bold text-base mt-1" style={{ color: 'var(--color-text)' }}>
                  {c.nama}
                </h3>
                {c.dosen && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Dosen: {c.dosen}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  title="Edit Mata Kuliah"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.nama)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                {editingId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
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
                  Kode Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="Contoh: BD101"
                  required
                  maxLength={20}
                  className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Nama Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Basis Data"
                  required
                  maxLength={100}
                  className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Dosen Pengampu <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={dosen}
                  onChange={(e) => setDosen(e.target.value)}
                  placeholder="Contoh: Dr. Andi Wijaya, M.Kom"
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

