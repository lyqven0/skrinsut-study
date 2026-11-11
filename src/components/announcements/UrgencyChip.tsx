import { getUrgencyLevel, formatDeadline } from '@/lib/utils'

interface UrgencyChipProps {
  deadline: string
  hanyaTanggal: boolean
}

export function UrgencyChip({ deadline, hanyaTanggal }: UrgencyChipProps) {
  const level = getUrgencyLevel(deadline, hanyaTanggal)
  const text = formatDeadline(deadline, hanyaTanggal)

  const styles = {
    green: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 shadow-[0_2px_8px_rgba(16,185,129,0.12)]',
    yellow: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 shadow-[0_2px_8px_rgba(245,158,11,0.12)]',
    red: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/35 shadow-[0_2px_8px_rgba(244,63,94,0.18)]',
  }[level]

  const dotStyles = {
    green: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    yellow: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    red: 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]',
  }[level]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md liquid-glass-pill transition-all ${styles}`}
      role="status"
    >
      <span className={`w-2 h-2 rounded-full ${dotStyles}`} aria-hidden="true" />
      <span>{text}</span>
    </span>
  )
}

