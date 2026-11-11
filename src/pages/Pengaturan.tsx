import { useState, useEffect } from 'react'
import {
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  ShieldAlert,
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
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Pengaturan & Data Pribadi
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Kelola preferensi tema dan cadangkan catatan serta bookmark soalmu.
        </p>
      </div>

      {/* Required Spec Warning Notice */}
      <div
        className="p-4 rounded-xl border flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 text-xs leading-relaxed"
      >
        <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <strong className="block font-bold mb-0.5">Catatan Privasi:</strong>
          Data pribadi (bookmark, catatan soal, dan riwayat latihan) tersimpan di browser ini tanpa perlu akun login, dan akan hilang jika data cache/situs browser kamu dibersihkan. Gunakan fitur ekspor JSON di bawah untuk mencadangkan.
        </div>
      </div>

      {/* Data Stats Summary */}
      <div
        className="p-4 rounded-xl border flex items-center justify-around text-center text-xs"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div>
          <span className="font-bold text-lg block" style={{ color: 'var(--color-accent)' }}>
            {bookmarkCount}
          </span>
          <span className="text-gray-500">Soal Ditandai</span>
        </div>
        <div className="w-px h-8 bg-gray-200 dark:bg-neutral-800" />
        <div>
          <span className="font-bold text-lg block" style={{ color: 'var(--color-accent)' }}>
            {noteCount}
          </span>
          <span className="text-gray-500">Catatan Pribadi</span>
        </div>
        <div className="w-px h-8 bg-gray-200 dark:bg-neutral-800" />
        <div>
          <span className="font-bold text-lg block" style={{ color: 'var(--color-accent)' }}>
            {practiceCount}
          </span>
          <span className="text-gray-500">Sesi Latihan</span>
        </div>
      </div>

      {/* Preferences Section */}
      <div
        className="p-4 rounded-xl border flex flex-col gap-3"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          Preferensi Tampilan
        </h2>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="font-semibold text-xs block" style={{ color: 'var(--color-text)' }}>
              Tema Gelap (Dark Mode)
            </span>
            <span className="text-[11px] text-gray-500">
              {isDark ? 'Mode gelap aktif' : 'Mode terang aktif'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleDark}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? 'Beralih ke Terang' : 'Beralih ke Gelap'}</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div
        className="p-4 rounded-xl border flex flex-col gap-4"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          Cadangkan & Pulihkan Data (JSON)
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            className="w-full sm:w-auto flex-1 h-11 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Download size={15} />
            <span>Ekspor Data Saya (JSON)</span>
          </button>

          <label
            className="w-full sm:w-auto flex-1 h-11 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
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

        <p className="text-[11px] text-gray-400">
          File JSON dapat kamu simpan di HP atau Google Drive untuk dipindahkan ke perangkat lain sewaktu-waktu.
        </p>
      </div>

      {/* Danger Zone: Reset Data */}
      <div
        className="p-4 rounded-xl border border-red-200 dark:border-red-950 flex flex-col gap-3"
        style={{
          backgroundColor: 'var(--color-card)',
        }}
      >
        <h2 className="text-sm font-bold text-red-600 dark:text-red-400">
          Hapus Data Lokal
        </h2>
        <p className="text-xs text-gray-500">
          Bersihkan seluruh riwayat latihan, catatan, dan soal yang ditandai dari browser perangkat ini.
        </p>

        <div>
          <button
            type="button"
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Hapus Semua Data Browser</span>
          </button>
        </div>
      </div>
    </div>
  )
}
