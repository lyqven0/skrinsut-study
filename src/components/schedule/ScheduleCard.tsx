import { MapPin, User, Clock, CalendarPlus } from 'lucide-react'
import type { ClassSchedule } from '@/lib/types'
import { formatJam } from '@/lib/utils'

interface ScheduleCardProps {
  schedule: ClassSchedule
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const timeStr = formatJam(schedule.jam_mulai, schedule.jam_selesai)

  // Calendar export helper for class schedule (.ics)
  const handleExportIcs = () => {
    const title = `Kuliah: ${schedule.courses?.nama || 'Mata Kuliah'}`
    const loc = schedule.ruang || ''
    const desc = schedule.dosen ? `Dosen: ${schedule.dosen}` : ''
    
    const dayMap: Record<string, string> = {
      senin: 'MO',
      selasa: 'TU',
      rabu: 'WE',
      kamis: 'TH',
      jumat: 'FR',
      sabtu: 'SA',
      minggu: 'SU',
    }
    const byDay = dayMap[schedule.hari] || 'MO'

    const now = new Date()
    const dStr = `${now.getUTCFullYear()}0101`
    const startTimeClean = schedule.jam_mulai.replace(/:/g, '').slice(0, 4) + '00'
    const endTimeClean = schedule.jam_selesai.replace(/:/g, '').slice(0, 4) + '00'

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skrinsut Study//ID',
      'BEGIN:VEVENT',
      `UID:class-${schedule.id}@skrinsutstudy`,
      `DTSTART;TZID=Asia/Jakarta:${dStr}T${startTimeClean}`,
      `DTEND;TZID=Asia/Jakarta:${dStr}T${endTimeClean}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
      `SUMMARY:${title}`,
      `LOCATION:${loc}`,
      `DESCRIPTION:${desc}`,
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

  return (
    <div className="liquid-glass-card p-4 rounded-xl overflow-hidden">
      {/* Row 1: Time badge + Course name + Calendar button */}
      <div className="flex items-start gap-3 mb-2">
        <div className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono tracking-tight flex items-center gap-1.5 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 backdrop-blur-md">
          <Clock size={12} className="stroke-[2.2]" />
          <span>{timeStr}</span>
        </div>

        <h4 className="font-bold text-sm leading-snug text-slate-900 dark:text-slate-100 flex-1 min-w-0 truncate">
          {schedule.courses?.nama || 'Mata Kuliah'}
        </h4>

        <button
          type="button"
          onClick={handleExportIcs}
          className="shrink-0 text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12] text-[var(--color-accent)] border border-white/60 dark:border-white/[0.08] backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="Ekspor Jadwal ke Kalender (.ics)"
        >
          <CalendarPlus size={12} />
          <span className="hidden sm:inline">Kalender</span>
        </button>
      </div>

      {/* Row 2: Room & Lecturer info */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        {schedule.ruang && (
          <span className="inline-flex items-center gap-1 font-medium bg-slate-200/50 dark:bg-white/[0.05] px-2 py-0.5 rounded-md border border-slate-300/40 dark:border-white/[0.06] max-w-full truncate">
            <MapPin size={11} className="text-blue-500 shrink-0" />
            <span className="truncate">{schedule.ruang}</span>
          </span>
        )}
        {schedule.dosen && (
          <span className="inline-flex items-center gap-1 min-w-0 max-w-full truncate">
            <User size={11} className="text-slate-400 shrink-0" />
            <span className="truncate">{schedule.dosen}</span>
          </span>
        )}
      </div>
    </div>
  )
}
