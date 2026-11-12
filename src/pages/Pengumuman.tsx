import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement } from '@/lib/types'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { ProposalForm } from '@/components/announcements/ProposalForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { MOCK_ANNOUNCEMENTS } from '@/lib/mockData'

export function Pengumuman() {
  const { showToast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(localStorage.getItem('skrinsut_admin_auth') === 'true')
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    const nowIso = new Date().toISOString()
    const isPlaceholder = import.meta.env.VITE_SUPABASE_URL?.includes('placeholder')

    const { data, error } = await supabase
      .from('announcements')
      .select('*, courses(*)')
      .eq('status', 'disetujui')
      .gte('deadline', nowIso)
      .order('deadline', { ascending: true })

    if (!error && data !== null) {
      if (isPlaceholder && data.length === 0) {
        setAnnouncements(MOCK_ANNOUNCEMENTS)
      } else {
        setAnnouncements(data)
      }
    } else {
      setAnnouncements(MOCK_ANNOUNCEMENTS)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengumuman tugas ini?')) return

    if (id.startsWith('ann-')) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      showToast('Pengumuman tugas berhasil dihapus.', 'success')
      return
    }

    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error')
    } else {
      showToast('Pengumuman tugas berhasil dihapus.', 'success')
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Papan Pengumuman Tugas
          </h1>
          <p className="text-xs sm:text-sm mt-0.5 text-slate-500 dark:text-slate-400">
            Daftar tugas aktif yang sudah disetujui admin, diurutkan dari deadline terdekat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white liquid-button-primary cursor-pointer"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>Usulkan Tugas</span>
        </button>
      </div>

      {/* Main List / State */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">🎉</span>}
          title="Belum ada tugas, aman dulu 😌"
          description="Tidak ada tugas aktif saat ini. Kamu bisa mengusulkan tugas baru jika dosen baru saja memberi tugas."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white liquid-button-primary shadow-[0_8px_25px_rgba(79,110,247,0.5)] cursor-pointer"
        aria-label="Usulkan Tugas Baru"
      >
        <Plus size={24} className="stroke-[2.5]" />
      </button>

      {/* Proposal Modal Form */}
      <ProposalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchAnnouncements}
      />
    </div>
  )
}

