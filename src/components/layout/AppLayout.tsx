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
        {/* Primary Ambient Orb */}
        <div className="absolute -top-32 -left-32 w-96 h-96 sm:w-[32rem] sm:h-[32rem] rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-transparent dark:from-blue-600/15 dark:via-indigo-600/10 dark:to-transparent blur-3xl animate-float-slow" />
        
        {/* Secondary Ambient Orb */}
        <div className="absolute top-1/3 -right-24 w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-full bg-gradient-to-bl from-purple-400/18 via-pink-400/12 to-transparent dark:from-purple-600/12 dark:via-pink-700/8 dark:to-transparent blur-3xl animate-float-delayed" />
        
        {/* Tertiary Ambient Orb */}
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 sm:w-[30rem] sm:h-[30rem] rounded-full bg-gradient-to-tr from-cyan-400/15 via-emerald-400/10 to-transparent dark:from-cyan-600/10 dark:via-emerald-600/5 dark:to-transparent blur-3xl animate-float-reverse" />
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

