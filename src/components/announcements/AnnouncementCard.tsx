import { CalendarPlus, Clock, User } from 'lucide-react'
import type { Announcement } from '@/lib/types'
import { UrgencyChip } from './UrgencyChip'
import { formatTanggal } from '@/lib/utils'

interface AnnouncementCardProps {
  announcement: Announcement
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
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
    <article
      className="p-4 rounded-xl border transition-all duration-150 hover:shadow-md flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span
          className="px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
          }}
        >
          {announcement.courses?.nama || 'Mata Kuliah'}
        </span>
        <UrgencyChip
          deadline={announcement.deadline}
          hanyaTanggal={announcement.deadline_hanya_tanggal}
        />
      </div>

      <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
        {announcement.judul}
      </h3>

      {announcement.catatan && (
        <p className="text-sm line-clamp-3 whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
          {announcement.catatan}
        </p>
      )}

      <div
        className="pt-2 mt-auto flex items-center justify-between border-t text-xs flex-wrap gap-2"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <div className="flex items-center gap-1.5 font-medium">
          <Clock size={14} className="shrink-0" />
          <span>{exactTimeStr}</span>
        </div>

        <div className="flex items-center gap-3">
          {announcement.ditambahkan_oleh && (
            <div className="flex items-center gap-1" title="Diusulkan oleh">
              <User size={13} />
              <span>{announcement.ditambahkan_oleh}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleExportIcs}
            className="inline-flex items-center gap-1 font-semibold hover:underline cursor-pointer"
            style={{ color: 'var(--color-accent)' }}
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

