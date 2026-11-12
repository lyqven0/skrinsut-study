import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  BookOpen,
  Calendar,
  GraduationCap,
  HelpCircle,
  AlertTriangle,
  Award,
  ArrowRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminDashboard() {
  const [counts, setCounts] = useState({
    pendingAnnouncements: 0,
    pendingMaterials: 0,
    totalQuestions: 0,
    newReports: 0,
    courses: 0,
    schedules: 0,
    exams: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)

      const [
        { count: pendingAnn },
        { count: pendingMat },
        { count: questionsCount },
        { count: reportsCount },
        { count: coursesCount },
        { count: schedulesCount },
        { count: examsCount },
      ] = await Promise.all([
        supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('status', 'menunggu'),
        supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'menunggu'),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('question_reports').select('*', { count: 'exact', head: true }).eq('status', 'baru'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('class_schedules').select('*', { count: 'exact', head: true }),
        supabase.from('exams').select('*', { count: 'exact', head: true }),
      ])

      setCounts({
        pendingAnnouncements: pendingAnn || 0,
        pendingMaterials: pendingMat || 0,
        totalQuestions: questionsCount || 0,
        newReports: reportsCount || 0,
        courses: coursesCount || 0,
        schedules: schedulesCount || 0,
        exams: examsCount || 0,
      })

      setLoading(false)
    }

    loadStats()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          Ringkasan Admin Kelas
        </h1>
        <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Pantau usulan tugas & materi dari teman sekelas serta kelola bank soal perkuliahan.
        </p>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Announcements */}
        <div
          className="liquid-glass-card p-5 flex flex-col justify-between gap-3 relative overflow-hidden"
          style={{
            borderLeft: counts.pendingAnnouncements > 0 ? '4px solid #f59e0b' : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Usulan Tugas
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : counts.pendingAnnouncements}
          </div>
          <Link
            to="/admin/pengumuman"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline w-fit"
          >
            <span>Tinjau Usulan</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Pending Materials */}
        <div
          className="liquid-glass-card p-5 flex flex-col justify-between gap-3 relative overflow-hidden"
          style={{
            borderLeft: counts.pendingMaterials > 0 ? '4px solid #f59e0b' : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Usulan Materi
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : counts.pendingMaterials}
          </div>
          <Link
            to="/admin/materi"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline w-fit"
          >
            <span>Tinjau Materi</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Total Questions */}
        <div className="liquid-glass-card p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Bank Soal
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-[var(--color-accent)] border border-blue-500/20">
              <HelpCircle size={16} />
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : counts.totalQuestions}
          </div>
          <Link
            to="/admin/soal"
            className="text-xs font-bold flex items-center gap-1 hover:underline w-fit"
            style={{ color: 'var(--color-accent)' }}
          >
            <span>Kelola Soal</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Question Reports */}
        <div
          className="liquid-glass-card p-5 flex flex-col justify-between gap-3 relative overflow-hidden"
          style={{
            borderLeft: counts.newReports > 0 ? '4px solid #ef4444' : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Laporan Soal
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : counts.newReports}
          </div>
          <Link
            to="/admin/laporan-soal"
            className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline w-fit"
          >
            <span>Lihat Laporan</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Courses */}
        <div className="liquid-glass-card p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Mata Kuliah
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-[var(--color-accent)] border border-blue-500/20">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : counts.courses}
          </div>
          <Link
            to="/admin/mata-kuliah"
            className="text-xs font-bold flex items-center gap-1 hover:underline w-fit"
            style={{ color: 'var(--color-accent)' }}
          >
            <span>Kelola</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Class Schedules */}
        <div className="liquid-glass-card p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Jadwal Kuliah
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-[var(--color-accent)] border border-blue-500/20">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : counts.schedules}
          </div>
          <Link
            to="/admin/jadwal"
            className="text-xs font-bold flex items-center gap-1 hover:underline w-fit"
            style={{ color: 'var(--color-accent)' }}
          >
            <span>Kelola</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Exam Schedules */}
        <div className="liquid-glass-card p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Jadwal Ujian
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-[var(--color-accent)] border border-blue-500/20">
              <Award size={16} />
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {loading ? '...' : counts.exams}
          </div>
          <Link
            to="/admin/ujian"
            className="text-xs font-bold flex items-center gap-1 hover:underline w-fit"
            style={{ color: 'var(--color-accent)' }}
          >
            <span>Kelola Ujian</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
