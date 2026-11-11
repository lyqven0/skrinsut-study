import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-[var(--color-text-secondary)]" style={{ fontSize: 48 }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
        {description}
      </p>
    </div>
  )
}
