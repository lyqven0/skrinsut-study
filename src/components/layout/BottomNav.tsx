import { NavLink } from 'react-router-dom'
import { Home, FileText, Calendar, GraduationCap } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/pengumuman', label: 'Pengumuman', icon: FileText },
  { to: '/jadwal', label: 'Jadwal', icon: Calendar },
  { to: '/belajar', label: 'Belajar', icon: GraduationCap },
] as const

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-3 left-4 right-4 z-40 flex md:hidden max-w-lg mx-auto rounded-2xl liquid-glass-dock p-1 transition-all duration-300"
      aria-label="Navigasi Utama"
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-600/10 dark:bg-white/10 text-[var(--color-accent)] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
          style={{ minHeight: 52, minWidth: 44 }}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                className={`transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`}
                style={{
                  color: isActive ? 'var(--color-accent)' : undefined,
                }}
              />
              <span
                className={`text-[10px] leading-tight tracking-tight ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
                style={{
                  color: isActive ? 'var(--color-accent)' : undefined,
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
