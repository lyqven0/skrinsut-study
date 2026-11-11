import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useDarkMode } from '@/hooks/useDarkMode'

export function AppLayout() {
  const [isDark, toggleDark] = useDarkMode()

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-150"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      <Header isDark={isDark} onToggleDark={toggleDark} />
      <main className="flex-1 pb-24 md:pb-12 px-4 max-w-4xl w-full mx-auto pt-4 sm:pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

