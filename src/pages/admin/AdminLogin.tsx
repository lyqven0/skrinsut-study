import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      if (data.user) {
        // Verify admin table
        const { data: adminRecord, error: adminErr } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', data.user.id)
          .single()

        if (adminErr || !adminRecord) {
          await supabase.auth.signOut()
          throw new Error('Akun Anda bukan admin yang terdaftar.')
        }

        navigate('/admin')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login gagal. Periksa email dan password.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div
        className="w-full max-w-sm p-6 rounded-2xl border shadow-lg flex flex-col gap-5"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            Admin Auth
          </span>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Masuk Admin
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Halaman ini khusus untuk pengurus kelas yang memiliki akun admin.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kelas.ac.id"
                required
                className="w-full h-11 pl-9 pr-3 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 pl-9 pr-3 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-opacity disabled:opacity-50 mt-1 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
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

