import { useState, useEffect } from 'react'
import { Check, X, Trash2, Clock, CheckCircle, Loader2, CheckSquare, Square } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement } from '@/lib/types'
import { formatTanggal, formatDeadline } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'

export function AnnouncementQueue() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'menunggu' | 'disetujui'>('menunggu')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const fetchAnnouncements = async () => {
    setLoading(true)
    setSelectedIds([])
    const { data, error } = await supabase
      .from('announcements')
      .select('*, courses(*)')
      .eq('status', activeTab)
      .order('deadline', { ascending: true })

    if (error) {
      showToast('Gagal memuat antrean: ' + error.message, 'error')
    } else if (data) {
      setAnnouncements(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [activeTab])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('announcements')
      .update({
        status: 'disetujui',
        disetujui_oleh: user?.id || null,
        disetujui_pada: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      showToast('Gagal menyetujui: ' + error.message, 'error')
    } else {
      showToast('Usulan tugas berhasil disetujui & tayang ke publik!', 'success')
      fetchAnnouncements()
    }
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    if (!confirm('Yakin ingin menolak usulan tugas ini?')) return

    setActionLoading(id)
    const { error } = await supabase
      .from('announcements')
      .update({ status: 'ditolak' })
      .eq('id', id)

    if (error) {
      showToast('Gagal menolak: ' + error.message, 'error')
    } else {
      showToast('Usulan tugas ditolak.', 'info')
      fetchAnnouncements()
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus permanen pengumuman ini?')) return

    setActionLoading(id)
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error')
    } else {
      showToast('Pengumuman berhasil dihapus.', 'success')
      fetchAnnouncements()
    }
    setActionLoading(null)
  }

  // Bulk Delete Feature (Phase 4)
  const isExpired = (deadline: string) => new Date(deadline).getTime() < Date.now()

  const handleSelectExpired = () => {
    const expiredIds = announcements.filter((a) => isExpired(a.deadline)).map((a) => a.id)
    setSelectedIds(expiredIds)
  }

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Yakin ingin menghapus massal ${selectedIds.length} pengumuman yang dipilih?`)) return

    setBulkDeleting(true)
    const { error } = await supabase.from('announcements').delete().in('id', selectedIds)

    if (error) {
      showToast('Gagal menghapus massal: ' + error.message, 'error')
    } else {
      showToast(`Berhasil menghapus ${selectedIds.length} pengumuman lama!`, 'success')
      fetchAnnouncements()
    }
    setBulkDeleting(false)
  }

  const expiredCount = announcements.filter((a) => isExpired(a.deadline)).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Antrean Pengumuman Tugas
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Verifikasi usulan tugas dari mahasiswa atau bersihkan tugas lama yang telah lewat.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('menunggu')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'menunggu'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <Clock size={16} />
          <span>Menunggu Persetujuan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disetujui')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'disetujui'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <CheckCircle size={16} />
          <span>Sudah Disetujui ({announcements.length})</span>
        </button>
      </div>

      {/* Bulk Delete Toolbar (Phase 4) */}
      {activeTab === 'disetujui' && announcements.length > 0 && (
        <div
          className="p-3 rounded-xl border flex items-center justify-between gap-3 flex-wrap text-xs"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-500">
              {expiredCount} pengumuman sudah lewat deadline.
            </span>
            <button
              type="button"
              onClick={handleSelectExpired}
              className="text-[var(--color-accent)] font-bold hover:underline"
            >
              Pilih Semua yang Lewat Deadline
            </button>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="px-3 py-1.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {bulkDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Hapus Massal ({selectedIds.length} Terpilih)</span>
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : announcements.length === 0 ? (
        <div
          className="p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <CheckCircle size={28} className="opacity-40 text-emerald-500" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {activeTab === 'menunggu'
              ? 'Tidak ada usulan tugas menunggu persetujuan.'
              : 'Belum ada pengumuman yang disetujui.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((item) => {
            const isActing = actionLoading === item.id
            const deadlineDate = new Date(item.deadline)
            const pastDeadline = isExpired(item.deadline)
            const isChecked = selectedIds.includes(item.id)

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                  isChecked ? 'ring-2 ring-red-400 bg-red-50/20 dark:bg-red-950/20' : ''
                }`}
                style={{
                  backgroundColor: isChecked ? undefined : 'var(--color-card)',
                  borderColor: isChecked ? undefined : 'var(--color-border)',
                }}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-start gap-3">
                    {activeTab === 'disetujui' && (
                      <button
                        type="button"
                        onClick={() => toggleSelectId(item.id)}
                        className="mt-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare size={18} className="text-red-500" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          {item.courses?.nama || 'Mata Kuliah'}
                        </span>
                        {pastDeadline && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
                            LEWAT DEADLINE
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base mt-1" style={{ color: 'var(--color-text)' }}>
                        {item.judul}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    {formatDeadline(item.deadline, item.deadline_hanya_tanggal)}
                  </span>
                </div>

                {item.catatan && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line bg-gray-50 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800">
                    {item.catatan}
                  </p>
                )}

                <div
                  className="pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span>
                      Deadline: <strong>{formatTanggal(deadlineDate)}</strong>
                    </span>
                    {item.ditambahkan_oleh && (
                      <span>
                        Diusulkan: <strong>{item.ditambahkan_oleh}</strong>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {activeTab === 'menunggu' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          disabled={isActing}
                          className="px-3 py-1.5 rounded-lg font-semibold border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <X size={14} />
                          <span>Tolak</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          disabled={isActing}
                          className="px-3.5 py-1.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
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
                        className="px-3 py-1.5 rounded-lg font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
