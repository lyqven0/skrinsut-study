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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl shadow-2xl border border-white/60 dark:border-white/10 liquid-glass overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Laporkan Soal Ini
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Temukan kesalahan kunci jawaban, typo pertanyaan, atau pembahasan yang kurang tepat? Beritahu admin kelas di bawah ini.
          </p>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
              Alasan Laporan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Contoh: Kunci jawaban seharusnya B karena rumus normalisasi 2NF..."
              required
              className="w-full p-3.5 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ color: 'var(--color-text)' }}
            />
            <span className="text-[11px] block text-right mt-1 text-slate-400">
              {alasan.length}/500
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 h-10 rounded-xl font-medium border border-slate-200/60 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="liquid-button-primary px-5 h-10 rounded-xl font-semibold text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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

