import { useState } from 'react'
import { X, AlertTriangle, Loader2, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'

interface ReportModalProps {
  questionId: string
  isOpen: boolean
  onClose: () => void
}

export function ReportModal({ questionId, isOpen, onClose }: ReportModalProps) {
  const { showToast } = useToast()
  const [alasan, setAlasan] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (alasan.trim().length < 5) {
      showToast('Mohon jelaskan alasan laporan minimal 5 karakter.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('question_reports').insert([
        {
          question_id: questionId,
          alasan: alasan.trim(),
          status: 'baru',
        },
      ])

      if (error) throw error

      showToast('Laporan berhasil dikirim ke pengurus/admin. Terima kasih!', 'success')
      setAlasan('')
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim laporan.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl shadow-xl border overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              Laporkan Soal Ini
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-sm">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Temukan kesalahan kunci jawaban, typo pertanyaan, atau pembahasan yang kurang tepat? Beritahu admin kelas di bawah ini.
          </p>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Alasan Laporan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Contoh: Kunci jawaban seharusnya B karena rumus normalisasi 2NF..."
              required
              className="w-full p-3 rounded-lg border bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <span className="text-[11px] block text-right mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {alasan.length}/500
            </span>
          </div>

          <div className="pt-2 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 h-10 rounded-lg font-medium border hover:bg-gray-100 dark:hover:bg-neutral-800"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 h-10 rounded-lg font-semibold text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Kirim Laporan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

