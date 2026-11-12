import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl liquid-glass-card flex items-center justify-center mb-4 text-[var(--color-accent)] shadow-lg border border-white/60 dark:border-white/10">
        <div className="transform scale-125 opacity-80">
          {icon}
        </div>
      </div>
      <h3 className="text-base font-bold text-[var(--color-text)] mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-sm font-medium leading-relaxed">
        {description}
      </p>
    </div>
  )
}
