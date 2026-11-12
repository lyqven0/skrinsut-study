import { CalendarPlus, Clock, User, Trash2 } from 'lucide-react'
import type { Announcement } from '@/lib/types'
import { UrgencyChip } from './UrgencyChip'
import { formatTanggal } from '@/lib/utils'

interface AnnouncementCardProps {
  announcement: Announcement
  onDelete?: (id: string) => void
}

export function AnnouncementCard({ announcement, onDelete }: AnnouncementCardProps) {
  const deadlineDate = new Date(announcement.deadline)
  
  // Format exact date & time for display
  const exactTimeStr = announcement.deadline_hanya_tanggal
    ? `${formatTanggal(deadlineDate)} (23:59 WIB)`
    : `${formatTanggal(deadlineDate)} pukul ${deadlineDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      })} WIB`

  // Generate .ics calendar download
  const handleExportIcs = () => {
    const title = `${announcement.courses?.nama || 'Tugas'}: ${announcement.judul}`
    const desc = announcement.catatan ? announcement.catatan.replace(/\n/g, '\\n') : ''
    
    // ICS date format YYYYMMDDTHHMMSSZ
    const d = new Date(announcement.deadline)
    const pad = (n: number) => n.toString().padStart(2, '0')
    const startStr = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skrinsut Study//ID',
      'BEGIN:VEVENT',
      `UID:announcement-${announcement.id}@skrinsutstudy`,
      `DTSTAMP:${startStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${startStr}`,
      `SUMMARY:${title}`,
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
    <article className="liquid-glass-card p-5 group flex flex-col gap-3.5 relative overflow-hidden">
      {/* Top Refractive Accent Sheen */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-2.5 flex-wrap">
        <span className="px-3 py-1 rounded-xl text-xs font-semibold tracking-wide uppercase bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 backdrop-blur-md">
          {announcement.courses?.nama || 'Mata Kuliah'}
        </span>
        <UrgencyChip
          deadline={announcement.deadline}
          hanyaTanggal={announcement.deadline_hanya_tanggal}
        />
      </div>

      <h3 className="text-base sm:text-lg font-bold leading-snug text-slate-900 dark:text-slate-100">
        {announcement.judul}
      </h3>

      {announcement.catatan && (
        <p className="text-sm leading-relaxed line-clamp-3 whitespace-pre-line text-slate-600 dark:text-slate-300">
          {announcement.catatan}
        </p>
      )}

      <div className="pt-3 mt-auto flex items-center justify-between border-t border-slate-200/60 dark:border-white/[0.08] text-xs flex-wrap gap-2 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
          <span>{exactTimeStr}</span>
        </div>

        <div className="flex items-center gap-3">
          {announcement.ditambahkan_oleh && (
            <div className="flex items-center gap-1" title="Diusulkan oleh">
              <User size={13} />
              <span>{announcement.ditambahkan_oleh}</span>
            </div>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(announcement.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 backdrop-blur-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Hapus Pengumuman (Admin)"
            >
              <Trash2 size={13} />
              <span>Hapus</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportIcs}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold bg-white/40 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.12] text-[var(--color-accent)] border border-white/60 dark:border-white/[0.08] backdrop-blur-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Tambahkan ke Kalender (.ics)"
          >
            <CalendarPlus size={14} />
            <span>+ Kalender</span>
          </button>
        </div>
      </div>
    </article>
  )
}

