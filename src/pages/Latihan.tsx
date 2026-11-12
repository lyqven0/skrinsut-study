import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Award,
  ChevronLeft,
  Sparkles,
  Check,
  Bookmark,
  FileEdit,
  Save,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Question, Course } from '@/lib/types'
import { MOCK_COURSES, MOCK_QUESTIONS } from '@/lib/mockData'
import { ReportModal } from '@/components/questions/ReportModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { KaTeXRenderer } from '@/components/ui/KaTeXRenderer'
import {
  toggleQuestionBookmark,
  isQuestionBookmarked,
  saveQuestionNote,
  getQuestionNote,
  getPersonalData,
} from '@/lib/storage'
import { useToast } from '@/components/ui/Toast'

type QuizState = 'setup' | 'playing' | 'finished'

export function Latihan() {
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialCourseId = searchParams.get('courseId') || ''

  // Setup state
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId)
  const [availableTopics, setAvailableTopics] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState<number | 'semua'>(10)
  const [onlyBookmarked, setOnlyBookmarked] = useState(false)
  const [loadingSetup, setLoadingSetup] = useState(true)

  // Quiz active state
  const [quizState, setQuizState] = useState<QuizState>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [score, setScore] = useState(0)

  // Bookmark & Note local states for current question
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [isEditingNote, setIsEditingNote] = useState(false)

  // Reporting modal
  const [reportQuestionId, setReportQuestionId] = useState<string | null>(null)

  // 1. Load initial courses & topics
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

  // 2. Load topics when course changes
  useEffect(() => {
    if (!selectedCourseId) return
    async function loadTopics() {
      const { data } = await supabase
        .from('questions')
        .select('topik')
        .eq('course_id', selectedCourseId)

      let topics: string[] = []
      if (data && data.length > 0) {
        topics = Array.from(new Set(data.map((q) => q.topik).filter(Boolean)))
      } else {
        const mockMatch = MOCK_QUESTIONS.filter((q) => q.course_id === selectedCourseId)
        topics = Array.from(new Set(mockMatch.map((q) => q.topik).filter(Boolean)))
        if (topics.length === 0) {
          topics = Array.from(new Set(MOCK_QUESTIONS.map((q) => q.topik).filter(Boolean)))
        }
      }
      setAvailableTopics(topics)
      setSelectedTopics(topics)
    }
    loadTopics()
  }, [selectedCourseId])

  // Sync bookmark & note whenever currentIndex or questions change
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const qId = questions[currentIndex].id
      setIsBookmarked(isQuestionBookmarked(qId))
      setNoteText(getQuestionNote(qId))
      setIsEditingNote(false)
    }
  }, [currentIndex, questions])

  // Start Quiz
  const handleStartQuiz = async (retryWrong = false) => {
    let pool: Question[] = []

    if (retryWrong) {
      pool = [...wrongQuestions]
    } else {
      let query = supabase.from('questions').select('*, courses(*)').eq('course_id', selectedCourseId)
      if (selectedTopics.length > 0) {
        query = query.in('topik', selectedTopics)
      }

      const { data } = await query
      let questionsList = (data && data.length > 0) ? data : []
      if (questionsList.length === 0) {
        // Fallback to mock questions
        const filteredMock = MOCK_QUESTIONS.filter((q) => {
          const matchCourse = q.course_id === selectedCourseId
          const matchTopic = selectedTopics.length === 0 || selectedTopics.includes(q.topik)
          return matchCourse && matchTopic
        })
        questionsList = filteredMock.length > 0 ? filteredMock : MOCK_QUESTIONS
      }

      if (questionsList.length === 0) {
        alert('Tidak ada soal yang tersedia untuk kriteria ini.')
        return
      }

      pool = [...questionsList]

      // Filter only bookmarked if requested
      if (onlyBookmarked) {
        const personal = getPersonalData()
        pool = pool.filter((q) => personal.bookmarks.includes(q.id))
        if (pool.length === 0) {
          alert('Belum ada soal yang kamu tandai (bookmark) pada mata kuliah ini.')
          return
        }
      }

      // Shuffle pool
      pool = pool.sort(() => Math.random() - 0.5)

      if (typeof questionCount === 'number') {
        pool = pool.slice(0, questionCount)
      }
    }

    setQuestions(pool)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setWrongQuestions([])
    setScore(0)
    setQuizState('playing')
  }

  // Handle Answer Selection & Immediate Feedback
  const handleSelectOption = (key: 'a' | 'b' | 'c' | 'd') => {
    if (isAnswerSubmitted) return
    setSelectedAnswer(key)
    setIsAnswerSubmitted(true)

    const currentQ = questions[currentIndex]
    const isCorrect = key === currentQ.kunci

    if (isCorrect) {
      setScore((prev) => prev + 1)
    } else {
      setWrongQuestions((prev) => [...prev, currentQ])
    }

    // Call RPC to record aggregate anonymous stat in background
    try {
      supabase.rpc('increment_question_stat', {
        q_id: currentQ.id,
        is_correct: isCorrect,
      }).then(() => {})
    } catch {}
  }

  // Next question or finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      // Save practice history to localStorage
      try {
        const history = JSON.parse(localStorage.getItem('skrinsut_practice_history') || '[]')
        history.unshift({
          date: new Date().toISOString(),
          courseId: selectedCourseId,
          total: questions.length,
          score: score + (selectedAnswer === questions[currentIndex]?.kunci ? 0 : 0),
        })
        localStorage.setItem('skrinsut_practice_history', JSON.stringify(history.slice(0, 30)))
      } catch {}

      setQuizState('finished')
    }
  }

  // Toggle bookmark for current question
  const handleToggleBookmark = () => {
    if (!questions[currentIndex]) return
    const newState = toggleQuestionBookmark(questions[currentIndex].id)
    setIsBookmarked(newState)
    showToast(newState ? 'Soal ditandai (Bookmark disimpan)' : 'Tanda bookmark dihapus', 'info')
  }

  // Save personal note
  const handleSaveNote = () => {
    if (!questions[currentIndex]) return
    saveQuestionNote(questions[currentIndex].id, noteText)
    setIsEditingNote(false)
    showToast('Catatan pribadi disimpan di browser.', 'success')
  }

  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) return
      setSelectedTopics(selectedTopics.filter((t) => t !== topic))
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  // -------------------------------------------------------------
  // 1. SETUP VIEW
  // -------------------------------------------------------------
  if (quizState === 'setup') {
    const selectedCourseObj = courses.find((c) => c.id === selectedCourseId)

    return (
      <div className="flex flex-col gap-5 max-w-xl mx-auto">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold mb-2 hover:underline"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronLeft size={16} />
            <span>Kembali</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Mode Latihan Soal
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Latihan satu soal per layar dengan umpan balik, bookmark, dan catatan pribadi.
          </p>
        </div>

        {loadingSetup ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <div className="liquid-glass-card p-6 rounded-2xl flex flex-col gap-5">
            {/* Course select */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-800 dark:text-slate-200">
                Mata Kuliah
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
                    {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Bookmark Only */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <Bookmark size={16} className={onlyBookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Latihan Khusus Soal yang Saya Tandai (Bookmark)
                </span>
              </div>
              <input
                type="checkbox"
                checked={onlyBookmarked}
                onChange={(e) => setOnlyBookmarked(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </div>

            {/* Topics */}
            {!onlyBookmarked && availableTopics.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pilih Topik Soal
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTopics(
                        selectedTopics.length === availableTopics.length ? [availableTopics[0]] : [...availableTopics]
                      )
                    }
                    className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
                  >
                    {selectedTopics.length === availableTopics.length ? 'Pilih Satu Saja' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topik) => {
                    const active = selectedTopics.includes(topik)
                    return (
                      <button
                        key={topik}
                        type="button"
                        onClick={() => toggleTopic(topik)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300 shadow-xs'
                            : 'border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10'
                        }`}
                      >
                        {active && <Check size={13} className="stroke-[2.5]" />}
                        <span>{topik}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Question count */}
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-800 dark:text-slate-200">
                Jumlah Soal
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([5, 10, 20, 'semua'] as const).map((cnt) => (
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
                    {cnt === 'semua' ? 'Semua' : `${cnt} Soal`}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={() => handleStartQuiz(false)}
              className="liquid-button-primary w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Sparkles size={18} />
              <span>Mulai Latihan {selectedCourseObj ? `(${selectedCourseObj.kode})` : ''}</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // -------------------------------------------------------------
  // 2. PLAYING VIEW (One Question Per Screen + Bookmark + Notes)
  // -------------------------------------------------------------
  if (quizState === 'playing') {
    const currentQ = questions[currentIndex]
    if (!currentQ) return null

    const options: { key: 'a' | 'b' | 'c' | 'd'; text: string }[] = [
      { key: 'a', text: currentQ.opsi_a },
      { key: 'b', text: currentQ.opsi_b },
      { key: 'c', text: currentQ.opsi_c },
      { key: 'd', text: currentQ.opsi_d },
    ]

    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100)

    return (
      <div className="flex flex-col gap-4 max-w-xl mx-auto pb-12">
        {/* Top bar: progress + bookmark + report */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              if (confirm('Keluar dari sesi latihan? Kemajuan saat ini tidak akan disimpan.')) {
                setQuizState('setup')
              }
            }}
            className="font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            ← Keluar
          </button>

          <span className="font-bold font-mono" style={{ color: 'var(--color-accent)' }}>
            Soal {currentIndex + 1} dari {questions.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950 dark:border-amber-800'
                  : 'border-gray-200 dark:border-neutral-800 text-gray-400'
              }`}
              title={isBookmarked ? 'Hapus dari bookmark' : 'Tandai soal ini'}
            >
              <Bookmark size={15} className={isBookmarked ? 'fill-amber-500' : ''} />
            </button>

            <button
              type="button"
              onClick={() => setReportQuestionId(currentQ.id)}
              className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <AlertTriangle size={13} />
              <span>Laporkan</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-accent)' }}
          />
        </div>

        {/* Question Card */}
        <div className="liquid-glass-card p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 backdrop-blur-md">
              {currentQ.topik}
            </span>
            {currentQ.sumber && (
              <span className="text-[11px] text-slate-400">
                Sumber: {currentQ.sumber} {currentQ.tahun ? `(${currentQ.tahun})` : ''}
              </span>
            )}
          </div>

          <KaTeXRenderer
            content={currentQ.pertanyaan}
            className="text-base sm:text-lg font-semibold leading-relaxed text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* 4 Large Tap-Friendly Options */}
        <div className="flex flex-col gap-2.5">
          {options.map(({ key, text }) => {
            let optionStyles = 'border-slate-300/60 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
            let badgeStyles = 'bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300'

            if (isAnswerSubmitted) {
              if (key === currentQ.kunci) {
                optionStyles = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
                badgeStyles = 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
              } else if (selectedAnswer === key) {
                optionStyles = 'bg-rose-500/15 border-rose-500/40 text-rose-950 dark:text-rose-200 shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
                badgeStyles = 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]'
              } else {
                optionStyles = 'opacity-40 border-slate-200 dark:border-white/[0.05]'
              }
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectOption(key)}
                disabled={isAnswerSubmitted}
                className={`liquid-glass-card p-4 rounded-xl text-left flex items-start gap-3.5 transition-all min-h-[54px] cursor-pointer disabled:cursor-default ${optionStyles}`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${badgeStyles}`}>
                  {key}
                </span>
                <span className="text-sm font-medium pt-0.5 leading-snug">
                  {text}
                </span>
              </button>
            )
          })}
        </div>

        {/* Immediate Feedback & Pembahasan & Catatan Pribadi */}
        {isAnswerSubmitted && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div
              className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col gap-2.5 ${
                selectedAnswer === currentQ.kunci
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.1)]'
                  : 'bg-rose-500/10 border-rose-500/30 shadow-[0_4px_20px_rgba(244,63,94,0.1)]'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedAnswer === currentQ.kunci ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                    <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                      Jawaban Benar!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-rose-600 dark:text-rose-400 stroke-[2.2]" />
                    <span className="font-bold text-sm text-rose-800 dark:text-rose-300">
                      Jawaban Kurang Tepat (Kunci: {currentQ.kunci.toUpperCase()})
                    </span>
                  </>
                )}
              </div>

              {currentQ.pembahasan && (
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-2.5 border-t border-slate-300/40 dark:border-white/[0.08]">
                  <strong className="block mb-1 text-slate-900 dark:text-slate-100 font-semibold">Pembahasan:</strong>
                  <KaTeXRenderer content={currentQ.pembahasan} />
                </div>
              )}
            </div>

            {/* Personal Note per question */}
            <div className="liquid-glass-card p-4 rounded-xl flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <FileEdit size={14} className="text-blue-500" />
                  <span>Catatan Pribadi Soal Ini:</span>
                </span>
                {!isEditingNote && (
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(true)}
                    className="text-[var(--color-accent)] hover:underline font-semibold cursor-pointer"
                  >
                    {noteText ? 'Ubah Catatan' : '+ Tambah Catatan'}
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="flex flex-col gap-2 mt-1">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Tulis catatan rumus, jebakan soal, atau kata kunci pengingat..."
                    rows={2}
                    className="w-full p-3 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md text-xs text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNote(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300/60 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      className="liquid-button-primary px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Save size={12} />
                      <span>Simpan Catatan</span>
                    </button>
                  </div>
                </div>
              ) : noteText ? (
                <p className="text-slate-700 dark:text-slate-300 italic bg-white/40 dark:bg-white/[0.04] p-2.5 rounded-xl border border-white/60 dark:border-white/[0.06]">
                  &ldquo;{noteText}&rdquo;
                </p>
              ) : (
                <span className="text-slate-400 italic">Belum ada catatan pribadi untuk soal ini.</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="liquid-button-primary w-full h-12 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentIndex + 1 === questions.length ? 'Lihat Hasil Akhir' : 'Lanjut ke Soal Berikutnya'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Report modal */}
        {reportQuestionId && (
          <ReportModal
            questionId={reportQuestionId}
            isOpen={true}
            onClose={() => setReportQuestionId(null)}
          />
        )}
      </div>
    )
  }

  // -------------------------------------------------------------
  // 3. FINISHED VIEW
  // -------------------------------------------------------------
  const percentage = Math.round((score / questions.length) * 100)

  return (
    <div className="flex flex-col items-center justify-center py-6 max-w-md mx-auto text-center gap-5">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl relative overflow-hidden"
        style={{
          background: percentage >= 70
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #f59e0b, #d97706)',
          boxShadow: percentage >= 70
            ? '0 12px 30px -4px rgba(16, 185, 129, 0.4)'
            : '0 12px 30px -4px rgba(245, 158, 11, 0.4)',
        }}
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
        <Award size={40} className="relative z-10 drop-shadow-md" />
      </div>

      <div>
        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          Latihan Selesai!
        </h2>
        <p className="text-xs sm:text-sm mt-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {percentage >= 80
            ? 'Luar biasa! Pemahamanmu sangat matang.'
            : percentage >= 60
            ? 'Bagus! Pelajari kembali pembahasan untuk topik yang salah.'
            : 'Tetap semangat! Coba ulangi soal yang salah agar semakin paham.'}
        </p>
      </div>

      {/* Score card */}
      <div className="w-full p-6 rounded-2xl liquid-glass-card flex items-center justify-around">
        <div>
          <span className="text-xs font-semibold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Skor Akhir
          </span>
          <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
            {percentage}%
          </span>
        </div>
        <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />
        <div>
          <span className="text-xs font-semibold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Benar / Total
          </span>
          <span className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>
            {score} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ {questions.length}</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-2.5">
        {wrongQuestions.length > 0 && (
          <button
            type="button"
            onClick={() => handleStartQuiz(true)}
            className="w-full h-12 rounded-xl text-sm font-bold border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <RotateCcw size={16} />
            <span>Ulangi {wrongQuestions.length} Soal yang Salah</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setQuizState('setup')}
          className="liquid-button-primary w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles size={16} />
          <span>Pilih Latihan Lain</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/belajar')}
          className="text-xs font-semibold text-slate-500 hover:text-[var(--color-accent)] dark:text-slate-400 py-1 transition-colors"
        >
          Kembali ke Pusat Belajar
        </button>
      </div>
    </div>
  )
}
