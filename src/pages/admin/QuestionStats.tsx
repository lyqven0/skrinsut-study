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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <RefreshCw size={13} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : stats.length === 0 ? (
        <div
          className="p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <BarChart3 size={32} className="opacity-40" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Belum ada aktivitas latihan yang tercatat.
          </p>
          <p className="text-xs">Statistik akan otomatis terakumulasi saat mahasiswa menyelesaikan latihan soal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.map((row) => {
            const answered = row.jumlah_dijawab
            const correct = row.jumlah_benar
            const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0

            let difficultyLabel = 'Sedang'
            let badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200'
            if (accuracy >= 70) {
              difficultyLabel = 'Mudah'
              badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200'
            } else if (accuracy < 40) {
              difficultyLabel = 'Tingkat Sulit'
              badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200'
            }

            return (
              <div
                key={row.question_id}
                className="p-4 rounded-xl border flex flex-col gap-3"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {row.questions?.courses?.nama || 'Mata Kuliah'} • {row.questions?.topik}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {difficultyLabel} ({accuracy}% Akurasi)
                    </span>
                  </div>

                  <div className="text-xs font-mono font-semibold text-gray-500">
                    {correct} / {answered} Benar ({answered} Kali Dijawab)
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium line-clamp-2" style={{ color: 'var(--color-text)' }}>
                  {row.questions?.pertanyaan || '(Soal tidak ditemukan)'}
                </p>

                {/* Accuracy progress visual bar */}
                <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${accuracy}%`,
                      backgroundColor: accuracy >= 70 ? '#10b981' : accuracy >= 40 ? '#f59e0b' : '#ef4444',
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
