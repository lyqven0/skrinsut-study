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
    
    // Create an ICS event (repeat weekly on schedule.hari)
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

    // Compute approximate next occurrence date
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
    <div className="liquid-glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group">
      <div className="flex items-start gap-3.5">
        <div className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 backdrop-blur-md shadow-xs">
          <Clock size={13} className="stroke-[2.2]" />
          <span>{timeStr}</span>
        </div>

        <div>
          <h4 className="font-bold text-sm sm:text-base leading-snug text-slate-900 dark:text-slate-100">
            {schedule.courses?.nama || 'Mata Kuliah'}
          </h4>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
            {schedule.ruang && (
              <span className="flex items-center gap-1 font-medium bg-slate-200/50 dark:bg-white/[0.05] px-2 py-0.5 rounded-md border border-slate-300/40 dark:border-white/[0.06]">
                <MapPin size={12} className="text-blue-500 shrink-0" />
                <span>{schedule.ruang}</span>
              </span>
            )}
            {schedule.dosen && (
              <span className="flex items-center gap-1">
                <User size={12} className="text-slate-400 shrink-0" />
                <span>{schedule.dosen}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleExportIcs}
          className="text-xs font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12] text-[var(--color-accent)] border border-white/60 dark:border-white/[0.08] backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Ekspor Jadwal ke Kalender (.ics)"
        >
          <CalendarPlus size={14} />
          <span>+ Kalender</span>
        </button>
      </div>
    </div>
  )
}

