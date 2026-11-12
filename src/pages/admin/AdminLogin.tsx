import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, ArrowLeft } from 'lucide-react'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

export function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Simulate brief loading
    await new Promise((r) => setTimeout(r, 400))

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('skrinsut_admin_auth', 'true')
      navigate('/admin')
    } else {
      setErrorMsg('Password salah. Coba lagi.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-500/15 dark:bg-cyan-600/10 rounded-full blur-3xl animate-float-reverse" />
      </div>

      <div className="w-full max-w-sm p-7 rounded-3xl liquid-glass shadow-2xl flex flex-col gap-5 relative z-10 border border-white/70 dark:border-white/10">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full liquid-glass-pill hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--glass-border)' }}
          >
            <ArrowLeft size={14} />
            <span>Kembali</span>
          </button>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full liquid-glass-pill bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Admin
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Masuk Admin
          </h1>
          <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Khusus pengurus kelas untuk moderasi tugas, materi, dan kelola bank soal.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 backdrop-blur-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
              Password Admin
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                required
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border text-sm bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ color: 'var(--color-text)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="liquid-button-primary w-full h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
