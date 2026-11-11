import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Question, Course } from '@/lib/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { KaTeXRenderer } from '@/components/ui/KaTeXRenderer'

type SimulationState = 'setup' | 'running' | 'review'

export function Simulasi() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCourseId = searchParams.get('courseId') || ''

  // Setup options
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId)
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [questionCount, setQuestionCount] = useState<number>(20)
  const [loadingSetup, setLoadingSetup] = useState(true)

  // Simulation running state
  const [state, setState] = useState<SimulationState>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'd'>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({})
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  // Timer ref
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    async function loadCourses() {
      setLoadingSetup(true)
      const { data } = await supabase.from('courses').select('*').order('nama')
      if (data) {
        setCourses(data)
        if (!selectedCourseId && data.length > 0) {
          setSelectedCourseId(data[0].id)
        }
      }
      setLoadingSetup(false)
    }
    loadCourses()
  }, [])

  // Timer countdown hook
  useEffect(() => {
    if (state === 'running' && secondsRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleFinishSimulation()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state, secondsRemaining])

  const handleStartSimulation = async () => {
    let query = supabase.from('questions').select('*, courses(*)').eq('course_id', selectedCourseId)
    const { data } = await query

    if (!data || data.length === 0) {
      alert('Belum ada soal pada mata kuliah ini.')
      return
    }

    // Shuffle
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, questionCount)

    setQuestions(shuffled)
    setCurrentIndex(0)
    setUserAnswers({})
    setFlaggedQuestions({})
    setSecondsRemaining(durationMinutes * 60)
    setState('running')
  }

  const handleSelectOption = (key: 'a' | 'b' | 'c' | 'd') => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: key,
    }))
  }

  const toggleFlag = (index: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleFinishSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setState('review')
  }

  // Format timer HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Calculate score
  const calculateResult = () => {
    let correct = 0
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.kunci) {
        correct++
      }
    })
    const score = Math.round((correct / questions.length) * 100)
    return { correct, score, total: questions.length }
  }

  // -------------------------------------------------------------
  // 1. SETUP VIEW
  // -------------------------------------------------------------
  if (state === 'setup') {
    return (
      <div className="flex flex-col gap-5 max-w-xl mx-auto">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold mb-2 hover:underline text-gray-500"
          >
            <ChevronLeft size={16} />
            <span>Kembali</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Simulasi Ujian UTS / UAS
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Latihan ujian dengan batas waktu, navigasi nomor soal, tanpa kunci jawaban di tengah pengerjaan.
          </p>
        </div>

        {loadingSetup ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <div
            className="p-5 rounded-2xl border flex flex-col gap-5"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Mata Kuliah
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border bg-transparent font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Durasi Ujian
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`h-10 rounded-lg text-xs font-bold border transition-colors ${
                      durationMinutes === mins
                        ? 'bg-[var(--color-accent)] text-white border-transparent'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {mins} Menit
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Jumlah Soal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`h-10 rounded-lg text-xs font-bold border transition-colors ${
                      questionCount === cnt
                        ? 'bg-[var(--color-accent)] text-white border-transparent'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {cnt} Soal
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-gray-50 dark:bg-neutral-800/40 text-xs flex items-start gap-2.5 text-gray-600 dark:text-gray-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-blue-500" />
              <span>
                Simulasi ini dirancang dengan antarmuka tenang dan fokus. Nilai dan pembahasan lengkap baru akan muncul setelah kamu menyelesaikan ujian.
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartSimulation}
              className="w-full h-12 rounded-xl text-sm font-bold text-white shadow-sm transition-transform active:scale-98 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Timer size={18} />
              <span>Mulai Simulasi ({durationMinutes} Menit)</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // -------------------------------------------------------------
  // 2. RUNNING VIEW (Calm, Minimal, Timer)
  // -------------------------------------------------------------
  if (state === 'running') {
    const currentQ = questions[currentIndex]
    const currentAnswer = userAnswers[currentIndex]
    const isFlagged = flaggedQuestions[currentIndex]
    const answeredCount = Object.keys(userAnswers).length

    const options: { key: 'a' | 'b' | 'c' | 'd'; text: string }[] = [
      { key: 'a', text: currentQ.opsi_a },
      { key: 'b', text: currentQ.opsi_b },
      { key: 'c', text: currentQ.opsi_c },
      { key: 'd', text: currentQ.opsi_d },
    ]

    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto pb-12">
        {/* Top Floating Control Bar */}
        <div
          className="sticky top-14 z-20 -mx-4 px-4 py-3 border-b flex items-center justify-between backdrop-blur-md"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              Soal {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">
              ({answeredCount} terjawab)
            </span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`px-3 py-1 rounded-lg font-mono font-bold text-sm flex items-center gap-1.5 border ${
              secondsRemaining < 300
                ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse dark:bg-rose-950 dark:border-rose-800'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border-transparent'
            }`}
          >
            <Timer size={15} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Yakin ingin mengakhiri ujian dan mengumpulkan jawaban sekarang?')) {
                handleFinishSimulation()
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: '#10b981' }}
          >
            Kumpulkan Ujian
          </button>
        </div>

        {/* Question Numbers Grid (Swipeable / Clickable) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {questions.map((_, idx) => {
            const hasAnswer = userAnswers[idx] !== undefined
            const isFlag = flaggedQuestions[idx]
            const isCurrent = idx === currentIndex

            let btnStyle = 'border-gray-200 dark:border-neutral-800 text-gray-500'
            if (hasAnswer) {
              btnStyle = 'bg-blue-50 border-blue-400 text-[var(--color-accent)] dark:bg-blue-950/40'
            }
            if (isFlag) {
              btnStyle = 'bg-amber-50 border-amber-400 text-amber-600 dark:bg-amber-950/40'
            }
            if (isCurrent) {
              btnStyle = 'ring-2 ring-[var(--color-accent)] font-bold text-white bg-[var(--color-accent)]'
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-lg border text-xs font-semibold shrink-0 transition-all flex items-center justify-center relative cursor-pointer ${btnStyle}`}
              >
                <span>{idx + 1}</span>
                {isFlag && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                )}
              </button>
            )
          })}
        </div>

        {/* Question Box (Calm & Clean) */}
        <div
          className="p-5 rounded-2xl border flex flex-col gap-3 min-h-[120px]"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--color-accent)] uppercase">
              Topik: {currentQ.topik}
            </span>
            <button
              type="button"
              onClick={() => toggleFlag(currentIndex)}
              className={`text-xs font-semibold px-2 py-0.5 rounded cursor-pointer ${
                isFlagged
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isFlagged ? '★ Ditandai Ragu' : '☆ Tandai Ragu'}
            </button>
          </div>

          <KaTeXRenderer
            content={currentQ.pertanyaan}
            className="text-base font-semibold leading-relaxed"
          />
        </div>

        {/* 4 Large Clean Options */}
        <div className="flex flex-col gap-2.5">
          {options.map(({ key, text }) => {
            const isSelected = currentAnswer === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectOption(key)}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer min-h-[50px] ${
                  isSelected
                    ? 'border-[var(--color-accent)] bg-blue-50/60 dark:bg-blue-950/30'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                }`}
                style={{ backgroundColor: isSelected ? undefined : 'var(--color-card)' }}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                    isSelected
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'
                  }`}
                >
                  {key}
                </span>
                <span className="text-sm font-medium pt-0.5 leading-snug" style={{ color: 'var(--color-text)' }}>
                  {text}
                </span>
              </button>
            )
          })}
        </div>

        {/* Prev / Next Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 h-11 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 disabled:opacity-30"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <ChevronLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-4 h-11 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-30"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <span>Selanjutnya</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // 3. REVIEW VIEW (Score + Full Explanations)
  // -------------------------------------------------------------
  const { correct, score, total } = calculateResult()

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      {/* Header score */}
      <div
        className="p-6 rounded-2xl border text-center flex flex-col items-center gap-3"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md"
          style={{ backgroundColor: score >= 70 ? '#10b981' : '#f59e0b' }}
        >
          <Award size={32} />
        </div>

        <div>
          <h2 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>
            Hasil Simulasi Ujian
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Berikut ringkasan nilai dan pembahasan seluruh soal.
          </p>
        </div>

        <div className="flex items-center gap-6 mt-1">
          <div>
            <span className="text-xs text-gray-400 block">Nilai Akhir</span>
            <span className="text-3xl font-black" style={{ color: 'var(--color-accent)' }}>
              {score}%
            </span>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-neutral-800" />
          <div>
            <span className="text-xs text-gray-400 block">Benar / Total</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {correct} <span className="text-sm font-normal text-gray-400">/ {total}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setState('setup')}
          className="mt-2 px-5 h-10 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <RotateCcw size={14} />
          <span>Ulangi Simulasi Ujian</span>
        </button>
      </div>

      {/* Full Question Breakdown & Explanations */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
          Pembahasan Soal ({questions.length} Soal)
        </h3>

        {questions.map((q, idx) => {
          const userAns = userAnswers[idx]
          const isCorrect = userAns === q.kunci

          return (
            <div
              key={q.id}
              className="p-4 rounded-xl border flex flex-col gap-2.5"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                borderLeft: isCorrect ? '4px solid #10b981' : '4px solid #ef4444',
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                  Soal No. {idx + 1} ({q.topik})
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>{isCorrect ? 'Benar' : `Salah (Jawabanmu: ${userAns ? userAns.toUpperCase() : 'Kosong'})`}</span>
                </span>
              </div>

              <KaTeXRenderer content={q.pertanyaan} className="text-sm font-semibold" />

              <div className="text-xs text-gray-500 flex flex-col gap-1 pt-1 border-t dark:border-neutral-800">
                <span>Kunci Jawaban: <strong className="uppercase text-emerald-600">{q.kunci}</strong></span>
                {q.pembahasan && (
                  <div className="bg-gray-50 dark:bg-neutral-800/50 p-2.5 rounded-lg mt-1 text-gray-700 dark:text-gray-300">
                    <strong className="block mb-0.5">Pembahasan:</strong>
                    <KaTeXRenderer content={q.pembahasan} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
