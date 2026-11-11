import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, User, ChevronRight, GraduationCap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export function Belajar() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      const { data } = await supabase.from('courses').select('*').order('nama')
      if (data) setCourses(data)
      setLoading(false)
    }

    fetchCourses()
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Pusat Belajar
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Pilih mata kuliah untuk mengakses materi catatan, slide, dan latihan soal.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={32} className="opacity-40" />}
          title="Belum ada mata kuliah"
          description="Admin belum menambahkan mata kuliah untuk kelas ini."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/belajar/${course.id}`}
              className="p-4 rounded-xl border flex items-center justify-between gap-3 transition-all hover:shadow-md cursor-pointer group"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  <BookOpen size={18} />
                </div>
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {course.kode}
                  </span>
                  <h3 className="font-bold text-base mt-1 group-hover:text-[var(--color-accent)] transition-colors" style={{ color: 'var(--color-text)' }}>
                    {course.nama}
                  </h3>
                  {course.dosen && (
                    <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      <User size={12} />
                      <span>{course.dosen}</span>
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:translate-x-1 transition-transform shrink-0"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


