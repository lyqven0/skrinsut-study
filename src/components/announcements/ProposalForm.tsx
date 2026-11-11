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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Usulkan Tugas Baru
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Akan ditinjau oleh admin sebelum ditampilkan di pengumuman.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
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
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Mata Kuliah <span className="text-red-500">*</span>
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              disabled={loadingCourses}
              className="w-full h-11 px-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="" disabled>
                {loadingCourses ? 'Memuat daftar mata kuliah...' : '-- Pilih Mata Kuliah --'}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-neutral-900">
                  {c.nama} ({c.kode})
                </option>
              ))}
            </select>
          </div>

          {/* Judul Tugas */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              maxLength={200}
              placeholder="Contoh: Tugas 2 Query SQL & Relasi"
              required
              className="w-full h-11 px-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <span className="text-[11px] block text-right mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {judul.length}/200
            </span>
          </div>

          {/* Deadline: Tanggal + Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Tanggal Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Jam Deadline <span className="text-xs font-normal text-gray-500">(opsional, default 23:59 WIB)</span>
              </label>
              <input
                type="time"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Catatan Singkat */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Catatan Singkat <span className="text-xs font-normal text-gray-500">(opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Contoh: Dikumpulkan dalam format PDF via Google Classroom, kerja kelompok maks 3 orang."
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent resize-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <span className="text-[11px] block text-right mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {catatan.length}/1000
            </span>
          </div>

          {/* Nama Penambah */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Nama Kamu <span className="text-xs font-normal text-gray-500">(opsional/bebas)</span>
            </label>
            <input
              type="text"
              value={ditambahkanOleh}
              onChange={(e) => setDitambahkanOleh(e.target.value)}
              maxLength={50}
              placeholder="Contoh: Budi (Kormat)"
              className="w-full h-11 px-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 h-11 rounded-lg font-medium border hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 h-11 rounded-lg font-semibold text-white flex items-center gap-2 shadow-sm transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent)' }}
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

