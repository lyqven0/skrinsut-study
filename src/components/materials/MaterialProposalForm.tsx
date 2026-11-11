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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Usulkan Materi: {courseName}
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Akan ditinjau oleh admin sebelum ditampilkan untuk teman-teman sekelas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
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
          <div className="p-3 rounded-lg text-xs flex items-start gap-2 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
            <span>
              Bagikan lewat Google Drive/Slides (akses <em>&ldquo;siapa saja dengan link&rdquo;</em>), disarankan format PDF. Tidak ada fitur upload file langsung.
            </span>
          </div>

          {/* Judul */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Judul Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              maxLength={200}
              placeholder="Contoh: Slide Pertemuan 3 - Normalisasi 1NF & 2NF"
              required
              className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Topik & Jenis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Topik / Bab <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                maxLength={100}
                placeholder="Contoh: Normalisasi"
                required
                className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Jenis Materi <span className="text-red-500">*</span>
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as JenisMateri)}
                className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Tautan (Google Drive / Slides / YouTube)
            </label>
            <input
              type="url"
              value={tautan}
              onChange={(e) => setTautan(e.target.value)}
              maxLength={500}
              placeholder="https://drive.google.com/..."
              className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Catatan / Ringkasan Teks */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Catatan / Ringkasan Teks <span className="text-xs font-normal text-gray-500">(opsional atau alternatif tautan)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Ringkasan poin penting atau pembahasan materi..."
              className="w-full p-3 rounded-lg border bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
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
              placeholder="Contoh: Rian (PJ Matkul)"
              className="w-full h-11 px-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 h-11 rounded-lg font-medium border hover:bg-gray-100 dark:hover:bg-neutral-800"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 h-11 rounded-lg font-semibold text-white flex items-center gap-2 shadow-sm disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent)' }}
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

