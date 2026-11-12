import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import {
  getPersonalData,
  exportPersonalDataJson,
  importPersonalDataJson,
  clearPersonalData,
  type PersonalData,
} from '@/lib/storage'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/components/ui/Toast'

export function Pengaturan() {
  const { showToast } = useToast()
  const [isDark, toggleDark] = useDarkMode()
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)

  const reloadData = () => {
    setPersonalData(getPersonalData())
  }

  useEffect(() => {
    reloadData()
  }, [])

  const handleExport = () => {
    try {
      exportPersonalDataJson()
      showToast('Cadangan data berhasil diunduh (JSON).', 'success')
    } catch {
      showToast('Gagal mengekspor data.', 'error')
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const success = importPersonalDataJson(text)
      if (success) {
        showToast('Data pribadi berhasil dipulihkan!', 'success')
        reloadData()
      } else {
        showToast('File JSON tidak valid atau rusak.', 'error')
      }
    }
    reader.readAsText(file)
  }

  const handleResetData = () => {
    if (
      confirm(
        'Yakin ingin menghapus seluruh data pribadi lokal di browser ini? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      clearPersonalData()
      reloadData()
      showToast('Seluruh data pribadi lokal telah dibersihkan.', 'info')
    }
  }

  const bookmarkCount = personalData?.bookmarks.length || 0
  const noteCount = Object.keys(personalData?.notes || {}).length
  const practiceCount = personalData?.practiceHistory.length || 0

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Pengaturan & Data Pribadi
        </h1>
        <p className="text-xs sm:text-sm mt-0.5 text-slate-500 dark:text-slate-400">
          Kelola preferensi tema dan cadangkan catatan serta bookmark soalmu.
        </p>
      </div>

      {/* Privacy Notice with Liquid Glass Amber */}
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-xl text-amber-900 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-3 shadow-xs">
        <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
        <div>
          <strong className="block font-bold mb-0.5">Catatan Privasi:</strong>
          Data pribadi (bookmark, catatan soal, dan riwayat latihan) tersimpan di browser ini tanpa perlu akun login, dan akan hilang jika data cache/situs browser kamu dibersihkan. Gunakan fitur ekspor JSON di bawah untuk mencadangkan.
        </div>
      </div>

      {/* Data Stats Summary */}
      <div className="liquid-glass-card p-4 rounded-2xl flex items-center justify-around text-center text-xs">
        <div>
          <span className="font-extrabold text-xl block text-[var(--color-accent)]">
            {bookmarkCount}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Soal Ditandai</span>
        </div>
        <div className="w-px h-8 bg-slate-300/60 dark:bg-white/10" />
        <div>
          <span className="font-extrabold text-xl block text-[var(--color-accent)]">
            {noteCount}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Catatan Pribadi</span>
        </div>
        <div className="w-px h-8 bg-slate-300/60 dark:bg-white/10" />
        <div>
          <span className="font-extrabold text-xl block text-[var(--color-accent)]">
            {practiceCount}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Sesi Latihan</span>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="liquid-glass-card p-5 rounded-2xl flex flex-col gap-3.5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Preferensi Tampilan
        </h2>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
              Tema Gelap (Dark Mode)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isDark ? 'Mode gelap aktif' : 'Mode terang aktif'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleDark}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300/60 dark:border-white/10 bg-white/50 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-200 flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? 'Beralih ke Terang' : 'Beralih ke Gelap'}</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="liquid-glass-card p-5 rounded-2xl flex flex-col gap-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Cadangkan & Pulihkan Data (JSON)
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            className="liquid-button-primary w-full sm:w-auto flex-1 h-11 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={15} />
            <span>Ekspor Data Saya (JSON)</span>
          </button>

          <label className="w-full sm:w-auto flex-1 h-11 rounded-xl text-xs font-bold border border-slate-300/60 dark:border-white/10 bg-white/50 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md transition-all active:scale-95 shadow-xs">
            <Upload size={15} />
            <span>Impor Data dari JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          File JSON dapat kamu simpan di HP atau Google Drive untuk dipindahkan ke perangkat lain sewaktu-waktu.
        </p>
      </div>

      {/* Admin Section */}
      <div className="liquid-glass-card p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Area Pengurus Kelas (Admin)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Khusus pengurus untuk moderasi tugas, materi, dan kelola jadwal kelas.
          </p>
        </div>

        <Link
          to="/admin/login"
          className="liquid-button-primary px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <ShieldCheck size={14} />
          <span>Masuk Panel Admin</span>
        </Link>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="liquid-glass-card p-5 rounded-2xl border-rose-500/30 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400">
          Hapus Data Lokal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bersihkan seluruh riwayat latihan, catatan, dan soal yang ditandai dari browser perangkat ini.
        </p>

        <div>
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
          >
            <Trash2 size={14} />
            <span>Hapus Semua Data Browser</span>
          </button>
        </div>
      </div>
    </div>
  )
}
