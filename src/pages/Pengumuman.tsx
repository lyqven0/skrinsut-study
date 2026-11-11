import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement } from '@/lib/types'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { ProposalForm } from '@/components/announcements/ProposalForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export function Pengumuman() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchAnnouncements = async () => {
    setLoading(true)
    const nowIso = new Date().toISOString()

    const { data } = await supabase
      .from('announcements')
      .select('*, courses(*)')
      .eq('status', 'disetujui')
      .gte('deadline', nowIso)
      .order('deadline', { ascending: true })

    if (data) setAnnouncements(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Papan Pengumuman Tugas
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Daftar tugas aktif yang sudah disetujui admin, diurutkan dari deadline terdekat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Plus size={16} />
          <span>Usulkan Tugas</span>
        </button>
      </div>

      {/* Main List / State */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
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
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        style={{ backgroundColor: 'var(--color-accent)' }}
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

