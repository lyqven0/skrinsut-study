import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'

// Public Pages
import { Beranda } from '@/pages/Beranda'
import { Pengumuman } from '@/pages/Pengumuman'
import { Jadwal } from '@/pages/Jadwal'
import { Belajar } from '@/pages/Belajar'
import { BelajarCourse } from '@/pages/BelajarCourse'
import { Latihan } from '@/pages/Latihan'
import { Simulasi } from '@/pages/Simulasi'
import { Cari } from '@/pages/Cari'
import { Pengaturan } from '@/pages/Pengaturan'

// Admin Pages
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AnnouncementQueue } from '@/pages/admin/AnnouncementQueue'
import { MaterialQueue } from '@/pages/admin/MaterialQueue'
import { ManageQuestions } from '@/pages/admin/ManageQuestions'
import { QuestionReportQueue } from '@/pages/admin/QuestionReportQueue'
import { ManageCourses } from '@/pages/admin/ManageCourses'
import { ManageSchedules } from '@/pages/admin/ManageSchedules'
import { ManageExams } from '@/pages/admin/ManageExams'
import { QuestionStats } from '@/pages/admin/QuestionStats'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Beranda />} />
            <Route path="/pengumuman" element={<Pengumuman />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/belajar" element={<Belajar />} />
            <Route path="/belajar/:courseId" element={<BelajarCourse />} />
            <Route path="/latihan" element={<Latihan />} />
            <Route path="/simulasi" element={<Simulasi />} />
            <Route path="/cari" element={<Cari />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pengumuman" element={<AnnouncementQueue />} />
            <Route path="materi" element={<MaterialQueue />} />
            <Route path="soal" element={<ManageQuestions />} />
            <Route path="laporan-soal" element={<QuestionReportQueue />} />
            <Route path="mata-kuliah" element={<ManageCourses />} />
            <Route path="jadwal" element={<ManageSchedules />} />
            <Route path="ujian" element={<ManageExams />} />
            <Route path="statistik-soal" element={<QuestionStats />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
