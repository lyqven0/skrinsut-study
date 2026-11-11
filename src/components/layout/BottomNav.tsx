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
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
      style={{
        background: 'var(--color-card)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex-1 flex flex-col items-center justify-center gap-0.5"
          style={{ minHeight: 64, minWidth: 44 }}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                style={{
                  color: isActive
                    ? 'var(--color-accent)'
                    : 'var(--color-text-secondary)',
                  transition: 'color 150ms ease',
                }}
              />
              <span
                className="text-[11px] font-medium"
                style={{
                  color: isActive
                    ? 'var(--color-accent)'
                    : 'var(--color-text-secondary)',
                  transition: 'color 150ms ease',
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
