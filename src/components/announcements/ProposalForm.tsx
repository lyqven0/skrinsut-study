import { useState, useEffect } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'
import { checkCooldown, setCooldown } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface ProposalFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ProposalForm({ isOpen, onClose, onSuccess }: ProposalFormProps) {
  const { showToast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [courseId, setCourseId] = useState('')
  const [judul, setJudul] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [jam, setJam] = useState('')
  const [catatan, setCatatan] = useState('')
  const [ditambahkanOleh, setDitambahkanOleh] = useState('')
  const [honeypot, setHoneypot] = useState('') // spam prevention

  useEffect(() => {
    if (isOpen) {
      fetchCourses()
    }
  }, [isOpen])

  const fetchCourses = async () => {
    setLoadingCourses(true)
    const { data } = await supabase.from('courses').select('*').order('nama')
    if (data) setCourses(data)
    setLoadingCourses(false)
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Honeypot check
    if (honeypot.trim() !== '') {
      onClose()
      return
    }

    // 2. Cooldown check (30 seconds)
    if (!checkCooldown('proposal_announcement', 30)) {
      showToast('Mohon tunggu sebentar sebelum mengirim usulan lagi.', 'info')
      return
    }

    // 3. Validation
    if (!courseId) {
      showToast('Pilih mata kuliah terlebih dahulu.', 'error')
      return
    }
    if (!judul.trim() || judul.length > 200) {
      showToast('Judul tugas harus diisi (maksimal 200 karakter).', 'error')
      return
    }
    if (!tanggal) {
      showToast('Tanggal deadline harus diisi.', 'error')
      return
    }

    // Calculate ISO string for deadline in WIB
    const deadlineHanyaTanggal = !jam
    const timePart = jam ? `${jam}:00` : '23:59:00'
    // Format timestamp string with +07:00 (Asia/Jakarta)
    const deadlineIso = `${tanggal}T${timePart}+07:00`

    setSubmitting(true)

    try {
      const { error } = await supabase.from('announcements').insert([
        {
          course_id: courseId,
          judul: judul.trim(),
          deadline: deadlineIso,
          deadline_hanya_tanggal: deadlineHanyaTanggal,
          catatan: catatan.trim() || null,
          ditambahkan_oleh: ditambahkanOleh.trim() || null,
          status: 'menunggu', // strictly pending
        },
      ])

      if (error) {
        throw error
      }

      setCooldown('proposal_announcement')
      showToast('Terkirim, menunggu persetujuan admin', 'success')

      // Reset form
      setJudul('')
      setTanggal('')
      setJam('')
      setCatatan('')
      setDitambahkanOleh('')

      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim usulan. Silakan coba lagi.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border border-white/60 dark:border-white/10 liquid-glass overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Usulkan Tugas Baru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Akan ditinjau oleh admin sebelum ditampilkan di papan pengumuman.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Honeypot field (hidden from real users) */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Mata Kuliah */}
          <div>
            <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              disabled={loadingCourses}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
            >
              <option value="" disabled>
                {loadingCourses ? 'Memuat daftar mata kuliah...' : '-- Pilih Mata Kuliah --'}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
                  {c.nama} ({c.kode})
                </option>
              ))}
            </select>
          </div>

          {/* Judul Tugas */}
          <div>
            <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              maxLength={200}
              placeholder="Contoh: Tugas 2 Query SQL & Relasi"
              required
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
            />
            <span className="text-[11px] block text-right mt-1 text-slate-400">
              {judul.length}/200
            </span>
          </div>

          {/* Deadline: Tanggal + Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                Tanggal Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                Jam Deadline <span className="text-xs font-normal text-slate-400">(opsional, default 23:59 WIB)</span>
              </label>
              <input
                type="time"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Catatan Singkat */}
          <div>
            <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Catatan Singkat <span className="text-xs font-normal text-slate-400">(opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Contoh: Dikumpulkan dalam format PDF via Google Classroom, kerja kelompok maks 3 orang."
              className="w-full p-3.5 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100 resize-none"
            />
            <span className="text-[11px] block text-right mt-1 text-slate-400">
              {catatan.length}/1000
            </span>
          </div>

          {/* Nama Penambah */}
          <div>
            <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Nama Kamu <span className="text-xs font-normal text-slate-400">(opsional/bebas)</span>
            </label>
            <input
              type="text"
              value={ditambahkanOleh}
              onChange={(e) => setDitambahkanOleh(e.target.value)}
              maxLength={50}
              placeholder="Contoh: Budi (Kormat)"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200/60 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 h-11 rounded-xl font-medium border border-slate-300/60 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="liquid-button-primary px-5 h-11 rounded-xl font-semibold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Kirim Usulan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

