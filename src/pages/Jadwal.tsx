import { useState, useEffect } from 'react'
import { Download, GraduationCap, Calendar as CalendarIcon, Clock, MapPin, CalendarPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ClassSchedule, Hari, Exam } from '@/lib/types'
import { getHariIni, formatTanggal } from '@/lib/utils'
import { DaySchedule } from '@/components/schedule/DaySchedule'
import { Skeleton } from '@/components/ui/Skeleton'
import { MOCK_SCHEDULES, MOCK_EXAMS } from '@/lib/mockData'

const HARI_LIST: { id: Hari; label: string }[] = [
  { id: 'senin', label: 'Senin' },
  { id: 'selasa', label: 'Selasa' },
  { id: 'rabu', label: 'Rabu' },
  { id: 'kamis', label: 'Kamis' },
  { id: 'jumat', label: 'Jumat' },
  { id: 'sabtu', label: 'Sabtu' },
]

export function Jadwal() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  // Current day in Indonesian
  const today = getHariIni() as Hari
  const [selectedDay, setSelectedDay] = useState<Hari>(
    HARI_LIST.some((h) => h.id === today) ? today : 'senin'
  )

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [schedRes, examRes] = await Promise.all([
        supabase.from('class_schedules').select('*, courses(*)').order('jam_mulai'),
        supabase.from('exams').select('*, courses(*)').order('tanggal', { ascending: true }),
      ])

      if (schedRes.data && schedRes.data.length > 0) {
        setSchedules(schedRes.data)
      } else {
        setSchedules(MOCK_SCHEDULES)
      }

      if (examRes.data && examRes.data.length > 0) {
        setExams(examRes.data)
      } else {
        setExams(MOCK_EXAMS)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // Export all class schedules as a single .ics file
  const handleExportAllIcs = () => {
    const dayMap: Record<string, string> = {
      senin: 'MO',
      selasa: 'TU',
      rabu: 'WE',
      kamis: 'TH',
      jumat: 'FR',
      sabtu: 'SA',
      minggu: 'SU',
    }

    const now = new Date()
    const dStr = `${now.getUTCFullYear()}0101`

    const events = schedules.map((s) => {
      const byDay = dayMap[s.hari] || 'MO'
      const startTimeClean = s.jam_mulai.replace(/:/g, '').slice(0, 4) + '00'
      const endTimeClean = s.jam_selesai.replace(/:/g, '').slice(0, 4) + '00'
      const title = `Kuliah: ${s.courses?.nama || 'Mata Kuliah'}`
      const desc = s.dosen ? `Dosen: ${s.dosen}` : ''
      const loc = s.ruang || ''

      return [
        'BEGIN:VEVENT',
        `UID:class-all-${s.id}@skrinsutstudy`,
        `DTSTART;TZID=Asia/Jakarta:${dStr}T${startTimeClean}`,
        `DTEND;TZID=Asia/Jakarta:${dStr}T${endTimeClean}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
        `SUMMARY:${title}`,
        `LOCATION:${loc}`,
        `DESCRIPTION:${desc}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n')
    })

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skrinsut Study//ID',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', 'jadwal_kuliah_lengkap.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export single exam as .ics
  const handleExportExamIcs = (exam: Exam) => {
    const title = `Ujian ${exam.jenis.toUpperCase()}: ${exam.courses?.nama || 'Mata Kuliah'}`
    const loc = exam.ruang || ''
    const dateClean = exam.tanggal.replace(/-/g, '')
    const timeClean = exam.jam ? exam.jam.replace(/:/g, '').slice(0, 4) + '00' : '080000'

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skrinsut Study//ID',
      'BEGIN:VEVENT',
      `UID:exam-${exam.id}@skrinsutstudy`,
      `DTSTART;TZID=Asia/Jakarta:${dateClean}T${timeClean}`,
      `DTEND;TZID=Asia/Jakarta:${dateClean}T${timeClean}`,
      `SUMMARY:${title}`,
      `LOCATION:${loc}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Countdown helper
  const getCountdown = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Hari ini'
    if (diff === 1) return 'Besok'
    if (diff < 0) return 'Selesai'
    return `${diff} hari lagi`
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Jadwal Kuliah & Ujian
          </h1>
          <p className="text-xs sm:text-sm mt-0.5 text-slate-500 dark:text-slate-400">
            Jadwal bersama kelas satu semester ini.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportAllIcs}
          disabled={schedules.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/50 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12] border border-white/60 dark:border-white/[0.08] backdrop-blur-md shadow-xs transition-all active:scale-95 disabled:opacity-40 text-slate-800 dark:text-slate-200 cursor-pointer"
          title="Unduh seluruh jadwal kuliah ke kalender"
        >
          <Download size={14} className="stroke-[2.2]" />
          <span>Ekspor Jadwal (.ics)</span>
        </button>
      </div>

      {/* Jadwal Ujian (UTS / UAS) Section */}
      {exams.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-blue-500 stroke-[2.2]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Jadwal Ujian (UTS / UAS)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="liquid-glass-card p-4 rounded-xl flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        exam.jenis === 'uts'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                          : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {exam.jenis.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {exam.courses?.nama || 'Mata Kuliah'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} className="text-blue-500" />
                      <span>{formatTanggal(exam.tanggal)}</span>
                    </span>
                    {exam.jam && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{exam.jam.slice(0, 5)} WIB</span>
                      </span>
                    )}
                    {exam.ruang && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{exam.ruang}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-xs">
                    {getCountdown(exam.tanggal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleExportExamIcs(exam)}
                    className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CalendarPlus size={12} />
                    <span>+ Kalender</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile: Horizontal Day Tabs (Senin - Sabtu) */}
      <div className="md:hidden sticky top-16 z-20 -mx-2 px-2 py-2 liquid-glass-dock rounded-2xl overflow-x-auto scrollbar-none flex gap-1 shadow-sm">
        {HARI_LIST.map(({ id, label }) => {
          const isSelected = selectedDay === id
          const isTodayDay = today === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedDay(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10'
              }`}
            >
              {label} {isTodayDay && '•'}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Mobile view: single selected day */}
          <div className="md:hidden">
            <DaySchedule
              hari={selectedDay}
              label={HARI_LIST.find((h) => h.id === selectedDay)?.label || selectedDay}
              schedules={schedules.filter((s) => s.hari === selectedDay)}
              isToday={selectedDay === today}
            />
          </div>

          {/* Desktop view: weekly grid (Senin - Sabtu) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HARI_LIST.map(({ id, label }) => (
              <div
                key={id}
                className={`liquid-glass-card p-4 rounded-2xl flex flex-col gap-3 transition-all overflow-hidden min-w-0 ${
                  id === today ? 'border-blue-500/50 shadow-[0_0_20px_rgba(79,110,247,0.2)]' : ''
                }`}
              >
                <DaySchedule
                  hari={id}
                  label={label}
                  schedules={schedules.filter((s) => s.hari === id)}
                  isToday={id === today}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
