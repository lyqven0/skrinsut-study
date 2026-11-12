import { useState, useEffect } from 'react'
import { Check, X, Trash2, Clock, CheckCircle, ExternalLink, Loader2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Material, Course, JenisMateri } from '@/lib/types'
import { formatTanggal } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'
import { MOCK_COURSES } from '@/lib/mockData'

export function MaterialQueue() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'menunggu' | 'disetujui'>('menunggu')
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Add Material Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState('')
  const [judul, setJudul] = useState('')
  const [topik, setTopik] = useState('')
  const [jenis, setJenis] = useState<JenisMateri>('slide')
  const [tautan, setTautan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [ditambahkanOleh, setDitambahkanOleh] = useState('Admin')
  const [savingNew, setSavingNew] = useState(false)

  useEffect(() => {
    async function loadCourses() {
      const { data } = await supabase.from('courses').select('*').order('nama')
      const list = (data && data.length > 0) ? data : MOCK_COURSES
      setCourses(list)
      if (list.length > 0 && !courseId) {
        setCourseId(list[0].id)
      }
    }
    loadCourses()
  }, [])

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !judul.trim() || !topik.trim()) {
      showToast('Mohon lengkapi mata kuliah, topik, dan judul materi!', 'error')
      return
    }

    setSavingNew(true)
    try {
      const { data, error } = await supabase.from('materials').insert([
        {
          course_id: courseId,
          judul: judul.trim(),
          topik: topik.trim(),
          jenis,
          tautan: tautan.trim() || null,
          catatan: catatan.trim() || null,
          ditambahkan_oleh: ditambahkanOleh.trim() || 'Admin',
          status: 'disetujui',
          disetujui_oleh: 'Admin',
          disetujui_pada: new Date().toISOString(),
        },
      ]).select('*, courses(*)')

      if (error) throw error

      showToast('Materi baru berhasil ditambahkan dan langsung dipublikasikan!', 'success')
      setIsAddModalOpen(false)
      setJudul('')
      setTopik('')
      setTautan('')
      setCatatan('')
      setActiveTab('disetujui')
      if (data && data.length > 0) {
        setMaterials((prev) => [data[0], ...prev])
      } else {
        fetchMaterials()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan materi'
      showToast(msg, 'error')
    } finally {
      setSavingNew(false)
    }
  }

  const fetchMaterials = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('materials')
      .select('*, courses(*)')
      .eq('status', activeTab)
      .order('dibuat_pada', { ascending: false })

    if (error) {
      showToast('Gagal memuat materi: ' + error.message, 'error')
    } else if (data) {
      setMaterials(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMaterials()
  }, [activeTab])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('materials')
      .update({
        status: 'disetujui',
        disetujui_oleh: user?.id || null,
        disetujui_pada: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      showToast('Gagal menyetujui: ' + error.message, 'error')
    } else {
      showToast('Materi berhasil disetujui & tayang ke kelas!', 'success')
      fetchMaterials()
    }
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    if (!confirm('Yakin ingin menolak usulan materi ini?')) return

    setActionLoading(id)
    const { error } = await supabase
      .from('materials')
      .update({ status: 'ditolak' })
      .eq('id', id)

    if (error) {
      showToast('Gagal menolak: ' + error.message, 'error')
    } else {
      showToast('Usulan materi ditolak.', 'info')
      fetchMaterials()
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus materi ini secara permanen?')) return

    setActionLoading(id)
    const { data: deletedRows, error } = await supabase.from('materials').delete().eq('id', id).select()

    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error')
    } else if (!deletedRows || deletedRows.length === 0) {
      showToast('Gagal menghapus: Supabase RLS memblokir hapus. Tambahkan policy DELETE di Supabase!', 'error')
    } else {
      showToast('Materi berhasil dihapus.', 'success')
      fetchMaterials()
    }
    setActionLoading(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Antrean Usulan Materi
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Tinjau usulan slide, catatan, dan video pembelajaran sebelum dibagikan ke kelas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="liquid-button-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white cursor-pointer shadow-md"
        >
          <Plus size={16} />
          <span>Tambah Materi Langsung</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-white/[0.08] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('menunggu')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'menunggu'
              ? 'liquid-glass-pill bg-blue-500/15 text-[var(--color-accent)] border border-blue-500/30 shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <Clock size={16} />
          <span>Menunggu Persetujuan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disetujui')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'disetujui'
              ? 'liquid-glass-pill bg-blue-500/15 text-[var(--color-accent)] border border-blue-500/30 shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <CheckCircle size={16} />
          <span>Sudah Disetujui</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : materials.length === 0 ? (
        <div className="liquid-glass-card p-8 text-center flex flex-col items-center justify-center gap-2.5">
          <CheckCircle size={32} className="opacity-60 text-emerald-500" />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {activeTab === 'menunggu'
              ? 'Tidak ada usulan materi yang menunggu persetujuan.'
              : 'Belum ada materi yang disetujui.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {materials.map((item) => {
            const isActing = actionLoading === item.id
            return (
              <div
                key={item.id}
                className="liquid-glass-card p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider liquid-glass-pill bg-blue-500/10 text-[var(--color-accent)] border border-blue-500/20">
                      {item.courses?.nama || 'Mata Kuliah'} • Topik: {item.topik}
                    </span>
                    <h3 className="font-bold text-base mt-1.5" style={{ color: 'var(--color-text)' }}>
                      {item.judul}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase liquid-glass-pill bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/10">
                    {item.jenis}
                  </span>
                </div>

                {item.catatan && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line p-3 rounded-xl bg-white/40 dark:bg-black/30 border border-white/50 dark:border-white/5 backdrop-blur-sm">
                    {item.catatan}
                  </p>
                )}

                {item.tautan && (
                  <a
                    href={item.tautan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] font-semibold hover:underline w-fit px-2.5 py-1 rounded-lg liquid-glass-pill border border-blue-500/20"
                  >
                    <ExternalLink size={14} />
                    <span>Periksa Tautan: {item.tautan}</span>
                  </a>
                )}

                <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <span>Dibuat: {formatTanggal(item.dibuat_pada)}</span>
                    {item.ditambahkan_oleh && (
                      <span>Diusulkan: {item.ditambahkan_oleh}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTab === 'menunggu' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          disabled={isActing}
                          className="px-3.5 py-1.5 rounded-xl font-semibold border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <X size={14} />
                          <span>Tolak</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          disabled={isActing}
                          className="px-4 py-1.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {isActing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          <span>Setujui</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={isActing}
                        className="px-3 py-1.5 rounded-xl font-semibold border border-slate-300 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Tambah Materi Langsung oleh Admin */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl border border-white/60 dark:border-white/10 liquid-glass shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08] pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Tambah Materi Baru
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Materi yang ditambahkan admin akan langsung terpublikasi ke kelas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Mata Kuliah <span className="text-rose-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">
                      {c.kode} — {c.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Topik Materi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    placeholder="Contoh: Normalisasi, Binary Tree"
                    required
                    className="w-full h-10 px-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                    style={{ color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Jenis Materi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as JenisMateri)}
                    className="w-full h-10 px-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <option value="slide" className="bg-white dark:bg-slate-900">Slide / Presentasi</option>
                    <option value="pdf" className="bg-white dark:bg-slate-900">Dokumen PDF</option>
                    <option value="video" className="bg-white dark:bg-slate-900">Video Pembelajaran</option>
                    <option value="catatan" className="bg-white dark:bg-slate-900">Catatan Ringkasan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Judul Materi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Slide Pertemuan 5: Normalisasi Bentuk BCNF"
                  required
                  className="w-full h-10 px-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Tautan / Link URL {jenis !== 'catatan' && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="url"
                  value={tautan}
                  onChange={(e) => setTautan(e.target.value)}
                  placeholder="https://drive.google.com/... atau https://youtube.com/..."
                  required={jenis !== 'catatan'}
                  className="w-full h-10 px-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Catatan / Ringkasan Isi (Opsional)
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Ringkasan poin materi atau rumus penting (bisa format KaTeX misal $O(n)$)"
                  className="w-full p-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Ditambahkan Oleh
                </label>
                <input
                  type="text"
                  value={ditambahkanOleh}
                  onChange={(e) => setDitambahkanOleh(e.target.value)}
                  placeholder="Admin Kelas / PJ Matkul"
                  className="w-full h-10 px-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingNew}
                  className="liquid-button-primary px-5 py-2 rounded-xl font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingNew && <Loader2 size={14} className="animate-spin" />}
                  <span>Simpan & Publikasikan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

