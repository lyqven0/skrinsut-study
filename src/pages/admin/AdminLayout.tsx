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
import { supabase } from '@/lib/supabase'

export function AdminLayout() {
  const navigate = useNavigate()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/admin/login')
        return
      }

      const { data: adminRecord, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (error || !adminRecord) {
        setIsAdmin(false)
        navigate('/admin/login')
      } else {
        setIsAdmin(true)
      }

      setCheckingAuth(false)
    }

    checkAdmin()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Mobile Admin Bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 h-14 border-b z-30 sticky top-0"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
          <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
            Panel Admin Kelas
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg"
          style={{ color: 'var(--color-text)' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Nav */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 border-r shrink-0 p-4 gap-4 z-20`}
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="hidden md:flex items-center gap-2 px-2 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <ShieldCheck size={16} />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
              Panel Admin
            </h2>
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Skrinsut Study
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-[var(--color-text)]'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--color-border)' }}>
          <Link
            to="/"
            className="text-xs font-medium px-3 py-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            ← Kembali ke Web Publik
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
