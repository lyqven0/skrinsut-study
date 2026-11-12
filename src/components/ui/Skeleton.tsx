interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = 'h-4 w-full', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.07] backdrop-blur-sm border border-white/50 dark:border-white/[0.04] shadow-sm ${className}`}
        />
      ))}
    </>
  )
}
