import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon, Search, Camera, Settings, ShieldCheck } from 'lucide-react'

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
    <header className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-white/65 dark:bg-[#0b0c12]/65 border-b border-white/50 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(31,38,135,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Title */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_4px_16px_rgba(79,110,247,0.35)] bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
            <Camera size={19} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Skrinsut Study
            </span>
            <span className="text-[11px] leading-tight font-medium text-slate-500 dark:text-slate-400">
              Info Kelas
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/40 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.06] backdrop-blur-xl">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-white/15 text-[var(--color-accent)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-white/80 dark:border-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Link
            to="/cari"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/50 dark:bg-white/[0.05] border border-white/60 dark:border-white/[0.08] hover:bg-white/90 dark:hover:bg-white/10 shadow-sm backdrop-blur-lg transition-all active:scale-95"
            aria-label="Pencarian"
          >
            <Search size={17} />
          </Link>

          <Link
            to="/pengaturan"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/50 dark:bg-white/[0.05] border border-white/60 dark:border-white/[0.08] hover:bg-white/90 dark:hover:bg-white/10 shadow-sm backdrop-blur-lg transition-all active:scale-95"
            aria-label="Pengaturan dan Data Pribadi"
          >
            <Settings size={17} />
          </Link>

          <Link
            to="/admin/login"
            className="h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[var(--color-accent)] bg-white/50 dark:bg-white/[0.05] border border-white/60 dark:border-white/[0.08] hover:bg-white/90 dark:hover:bg-white/10 shadow-xs backdrop-blur-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Panel Admin"
            title="Masuk sebagai Admin"
          >
            <ShieldCheck size={16} className="text-blue-500" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <button
            type="button"
            onClick={onToggleDark}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/50 dark:bg-white/[0.05] border border-white/60 dark:border-white/[0.08] hover:bg-white/90 dark:hover:bg-white/10 shadow-sm backdrop-blur-lg transition-all active:scale-95"
            aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  )
}
