import { useState, useEffect } from 'react'
import { Check, X, Trash2, Clock, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Material } from '@/lib/types'
import { formatTanggal } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'

export function MaterialQueue() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'menunggu' | 'disetujui'>('menunggu')
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Antrean Usulan Materi
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Tinjau usulan slide, catatan, dan video pembelajaran sebelum dibagikan ke kelas.
        </p>
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
    </div>
  )
}

