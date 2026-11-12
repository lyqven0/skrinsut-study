import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BellRing,
  BookOpen,
  Calendar,
  LogOut,
  ShieldCheck,
  Loader2,
  Menu,
  X,
  GraduationCap,
  HelpCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'

export function AdminLayout() {
  const navigate = useNavigate()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('skrinsut_admin_auth') === 'true'
    if (!isLoggedIn) {
      navigate('/admin/login')
    } else {
      setIsAdmin(true)
    }
    setCheckingAuth(false)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('skrinsut_admin_auth')
    navigate('/')
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-[var(--color-accent)]" />
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Memeriksa hak akses admin...
          </span>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  const adminNav = [
    { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, end: true },
    { to: '/admin/pengumuman', label: 'Antrean Tugas', icon: BellRing, end: false },
    { to: '/admin/materi', label: 'Antrean Materi', icon: GraduationCap, end: false },
    { to: '/admin/soal', label: 'Kelola Bank Soal', icon: HelpCircle, end: false },
    { to: '/admin/laporan-soal', label: 'Laporan Soal', icon: AlertTriangle, end: false },
    { to: '/admin/mata-kuliah', label: 'Kelola Mata Kuliah', icon: BookOpen, end: false },
    { to: '/admin/jadwal', label: 'Kelola Jadwal Kuliah', icon: Calendar, end: false },
    { to: '/admin/ujian', label: 'Kelola Jadwal Ujian', icon: Calendar, end: false },
    { to: '/admin/statistik-soal', label: 'Statistik Kesulitan Soal', icon: BarChart3, end: false },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Mobile Admin Bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/60 dark:border-white/10 liquid-glass z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg liquid-button-primary flex items-center justify-center text-white">
            <ShieldCheck size={16} />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
            Panel Admin Kelas
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl liquid-glass-pill text-slate-600 dark:text-slate-300"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Nav */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 border-r border-white/60 dark:border-white/10 liquid-glass shrink-0 p-4 gap-4 z-20 md:min-h-screen md:sticky md:top-0`}
      >
        <div className="hidden md:flex items-center gap-2.5 px-2 py-3 border-b border-slate-200/60 dark:border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl liquid-button-primary flex items-center justify-center text-white font-bold shadow-md">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="font-black text-sm leading-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Panel Admin
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Skrinsut Study
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'liquid-glass-pill bg-blue-500/15 text-[var(--color-accent)] border border-blue-500/30 shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:bg-white/40 dark:hover:bg-white/5 hover:text-[var(--color-text)]'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08] flex flex-col gap-2">
          <Link
            to="/"
            className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
          >
            ← Kembali ke Web Publik
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl overflow-y-auto relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
