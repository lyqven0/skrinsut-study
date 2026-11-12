import { useState } from 'react'
import { X, Send, Loader2, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { JenisMateri } from '@/lib/types'
import { checkCooldown, setCooldown } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface MaterialProposalFormProps {
  courseId: string
  courseName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function MaterialProposalForm({
  courseId,
  courseName,
  isOpen,
  onClose,
  onSuccess,
}: MaterialProposalFormProps) {
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  // Fields
  const [judul, setJudul] = useState('')
  const [topik, setTopik] = useState('')
  const [jenis, setJenis] = useState<JenisMateri>('slide')
  const [tautan, setTautan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [ditambahkanOleh, setDitambahkanOleh] = useState('')
  const [honeypot, setHoneypot] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Honeypot check
    if (honeypot.trim() !== '') {
      onClose()
      return
    }

    // 2. Cooldown check
    if (!checkCooldown('proposal_material', 30)) {
      showToast('Mohon tunggu sebentar sebelum mengusulkan materi lagi.', 'info')
      return
    }

    // 3. Validation
    if (!judul.trim() || judul.length > 200) {
      showToast('Judul materi wajib diisi (maksimal 200 karakter).', 'error')
      return
    }
    if (!topik.trim() || topik.length > 100) {
      showToast('Topik materi wajib diisi (maksimal 100 karakter).', 'error')
      return
    }

    const cleanTautan = tautan.trim()
    const cleanCatatan = catatan.trim()

    if (!cleanTautan && !cleanCatatan) {
      showToast('Harap cantumkan tautan atau catatan teks materi.', 'error')
      return
    }

    if (cleanTautan && !/^https?:\/\//i.test(cleanTautan)) {
      showToast('Tautan materi harus diawali dengan http:// atau https://', 'error')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('materials').insert([
        {
          course_id: courseId,
          judul: judul.trim(),
          topik: topik.trim(),
          jenis,
          tautan: cleanTautan || null,
          catatan: cleanCatatan || null,
          ditambahkan_oleh: ditambahkanOleh.trim() || null,
          status: 'menunggu',
        },
      ])

      if (error) throw error

      setCooldown('proposal_material')
      showToast('Terkirim, menunggu persetujuan admin', 'success')

      // Reset
      setJudul('')
      setTopik('')
      setTautan('')
      setCatatan('')
      setDitambahkanOleh('')

      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim usulan materi.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border border-white/60 dark:border-white/10 liquid-glass overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Usulkan Materi: {courseName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Akan ditinjau oleh admin sebelum ditampilkan untuk teman-teman sekelas.
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Hint alert */}
          <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 backdrop-blur-sm">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
            <span>
              Bagikan lewat Google Drive/Slides (akses <em>&ldquo;siapa saja dengan link&rdquo;</em>), disarankan format PDF. Tidak ada fitur upload file langsung.
            </span>
          </div>

          {/* Judul */}
          <div>
            <label className="block font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
              Judul Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              maxLength={200}
              placeholder="Contoh: Slide Pertemuan 3 - Normalisasi 1NF & 2NF"
              required
              className="w-full h-11 px-3.5 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          {/* Topik & Jenis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Topik / Bab <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                maxLength={100}
                placeholder="Contoh: Normalisasi"
                required
                className="w-full h-11 px-3.5 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Jenis Materi <span className="text-red-500">*</span>
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as JenisMateri)}
                className="w-full h-11 px-3.5 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ color: 'var(--color-text)' }}
              >
                <option value="slide" className="dark:bg-neutral-900">Slide Presentasi</option>
                <option value="pdf" className="dark:bg-neutral-900">Dokumen PDF</option>
                <option value="video" className="dark:bg-neutral-900">Video Pembelajaran</option>
                <option value="catatan" className="dark:bg-neutral-900">Catatan Teks</option>
              </select>
            </div>
          </div>

          {/* Tautan */}
          <div>
            <label className="block font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
              Tautan (Google Drive / Slides / YouTube)
            </label>
            <input
              type="url"
              value={tautan}
              onChange={(e) => setTautan(e.target.value)}
              maxLength={500}
              placeholder="https://drive.google.com/..."
              className="w-full h-11 px-3.5 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          {/* Catatan / Ringkasan Teks */}
          <div>
            <label className="block font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
              Catatan / Ringkasan Teks <span className="text-xs font-normal text-slate-400">(opsional atau alternatif tautan)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Ringkasan poin penting atau pembahasan materi..."
              className="w-full p-3.5 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          {/* Nama Penambah */}
          <div>
            <label className="block font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
              Nama Kamu <span className="text-xs font-normal text-slate-400">(opsional/bebas)</span>
            </label>
            <input
              type="text"
              value={ditambahkanOleh}
              onChange={(e) => setDitambahkanOleh(e.target.value)}
              maxLength={50}
              placeholder="Contoh: Rian (PJ Matkul)"
              className="w-full h-11 px-3.5 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200/60 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 h-11 rounded-xl font-medium border border-slate-200/60 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="liquid-button-primary px-6 h-11 rounded-xl font-semibold text-white flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>Kirim Usulan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

