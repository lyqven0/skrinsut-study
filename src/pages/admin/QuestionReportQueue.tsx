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
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : reports.length === 0 ? (
        <div className="liquid-glass-card p-8 text-center flex flex-col items-center justify-center gap-2.5">
          <CheckCircle size={32} className="text-emerald-500 opacity-60" />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Tidak ada laporan soal aktif!
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Seluruh soal di bank soal berstatus baik.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => {
            const isResolved = report.status === 'ditangani'
            const isActing = actionLoading === report.id

            return (
              <div
                key={report.id}
                className="liquid-glass-card p-4 sm:p-5 flex flex-col gap-3"
                style={{
                  borderLeft: isResolved ? undefined : '4px solid #f59e0b',
                }}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider liquid-glass-pill ${
                        isResolved
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isResolved ? 'Sudah Ditangani' : 'Laporan Baru'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTanggal(report.dibuat_pada)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleMarkResolved(report.id)}
                        disabled={isActing}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 shadow-md transition-all cursor-pointer"
                      >
                        {isActing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        <span>Tandai Selesai</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={isActing}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus Laporan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-3 rounded-xl border bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/20 text-xs backdrop-blur-sm">
                  <strong className="block text-amber-700 dark:text-amber-300 mb-0.5 font-bold">Alasan Mahasiswa:</strong>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium">{report.alasan}</p>
                </div>

                {/* Linked question snippet */}
                {report.questions && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1 pt-2 border-t border-slate-200/50 dark:border-white/5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Soal yang dilaporkan ({report.questions.courses?.nama || 'Mata Kuliah'}):
                    </span>
                    <p className="italic line-clamp-2">&ldquo;{report.questions.pertanyaan}&rdquo;</p>
                    <span className="text-[11px]">Kunci tercatat saat ini: <strong className="uppercase text-emerald-600 dark:text-emerald-400">{report.questions.kunci}</strong></span>
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
