import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Plus,
  BookOpen,
  Sparkles,
  Filter,
  User,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Course, Material } from '@/lib/types'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { MaterialProposalForm } from '@/components/materials/MaterialProposalForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { getStudiedMaterialsCount } from '@/lib/storage'

export function BelajarCourse() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [studiedCount, setStudiedCount] = useState(0)

  // Filters
  const [selectedTopik, setSelectedTopik] = useState('semua')
  const [selectedJenis, setSelectedJenis] = useState('semua')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchCourseData = async () => {
    if (!courseId) return
    setLoading(true)

    const [courseRes, matRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase
        .from('materials')
        .select('*, courses(*)')
        .eq('course_id', courseId)
        .eq('status', 'disetujui')
        .order('dibuat_pada', { ascending: false }),
    ])

    if (courseRes.data) setCourse(courseRes.data)
    if (matRes.data) {
      setMaterials(matRes.data)
      setStudiedCount(getStudiedMaterialsCount(matRes.data.map((m) => m.id)))
    }
    setLoading(false)
  }

  const handleProgressChange = () => {
    setStudiedCount(getStudiedMaterialsCount(materials.map((m) => m.id)))
  }

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Mata kuliah tidak ditemukan.
        </p>
        <Link to="/belajar" className="text-xs text-[var(--color-accent)] underline mt-2 block">
          Kembali ke Pusat Belajar
        </Link>
      </div>
    )
  }

  // Calculate personal material progress
  const progressPercent = materials.length > 0 ? Math.round((studiedCount / materials.length) * 100) : 0

  // Filter materials
  const availableTopics = Array.from(new Set(materials.map((m) => m.topik).filter(Boolean)))
  const filteredMaterials = materials.filter((m) => {
    if (selectedTopik !== 'semua' && m.topik !== selectedTopik) return false
    if (selectedJenis !== 'semua' && m.jenis !== selectedJenis) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Course Header */}
      <div>
        <Link
          to="/belajar"
          className="inline-flex items-center gap-1 text-xs font-semibold mb-2 hover:underline"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ChevronLeft size={16} />
          <span>Kembali ke Semua Matkul</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-accent)',
                }}
              >
                {course.kode}
              </span>
              {course.dosen && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <User size={12} />
                  <span>{course.dosen}</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--color-text)' }}>
              {course.nama}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/latihan?courseId=${course.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Sparkles size={15} />
              <span>Mulai Latihan Soal</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Plus size={15} />
              <span>Usulkan Materi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Material Progress Tracker (Phase 4) */}
      {materials.length > 0 && (
        <div
          className="p-4 rounded-xl border flex flex-col gap-2"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Progres Belajar Materi:</span>
            </span>
            <span className="font-bold text-[var(--color-accent)] font-mono">
              {studiedCount} / {materials.length} Selesai ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%`, backgroundColor: '#10b981' }}
            />
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div
        className="p-3.5 rounded-xl border flex items-center justify-between gap-3 flex-wrap text-xs"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Filter:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedTopik}
            onChange={(e) => setSelectedTopik(e.target.value)}
            className="h-8 px-2 rounded-md border bg-transparent font-medium"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="semua" className="dark:bg-neutral-900">Semua Topik</option>
            {availableTopics.map((topik) => (
              <option key={topik} value={topik} className="dark:bg-neutral-900">
                Topik: {topik}
              </option>
            ))}
          </select>

          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="h-8 px-2 rounded-md border bg-transparent font-medium"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="semua" className="dark:bg-neutral-900">Semua Jenis</option>
            <option value="slide" className="dark:bg-neutral-900">Slide</option>
            <option value="pdf" className="dark:bg-neutral-900">PDF</option>
            <option value="video" className="dark:bg-neutral-900">Video</option>
            <option value="catatan" className="dark:bg-neutral-900">Catatan</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={30} className="opacity-40" />}
          title="Belum ada materi yang sesuai"
          description="Jadilah yang pertama mengusulkan slide, catatan kuliah, atau rekaman video untuk mata kuliah ini."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredMaterials.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              onProgressChange={handleProgressChange}
            />
          ))}
        </div>
      )}

      {/* Material Proposal Modal */}
      <MaterialProposalForm
        courseId={course.id}
        courseName={course.nama}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCourseData}
      />
    </div>
  )
}
