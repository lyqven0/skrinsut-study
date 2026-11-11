import { getUrgencyLevel, formatDeadline } from '@/lib/utils'

interface UrgencyChipProps {
  deadline: string
  hanyaTanggal: boolean
}

export function UrgencyChip({ deadline, hanyaTanggal }: UrgencyChipProps) {
  const level = getUrgencyLevel(deadline, hanyaTanggal)
  const text = formatDeadline(deadline, hanyaTanggal)

  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
    red: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
  }[level]

  const dotStyles = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-rose-500 animate-pulse',
  }[level]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}
      role="status"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} aria-hidden="true" />
      <span>{text}</span>
    </span>
  )
}

