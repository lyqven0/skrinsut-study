import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon, Search, Camera, Settings } from 'lucide-react'

interface HeaderProps {
  isDark: boolean
  onToggleDark: () => void
}

const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/pengumuman', label: 'Pengumuman' },
  { to: '/jadwal', label: 'Jadwal' },
  { to: '/belajar', label: 'Belajar' },
  { to: '/simulasi', label: 'Simulasi' },
]

export function Header({ isDark, onToggleDark }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 w-full backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo / Title */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Camera size={18} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
              Skrinsut Study
            </span>
            <span className="text-[10px] leading-tight font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Info Kelas
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Link
            to="/cari"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Pencarian"
          >
            <Search size={18} />
          </Link>

          <Link
            to="/pengaturan"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Pengaturan dan Data Pribadi"
          >
            <Settings size={18} />
          </Link>

          <button
            type="button"
            onClick={onToggleDark}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
