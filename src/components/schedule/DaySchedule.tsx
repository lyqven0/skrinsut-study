import { Calendar } from 'lucide-react'
import type { ClassSchedule, Hari } from '@/lib/types'
import { ScheduleCard } from './ScheduleCard'

interface DayScheduleProps {
  hari: Hari
  label: string
  schedules: ClassSchedule[]
  isToday: boolean
}

export function DaySchedule({ label, schedules, isToday }: DayScheduleProps) {
  // Sort schedules by starting time
  const sorted = [...schedules].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm tracking-wide capitalize" style={{ color: 'var(--color-text)' }}>
            {label}
          </h3>
          {isToday && (
            <span
              className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full liquid-glass-pill bg-blue-500/15 text-[var(--color-accent)] border border-blue-500/30 shadow-[0_0_10px_rgba(79,110,247,0.2)]"
            >
              HARI INI
            </span>
          )}
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full liquid-glass-pill text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5">
          {sorted.length} Kelas
        </span>
      </div>

      {sorted.length === 0 ? (
        <div
          className="p-5 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center gap-2 liquid-glass-card border-slate-300/70 dark:border-white/10"
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-200/50 dark:bg-white/5 text-slate-400">
            <Calendar size={18} />
          </div>
          <span className="text-xs font-semibold">Tidak ada kuliah hari ini</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </div>
      )}
    </div>
  )
}

