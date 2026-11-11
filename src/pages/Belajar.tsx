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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Pusat Belajar
        </h1>
        <p className="text-xs sm:text-sm mt-0.5 text-slate-500 dark:text-slate-400">
          Pilih mata kuliah untuk mengakses materi catatan, slide, dan latihan soal.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={32} className="opacity-40" />}
          title="Belum ada mata kuliah"
          description="Admin belum menambahkan mata kuliah untuk kelas ini."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/belajar/${course.id}`}
              className="liquid-glass-card p-5 rounded-2xl flex items-center justify-between gap-3 group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-[0_4px_16px_rgba(79,110,247,0.35)] bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/20 transition-transform duration-200 group-hover:scale-105">
                  <BookOpen size={19} className="stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 backdrop-blur-md">
                    {course.kode}
                  </span>
                  <h3 className="font-bold text-base mt-1.5 text-slate-900 dark:text-slate-100 group-hover:text-[var(--color-accent)] transition-colors">
                    {course.nama}
                  </h3>
                  {course.dosen && (
                    <div className="flex items-center gap-1.5 text-xs mt-1 text-slate-500 dark:text-slate-400">
                      <User size={12} className="shrink-0 text-slate-400" />
                      <span>{course.dosen}</span>
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight
                size={19}
                className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 stroke-[2.2]"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


