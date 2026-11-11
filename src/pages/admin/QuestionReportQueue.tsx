import { useState, useEffect } from 'react'
import { Check, Trash2, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { QuestionReport } from '@/lib/types'
import { formatTanggal } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'

interface ReportWithQuestion extends QuestionReport {
  questions?: {
    pertanyaan: string
    topik: string
    kunci: string
    pembahasan: string | null
    courses?: {
      nama: string
      kode: string
    }
  }
}

export function QuestionReportQueue() {
  const { showToast } = useToast()
  const [reports, setReports] = useState<ReportWithQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchReports = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('question_reports')
      .select('*, questions(*, courses(*))')
      .order('dibuat_pada', { ascending: false })

    if (error) {
      showToast('Gagal memuat laporan: ' + error.message, 'error')
    } else if (data) {
      setReports(data as ReportWithQuestion[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleMarkResolved = async (id: string) => {
    setActionLoading(id)
    const { error } = await supabase
      .from('question_reports')
      .update({ status: 'ditangani' })
      .eq('id', id)

    if (error) {
      showToast('Gagal mengubah status: ' + error.message, 'error')
    } else {
      showToast('Laporan ditandai sudah ditangani.', 'success')
      fetchReports()
    }
    setActionLoading(null)
  }

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Hapus catatan laporan ini?')) return
    setActionLoading(id)
    const { error } = await supabase.from('question_reports').delete().eq('id', id)
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error')
    } else {
      showToast('Laporan berhasil dihapus.', 'success')
      fetchReports()
    }
    setActionLoading(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Antrean Laporan Soal
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Kritik, saran, dan laporan kesalahan kunci jawaban soal yang diajukan mahasiswa.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : reports.length === 0 ? (
        <div
          className="p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <CheckCircle size={30} className="text-emerald-500 opacity-60" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Tidak ada laporan soal aktif!
          </p>
          <p className="text-xs">Seluruh soal di bank soal berstatus baik.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => {
            const isResolved = report.status === 'ditangani'
            const isActing = actionLoading === report.id

            return (
              <div
                key={report.id}
                className="p-4 rounded-xl border flex flex-col gap-3"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  borderLeft: isResolved ? undefined : '4px solid #f59e0b',
                }}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {isResolved ? 'Sudah Ditangani' : 'Laporan Baru'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTanggal(report.dibuat_pada)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleMarkResolved(report.id)}
                        disabled={isActing}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                      >
                        {isActing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        <span>Tandai Selesai</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={isActing}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Hapus Laporan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-3 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 text-xs">
                  <strong className="block text-amber-900 dark:text-amber-300 mb-0.5">Alasan Mahasiswa:</strong>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{report.alasan}</p>
                </div>

                {/* Linked question snippet */}
                {report.questions && (
                  <div className="text-xs text-gray-500 flex flex-col gap-1 pt-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Soal yang dilaporkan ({report.questions.courses?.nama || 'Mata Kuliah'}):
                    </span>
                    <p className="italic line-clamp-2">&ldquo;{report.questions.pertanyaan}&rdquo;</p>
                    <span className="text-[11px]">Kunci tercatat saat ini: <strong>{report.questions.kunci?.toUpperCase()}</strong></span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
