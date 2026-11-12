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
import { MOCK_COURSES, MOCK_QUESTIONS } from '@/lib/mockData'
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
      const coursesList = (data && data.length > 0) ? data : MOCK_COURSES
      setCourses(coursesList)
      if (!selectedCourseId && coursesList.length > 0) {
        setSelectedCourseId(coursesList[0].id)
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

    let questionPool = (data && data.length > 0) ? data : []
    if (questionPool.length === 0) {
      const filteredMock = MOCK_QUESTIONS.filter((q) => q.course_id === selectedCourseId)
      questionPool = filteredMock.length > 0 ? filteredMock : MOCK_QUESTIONS
    }

    if (questionPool.length === 0) {
      alert('Belum ada soal pada mata kuliah ini.')
      return
    }

    // Shuffle
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5).slice(0, questionCount)

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
              <label className="block text-xs font-bold mb-2 text-slate-800 dark:text-slate-200">
                Jumlah Soal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      questionCount === cnt
                        ? 'bg-blue-600 text-white border-transparent shadow-md'
                        : 'border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10'
                    }`}
                  >
                    {cnt} Soal
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15 text-xs flex items-start gap-2.5 text-blue-900 dark:text-blue-200 backdrop-blur-md">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-blue-500" />
              <span>
                Simulasi ini dirancang dengan antarmuka tenang dan fokus. Nilai dan pembahasan lengkap baru akan muncul setelah kamu menyelesaikan ujian.
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartSimulation}
              className="liquid-button-primary w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer mt-2"
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
        <div className="sticky top-16 z-20 -mx-2 px-3 py-2.5 rounded-2xl liquid-glass-dock shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Soal {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              ({answeredCount} terjawab)
            </span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`px-3 py-1 rounded-xl font-mono font-bold text-sm flex items-center gap-1.5 border backdrop-blur-md ${
              secondsRemaining < 300
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-white/60 dark:bg-white/10 text-slate-800 dark:text-slate-200 border-white/60 dark:border-white/10 shadow-xs'
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
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Kumpulkan Ujian
          </button>
        </div>

        {/* Question Numbers Grid (Swipeable / Clickable) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none py-1">
          {questions.map((_, idx) => {
            const hasAnswer = userAnswers[idx] !== undefined
            const isFlag = flaggedQuestions[idx]
            const isCurrent = idx === currentIndex

            let btnStyle = 'border-slate-300/60 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/[0.04]'
            if (hasAnswer) {
              btnStyle = 'bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300 shadow-xs'
            }
            if (isFlag) {
              btnStyle = 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-xs'
            }
            if (isCurrent) {
              btnStyle = 'ring-2 ring-blue-500 font-bold text-white bg-blue-600 border-blue-600 shadow-md'
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl border text-xs font-semibold shrink-0 transition-all flex items-center justify-center relative cursor-pointer backdrop-blur-md ${btnStyle}`}
              >
                <span>{idx + 1}</span>
                {isFlag && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Question Box (Calm & Clean Liquid Glass) */}
        <div className="liquid-glass-card p-6 rounded-2xl flex flex-col gap-3.5 min-h-[120px] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--color-accent)] uppercase px-2 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20">
              Topik: {currentQ.topik}
            </span>
            <button
              type="button"
              onClick={() => toggleFlag(currentIndex)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isFlagged
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-300/40 dark:border-white/10'
              }`}
            >
              {isFlagged ? '★ Ditandai Ragu' : '☆ Tandai Ragu'}
            </button>
          </div>

          <KaTeXRenderer
            content={currentQ.pertanyaan}
            className="text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-100"
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
                className={`liquid-glass-card p-4 rounded-xl text-left flex items-start gap-3.5 transition-all cursor-pointer min-h-[52px] ${
                  isSelected
                    ? 'border-blue-500/60 bg-blue-500/15 dark:bg-blue-500/20 shadow-[0_4px_20px_rgba(79,110,247,0.15)] ring-1 ring-blue-500/40'
                    : 'border-slate-300/60 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(79,110,247,0.5)]'
                      : 'bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {key}
                </span>
                <span className="text-sm font-medium pt-0.5 leading-snug text-slate-900 dark:text-slate-100">
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
            className="px-4 h-11 rounded-xl text-xs font-bold border border-slate-300/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 backdrop-blur-md transition-all flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="liquid-button-primary px-4 h-11 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
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
      <div className="liquid-glass-card p-6 sm:p-8 text-center flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl relative overflow-hidden"
          style={{
            background: score >= 70
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: score >= 70
              ? '0 10px 25px -4px rgba(16, 185, 129, 0.4)'
              : '0 10px 25px -4px rgba(245, 158, 11, 0.4)',
          }}
        >
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
          <Award size={32} className="relative z-10 drop-shadow-md" />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Hasil Simulasi Ujian
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Berikut ringkasan nilai dan pembahasan seluruh soal.
          </p>
        </div>

        <div className="flex items-center gap-6 mt-1">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Nilai Akhir</span>
            <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
              {score}%
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Benar / Total</span>
            <span className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>
              {correct} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ {total}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setState('setup')}
          className="liquid-button-primary mt-2 px-5 h-10 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Ulangi Simulasi Ujian</span>
        </button>
      </div>

      {/* Full Question Breakdown & Explanations */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm tracking-wide" style={{ color: 'var(--color-text)' }}>
          Pembahasan Soal ({questions.length} Soal)
        </h3>

        {questions.map((q, idx) => {
          const userAns = userAnswers[idx]
          const isCorrect = userAns === q.kunci

          return (
            <div
              key={q.id}
              className="liquid-glass-card p-4 flex flex-col gap-2.5 relative overflow-hidden"
              style={{
                borderLeft: isCorrect ? '4px solid #10b981' : '4px solid #ef4444',
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                  Soal No. {idx + 1} ({q.topik})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 liquid-glass-pill ${
                    isCorrect
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>{isCorrect ? 'Benar' : `Salah (Jawabanmu: ${userAns ? userAns.toUpperCase() : 'Kosong'})`}</span>
                </span>
              </div>

              <KaTeXRenderer content={q.pertanyaan} className="text-sm font-semibold" />

              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1.5 pt-2 border-t border-slate-200/50 dark:border-white/10">
                <span>Kunci Jawaban: <strong className="uppercase text-emerald-600 dark:text-emerald-400 font-extrabold">{q.kunci}</strong></span>
                {q.pembahasan && (
                  <div className="p-3 rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-black/30 border border-white/50 dark:border-white/5 backdrop-blur-sm">
                    <strong className="block mb-1 text-[var(--color-accent)]">Pembahasan:</strong>
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
