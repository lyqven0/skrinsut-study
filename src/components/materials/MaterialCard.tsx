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
      className={`liquid-glass-card p-5 rounded-2xl flex flex-col gap-3.5 group relative overflow-hidden transition-all duration-300 ${
        studied
          ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-[0_4px_20px_rgba(16,185,129,0.12)]'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 backdrop-blur-md">
            <IconComponent size={13} className="stroke-[2.2]" />
            <span>{typeLabels[material.jenis] || material.jenis}</span>
          </span>

          <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-200/50 dark:bg-white/[0.05] border border-slate-300/40 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 backdrop-blur-sm">
            Topik: {material.topik}
          </span>
        </div>

        {/* Studied Checklist Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
            studied
              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
              : 'border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10'
          }`}
          title="Tandai sudah atau belum dipelajari"
        >
          {studied ? <CheckSquare size={14} className="text-emerald-600 dark:text-emerald-400 stroke-[2.2]" /> : <Square size={14} />}
          <span>{studied ? 'Sudah Dipelajari' : 'Belum Dipelajari'}</span>
        </button>
      </div>

      <div>
        <h3 className="font-bold text-base leading-snug text-slate-900 dark:text-slate-100">
          {material.judul}
        </h3>
        {material.catatan && (
          <p className="text-xs sm:text-sm mt-1.5 whitespace-pre-line text-slate-600 dark:text-slate-300 leading-relaxed">
            {material.catatan}
          </p>
        )}
      </div>

      <div className="pt-3 mt-auto flex items-center justify-between border-t border-slate-200/60 dark:border-white/[0.08] text-xs flex-wrap gap-2 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          {material.ditambahkan_oleh && (
            <span className="flex items-center gap-1">
              <User size={12} className="shrink-0 text-slate-400" />
              <span>{material.ditambahkan_oleh}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} className="shrink-0 text-slate-400" />
            <span>{formatTanggal(material.dibuat_pada)}</span>
          </span>
        </div>

        {material.tautan && (
          <a
            href={material.tautan}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-button-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            <span>Buka Materi</span>
            <ExternalLink size={13} className="stroke-[2.2]" />
          </a>
        )}
      </div>
    </div>
  )
}
