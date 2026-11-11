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
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
          {sapaan}! 👋
        </h1>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {tanggalHariIni}
        </p>
      </section>

      {/* 2. Passive Warning Banner (if any task due in 48h) */}
      {dueIn48HoursCount > 0 && (
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in"
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            borderColor: 'rgba(234, 179, 8, 0.3)',
            color: 'var(--color-text)',
          }}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{dueIn48HoursCount} tugas jatuh tempo dalam 48 jam!</span>
          </div>
          <Link
            to="/pengumuman"
            className="text-xs font-bold underline hover:no-underline shrink-0 text-amber-700 dark:text-amber-400"
          >
            Lihat Tugas
          </Link>
        </div>
      )}

      {/* 3. Hari Ini (Class Schedule) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              Kuliah Hari Ini ({todayHari.toUpperCase()})
            </h2>
          </div>
          <Link
            to="/jadwal"
            className="text-xs font-semibold flex items-center gap-1 hover:underline"
            style={{ color: 'var(--color-accent)' }}
          >
            <span>Semua Jadwal</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : todaySchedules.length === 0 ? (
          <div
            className="p-5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-2xl">🎉</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Tidak ada kuliah hari ini!
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Aman dulu, manfaatkan untuk istirahat atau mengulang materi.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todaySchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  borderLeft: '4px solid var(--color-accent)',
                }}
              >
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    {schedule.courses?.nama || 'Mata Kuliah'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <span>{schedule.ruang || 'Ruang belum ditentukan'}</span>
                    {schedule.dosen && <span>• {schedule.dosen}</span>}
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-md text-xs font-bold font-mono shrink-0"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-accent)',
                  }}
                >
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
            <Clock size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              Tugas Terdekat
            </h2>
          </div>
          <Link
            to="/pengumuman"
            className="text-xs font-semibold flex items-center gap-1 hover:underline"
            style={{ color: 'var(--color-accent)' }}
          >
            <span>Lihat Semua</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : urgentAnnouncements.length === 0 ? (
          <div
            className="p-6 rounded-xl border flex flex-col items-center justify-center text-center gap-1"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-2xl">😌</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Belum ada tugas aktif!
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
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
            <GraduationCap size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              Hitung Mundur Ujian
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingExams.map((exam) => {
              const countdownStr = getExamCountdown(exam.tanggal)
              return (
                <div
                  key={exam.id}
                  className="p-4 rounded-xl border flex items-center justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        exam.jenis === 'uts'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                      }`}
                    >
                      {exam.jenis.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-sm mt-1" style={{ color: 'var(--color-text)' }}>
                      {exam.courses?.nama || 'Mata Kuliah'}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatTanggal(exam.tanggal)} {exam.ruang ? `• ${exam.ruang}` : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900 block">
                      {countdownStr}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 6. Tombol Lanjut Latihan Soal */}
      <section
        className="p-4 rounded-xl border flex items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              Lanjut Latihan Soal
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Uji pemahaman topik dan pelajari pembahasan jawaban.
            </p>
          </div>
        </div>
        <Link
          to="/latihan"
          className="px-4 py-2 rounded-lg text-xs font-bold text-white shrink-0 shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Mulai
        </Link>
      </section>
    </div>
  )
}
