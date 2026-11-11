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
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              HARI INI
            </span>
          )}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {sorted.length} Kelas
        </span>
      </div>

      {sorted.length === 0 ? (
        <div
          className="p-5 rounded-xl border border-dashed flex flex-col items-center justify-center text-center gap-1.5"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Calendar size={18} className="opacity-40" />
          <span className="text-xs font-medium">Tidak ada kuliah</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </div>
      )}
    </div>
  )
}

