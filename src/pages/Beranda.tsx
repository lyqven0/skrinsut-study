import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, AlertTriangle, ArrowRight, Calendar, Sparkles, GraduationCap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement, ClassSchedule, Exam } from '@/lib/types'
import { getSapaan, formatTanggal, getHariIni, formatJam } from '@/lib/utils'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function Beranda() {
  const [loading, setLoading] = useState(true)
  const [todaySchedules, setTodaySchedules] = useState<ClassSchedule[]>([])
  const [urgentAnnouncements, setUrgentAnnouncements] = useState<Announcement[]>([])
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([])
  const [dueIn48HoursCount, setDueIn48HoursCount] = useState(0)

  const todayHari = getHariIni()
  const sapaan = getSapaan()
  const tanggalHariIni = formatTanggal(new Date())

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const nowIso = new Date().toISOString()
      const todayDateStr = new Date().toISOString().split('T')[0]
      const in48HoursIso = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

      // 1. Fetch today's schedules
      const { data: schedules } = await supabase
        .from('class_schedules')
        .select('*, courses(*)')
        .eq('hari', todayHari)
        .order('jam_mulai')

      if (schedules) setTodaySchedules(schedules)

      // 2. Fetch nearest approved announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*, courses(*)')
        .eq('status', 'disetujui')
        .gte('deadline', nowIso)
        .order('deadline', { ascending: true })
        .limit(3)

      if (announcements) {
        setUrgentAnnouncements(announcements)
        const count48 = announcements.filter((a) => a.deadline <= in48HoursIso).length
        setDueIn48HoursCount(count48)
      }

      // 3. Fetch upcoming exams
      const { data: examsData } = await supabase
        .from('exams')
        .select('*, courses(*)')
        .gte('tanggal', todayDateStr)
        .order('tanggal', { ascending: true })
        .limit(2)

      if (examsData) setUpcomingExams(examsData)

      setLoading(false)
    }

    loadData()
  }, [todayHari])

  // Helper for exam countdown calculation
  const getExamCountdown = (examDateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(examDateStr)
    target.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Besok'
    return `${diffDays} hari lagi`
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header: Greeting & Date */}
      <section className="flex flex-col gap-1.5 pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
          {sapaan}! 👋
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {tanggalHariIni}
        </p>
      </section>

      {/* 2. Passive Warning Banner (if any task due in 48h) */}
      {dueIn48HoursCount > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-xl shadow-[0_4px_20px_rgba(245,158,11,0.12)] flex items-center justify-between gap-3 animate-in fade-in transition-all">
          <div className="flex items-center gap-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
              <AlertTriangle size={17} className="stroke-[2.5]" />
            </div>
            <span>{dueIn48HoursCount} tugas jatuh tempo dalam 48 jam!</span>
          </div>
          <Link
            to="/pengumuman"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-500/30 backdrop-blur-md transition-all active:scale-95 shrink-0"
          >
            Lihat Tugas
          </Link>
        </div>
      )}

      {/* 3. Hari Ini (Class Schedule) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-500 stroke-[2.2]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Kuliah Hari Ini ({todayHari.toUpperCase()})
            </h2>
          </div>
          <Link
            to="/jadwal"
            className="text-xs font-semibold flex items-center gap-1 text-[var(--color-accent)] hover:underline"
          >
            <span>Semua Jadwal</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : todaySchedules.length === 0 ? (
          <div className="p-6 rounded-2xl liquid-glass-card flex flex-col items-center justify-center text-center gap-2">
            <span className="text-3xl">🎉</span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Tidak ada kuliah hari ini!
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Aman dulu, manfaatkan untuk istirahat atau mengulang materi.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todaySchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="liquid-glass-card p-4 rounded-xl flex items-center justify-between gap-3 group"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {schedule.courses?.nama || 'Mata Kuliah'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium bg-slate-200/50 dark:bg-white/[0.05] px-2 py-0.5 rounded-md border border-slate-300/40 dark:border-white/[0.06]">
                      {schedule.ruang || 'Ruang belum ditentukan'}
                    </span>
                    {schedule.dosen && <span>• {schedule.dosen}</span>}
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono shrink-0 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 backdrop-blur-md shadow-xs">
                  {formatJam(schedule.jam_mulai, schedule.jam_selesai)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. 3 Tugas Terdekat */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-500 stroke-[2.2]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Tugas Terdekat
            </h2>
          </div>
          <Link
            to="/pengumuman"
            className="text-xs font-semibold flex items-center gap-1 text-[var(--color-accent)] hover:underline"
          >
            <span>Lihat Semua</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : urgentAnnouncements.length === 0 ? (
          <div className="p-7 rounded-2xl liquid-glass-card flex flex-col items-center justify-center text-center gap-2">
            <span className="text-3xl">😌</span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Belum ada tugas aktif!
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Semua tugas sudah selesai atau belum ada pengumuman baru.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {urgentAnnouncements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Hitung Mundur Ujian Terdekat */}
      {upcomingExams.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-blue-500 stroke-[2.2]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hitung Mundur Ujian
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingExams.map((exam) => {
              const countdownStr = getExamCountdown(exam.tanggal)
              return (
                <div
                  key={exam.id}
                  className="liquid-glass-card p-4 rounded-xl flex items-center justify-between gap-3 group"
                >
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        exam.jenis === 'uts'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                          : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {exam.jenis.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-sm mt-1.5 text-slate-900 dark:text-slate-100">
                      {exam.courses?.nama || 'Mata Kuliah'}
                    </h3>
                    <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                      {formatTanggal(exam.tanggal)} {exam.ruang ? `• ${exam.ruang}` : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 backdrop-blur-md block shadow-xs">
                      {countdownStr}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 6. Banner Pintasan Lanjut Latihan Soal */}
      <section className="liquid-glass-card p-5 rounded-2xl flex items-center justify-between gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-blue-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(79,110,247,0.35)] bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/20">
            <Sparkles size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              Lanjut Latihan Soal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Uji pemahaman topik dan pelajari pembahasan jawaban secara interaktif.
            </p>
          </div>
        </div>
        <Link
          to="/latihan"
          className="liquid-button-primary px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 relative z-10"
        >
          Mulai
        </Link>
      </section>
    </div>
  )
}
