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
    <div
      className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-sm"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-tight flex items-center gap-1.5"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Clock size={13} />
          <span>{timeStr}</span>
        </div>

        <div>
          <h4 className="font-bold text-sm sm:text-base leading-snug" style={{ color: 'var(--color-text)' }}>
            {schedule.courses?.nama || 'Mata Kuliah'}
          </h4>

          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {schedule.ruang && (
              <span className="flex items-center gap-1 font-medium">
                <MapPin size={12} className="text-gray-400" />
                <span>{schedule.ruang}</span>
              </span>
            )}
            {schedule.dosen && (
              <span className="flex items-center gap-1">
                <User size={12} className="text-gray-400" />
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
          className="text-xs font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
          style={{ color: 'var(--color-accent)' }}
          title="Ekspor Jadwal ke Kalender (.ics)"
        >
          <CalendarPlus size={14} />
          <span className="hidden sm:inline">+ Kalender</span>
        </button>
      </div>
    </div>
  )
}

