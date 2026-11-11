import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, FileText, BookOpen, GraduationCap, HelpCircle, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement, Course, Material, Question } from '@/lib/types'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function Cari() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (!query.trim()) {
      setAnnouncements([])
      setCourses([])
      setMaterials([])
      setQuestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const q = `%${query.trim()}%`

      const [annRes, courseRes, matRes, qRes] = await Promise.all([
        supabase
          .from('announcements')
          .select('*, courses(*)')
          .eq('status', 'disetujui')
          .or(`judul.ilike.${q},catatan.ilike.${q}`)
          .limit(5),
        supabase
          .from('courses')
          .select('*')
          .or(`nama.ilike.${q},kode.ilike.${q}`)
          .limit(5),
        supabase
          .from('materials')
          .select('*, courses(*)')
          .eq('status', 'disetujui')
          .or(`judul.ilike.${q},topik.ilike.${q},catatan.ilike.${q}`)
          .limit(5),
        supabase
          .from('questions')
          .select('*, courses(*)')
          .or(`pertanyaan.ilike.${q},topik.ilike.${q}`)
          .limit(5),
      ])

      if (annRes.data) setAnnouncements(annRes.data)
      if (courseRes.data) setCourses(courseRes.data)
      if (matRes.data) setMaterials(matRes.data)
      if (qRes.data) setQuestions(qRes.data)

      setLoading(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const totalResults = announcements.length + courses.length + materials.length + questions.length

  return (
    <div className="flex flex-col gap-5">
      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari tugas, mata kuliah, materi, atau bank soal..."
          className="w-full h-13 pl-11 pr-4 rounded-2xl border border-white/60 dark:border-white/10 liquid-glass focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm text-slate-900 dark:text-slate-100 shadow-sm"
          autoFocus
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : !query.trim() ? (
        <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
          Ketik kata kunci untuk mencari tugas, mata kuliah, materi, atau bank soal.
        </div>
      ) : totalResults === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tidak ada hasil untuk &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs mt-1">Coba kata kunci lain atau periksa ejaan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Courses matches */}
          {courses.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <BookOpen size={14} className="text-blue-500" />
                <span>Mata Kuliah ({courses.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((c) => (
                  <Link
                    key={c.id}
                    to={`/belajar/${c.id}`}
                    className="liquid-glass-card p-4 rounded-xl flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[var(--color-accent)] transition-colors">
                        {c.nama}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {c.kode} {c.dosen && `• ${c.dosen}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Announcements matches */}
          {announcements.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                <FileText size={14} />
                <span>Pengumuman Tugas ({announcements.length})</span>
              </div>
              <div className="flex flex-col gap-3">
                {announcements.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
            </div>
          )}

          {/* Materials matches */}
          {materials.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                <GraduationCap size={14} />
                <span>Materi Pembelajaran ({materials.length})</span>
              </div>
              <div className="flex flex-col gap-2">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--color-accent)]">
                        {m.courses?.nama} • {m.topik}
                      </span>
                      <h4 className="font-bold text-sm mt-0.5" style={{ color: 'var(--color-text)' }}>
                        {m.judul}
                      </h4>
                    </div>
                    {m.tautan && (
                      <a
                        href={m.tautan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[var(--color-accent)] hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Buka</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions matches */}
          {questions.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                <HelpCircle size={14} />
                <span>Bank Soal ({questions.length})</span>
              </div>
              <div className="flex flex-col gap-2">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg border flex flex-col gap-1"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <span className="text-[10px] uppercase font-bold text-[var(--color-accent)]">
                      {q.courses?.nama} • {q.topik}
                    </span>
                    <p className="text-xs font-medium line-clamp-2" style={{ color: 'var(--color-text)' }}>
                      {q.pertanyaan}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
