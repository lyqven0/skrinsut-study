import { useState } from 'react'
import { FileText, Video, BookOpen, ExternalLink, User, Calendar, CheckSquare, Square } from 'lucide-react'
import type { Material } from '@/lib/types'
import { formatTanggal } from '@/lib/utils'
import { isMaterialStudied, toggleMaterialStudied } from '@/lib/storage'

interface MaterialCardProps {
  material: Material
  onProgressChange?: () => void
}

export function MaterialCard({ material, onProgressChange }: MaterialCardProps) {
  const [studied, setStudied] = useState(() => isMaterialStudied(material.id))

  const handleToggle = () => {
    const newState = toggleMaterialStudied(material.id)
    setStudied(newState)
    onProgressChange?.()
  }

  const iconMap = {
    slide: BookOpen,
    pdf: FileText,
    video: Video,
    catatan: FileText,
  }

  const IconComponent = iconMap[material.jenis] || FileText

  const typeLabels = {
    slide: 'Slide Presentasi',
    pdf: 'Dokumen PDF',
    video: 'Video Pembelajaran',
    catatan: 'Catatan / Ringkasan',
  }

  return (
    <div
      className={`p-4 rounded-xl border flex flex-col gap-3 transition-all hover:shadow-sm ${
        studied ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10' : ''
      }`}
      style={{
        backgroundColor: studied ? undefined : 'var(--color-card)',
        borderColor: studied ? undefined : 'var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border)',
            }}
          >
            <IconComponent size={13} />
            <span>{typeLabels[material.jenis] || material.jenis}</span>
          </span>

          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Topik: {material.topik}
          </span>
        </div>

        {/* Studied Checklist Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
            studied
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'border-gray-200 dark:border-neutral-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'
          }`}
          title="Tandai sudah atau belum dipelajari"
        >
          {studied ? <CheckSquare size={14} className="text-emerald-600" /> : <Square size={14} />}
          <span>{studied ? 'Sudah Dipelajari' : 'Belum Dipelajari'}</span>
        </button>
      </div>

      <div>
        <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--color-text)' }}>
          {material.judul}
        </h3>
        {material.catatan && (
          <p className="text-xs sm:text-sm mt-1 whitespace-pre-line text-gray-600 dark:text-gray-300">
            {material.catatan}
          </p>
        )}
      </div>

      <div
        className="pt-2 mt-auto flex items-center justify-between border-t text-xs flex-wrap gap-2"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <div className="flex items-center gap-3">
          {material.ditambahkan_oleh && (
            <span className="flex items-center gap-1">
              <User size={12} />
              <span>{material.ditambahkan_oleh}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatTanggal(material.dibuat_pada)}</span>
          </span>
        </div>

        {material.tautan && (
          <a
            href={material.tautan}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <span>Buka Materi</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  )
}
