import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useDarkMode } from '@/hooks/useDarkMode'

export function AppLayout() {
  const [isDark, toggleDark] = useDarkMode()

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-600 dark:selection:bg-blue-400/20 dark:selection:text-blue-300"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {/* Liquid Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Primary Sapphire Indigo Orb */}
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-blue-500/40 via-indigo-500/30 to-purple-500/20 dark:from-blue-600/35 dark:via-indigo-600/25 dark:to-transparent blur-[90px] animate-float-slow" />
        
        {/* Secondary Fuchsia Purple Orb */}
        <div className="absolute top-1/4 -right-28 w-[32rem] h-[32rem] rounded-full bg-gradient-to-bl from-purple-500/35 via-pink-500/30 to-rose-400/20 dark:from-purple-600/30 dark:via-pink-700/20 dark:to-transparent blur-[90px] animate-float-delayed" />
        
        {/* Tertiary Cyan Emerald Orb */}
        <div className="absolute top-2/3 -left-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-cyan-400/35 via-teal-400/25 to-blue-400/20 dark:from-cyan-600/25 dark:via-emerald-600/18 dark:to-transparent blur-[90px] animate-float-reverse" />

        {/* Quaternary Warm Violet Sunset Orb */}
        <div className="absolute -bottom-32 right-1/4 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tl from-indigo-500/35 via-purple-500/25 to-pink-500/20 dark:from-indigo-600/30 dark:via-purple-600/20 dark:to-transparent blur-[90px] animate-float-slow" />
      </div>

      {/* Main Content with Frosted Glass Shell */}
      <Header isDark={isDark} onToggleDark={toggleDark} />
      <main className="flex-1 pb-28 md:pb-14 px-4 max-w-4xl w-full mx-auto pt-4 sm:pt-6 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

