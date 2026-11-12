import { useState, useEffect } from 'react'
import { BarChart3, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'

interface StatRow {
  question_id: string
  jumlah_dijawab: number
  jumlah_benar: number
  questions?: {
    pertanyaan: string
    topik: string
    kunci: string
    courses?: {
      nama: string
      kode: string
    }
  }
}

export function QuestionStats() {
  const [stats, setStats] = useState<StatRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('question_stats')
      .select('*, questions(*, courses(*))')
      .order('jumlah_dijawab', { ascending: false })

    if (data) setStats(data as StatRow[])
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Statistik Kesulitan Soal (Admin Only)
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Data agregat anonim persentase ketepatan jawaban mahasiswa pada setiap soal.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold liquid-glass-pill hover:text-[var(--color-accent)] transition-colors cursor-pointer border border-white/60 dark:border-white/10"
          style={{ color: 'var(--color-text)' }}
        >
          <RefreshCw size={13} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : stats.length === 0 ? (
        <div className="liquid-glass-card p-8 text-center flex flex-col items-center justify-center gap-2.5">
          <BarChart3 size={32} className="opacity-40 text-[var(--color-accent)]" />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Belum ada aktivitas latihan yang tercatat.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Statistik akan otomatis terakumulasi saat mahasiswa menyelesaikan latihan soal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.map((row) => {
            const answered = row.jumlah_dijawab
            const correct = row.jumlah_benar
            const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0

            let difficultyLabel = 'Sedang'
            let badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
            if (accuracy >= 70) {
              difficultyLabel = 'Mudah'
              badgeStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
            } else if (accuracy < 40) {
              difficultyLabel = 'Tingkat Sulit'
              badgeStyle = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
            }

            return (
              <div
                key={row.question_id}
                className="liquid-glass-card p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider liquid-glass-pill bg-blue-500/10 text-[var(--color-accent)] border border-blue-500/20">
                      {row.questions?.courses?.nama || 'Mata Kuliah'} • {row.questions?.topik}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full liquid-glass-pill border ${badgeStyle}`}>
                      {difficultyLabel} ({accuracy}% Akurasi)
                    </span>
                  </div>

                  <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {correct} / {answered} Benar ({answered} Kali Dijawab)
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium line-clamp-2" style={{ color: 'var(--color-text)' }}>
                  {row.questions?.pertanyaan || '(Soal tidak ditemukan)'}
                </p>

                {/* Accuracy progress visual bar */}
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200/50 dark:bg-white/10 backdrop-blur-sm">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${accuracy}%`,
                      background: accuracy >= 70
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : accuracy >= 40
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #ef4444, #dc2626)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
