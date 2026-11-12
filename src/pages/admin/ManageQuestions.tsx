import { useState, useEffect } from 'react'
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  X,
  HelpCircle,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Question, Course } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'

export function ManageQuestions() {
  const { showToast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('semua')
  const [loading, setLoading] = useState(true)

  // Single Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [courseId, setCourseId] = useState('')
  const [topik, setTopik] = useState('')
  const [pertanyaan, setPertanyaan] = useState('')
  const [opsiA, setOpsiA] = useState('')
  const [opsiB, setOpsiB] = useState('')
  const [opsiC, setOpsiC] = useState('')
  const [opsiD, setOpsiD] = useState('')
  const [kunci, setKunci] = useState<'a' | 'b' | 'c' | 'd'>('a')
  const [pembahasan, setPembahasan] = useState('')
  const [sumber, setSumber] = useState('')
  const [tahun, setTahun] = useState<number | ''>(new Date().getFullYear())
  const [saving, setSaving] = useState(false)

  // CSV Import State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [importing, setImporting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [qRes, cRes] = await Promise.all([
      supabase.from('questions').select('*, courses(*)').order('id', { ascending: false }),
      supabase.from('courses').select('*').order('nama'),
    ])

    if (qRes.data) setQuestions(qRes.data)
    if (cRes.data) {
      setCourses(cRes.data)
      if (!courseId && cRes.data.length > 0) {
        setCourseId(cRes.data[0].id)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setTopik('')
    setPertanyaan('')
    setOpsiA('')
    setOpsiB('')
    setOpsiC('')
    setOpsiD('')
    setKunci('a')
    setPembahasan('')
    setSumber('')
    setTahun(new Date().getFullYear())
    setIsModalOpen(true)
  }

  const openEditModal = (q: Question) => {
    setEditingId(q.id)
    setCourseId(q.course_id)
    setTopik(q.topik)
    setPertanyaan(q.pertanyaan)
    setOpsiA(q.opsi_a)
    setOpsiB(q.opsi_b)
    setOpsiC(q.opsi_c)
    setOpsiD(q.opsi_d)
    setKunci(q.kunci)
    setPembahasan(q.pembahasan || '')
    setSumber(q.sumber || '')
    setTahun(q.tahun || '')
    setIsModalOpen(true)
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !topik.trim() || !pertanyaan.trim() || !opsiA.trim() || !opsiB.trim() || !opsiC.trim() || !opsiD.trim()) {
      showToast('Harap lengkapi semua bidang pertanyaan dan opsi A-D.', 'error')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      course_id: courseId,
      topik: topik.trim(),
      pertanyaan: pertanyaan.trim(),
      opsi_a: opsiA.trim(),
      opsi_b: opsiB.trim(),
      opsi_c: opsiC.trim(),
      opsi_d: opsiD.trim(),
      kunci,
      pembahasan: pembahasan.trim() || null,
      sumber: sumber.trim() || null,
      tahun: tahun ? Number(tahun) : null,
      diverifikasi_oleh: user?.email || 'admin',
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('questions').update(payload).eq('id', editingId)
        if (error) throw error
        showToast('Soal berhasil diperbarui!', 'success')
      } else {
        const { error } = await supabase.from('questions').insert([payload])
        if (error) throw error
        showToast('Soal baru berhasil ditambahkan!', 'success')
      }

      setIsModalOpen(false)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan soal.'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus soal ini?')) return
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error')
    } else {
      showToast('Soal berhasil dihapus.', 'success')
      fetchData()
    }
  }

  // -------------------------------------------------------------
  // CSV TEMPLATE DOWNLOAD & PARSING
  // -------------------------------------------------------------
  const downloadCsvTemplate = () => {
    const header = 'mata_kuliah,topik,pertanyaan,opsi_a,opsi_b,opsi_c,opsi_d,kunci,pembahasan,sumber,tahun\n'
    const example = '"Basis Data","SQL Dasar","Perintah untuk membaca data tabel adalah...","SELECT","INSERT","UPDATE","DELETE","a","SELECT digunakan untuk query data","UAS 2023",2023\n'
    const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'template_soal_skrinsut_study.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      parseCsv(text)
    }
    reader.readAsText(file)
  }

  // Simple CSV parser handling quotes
  const parseCsv = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length < 2) {
      setCsvErrors(['File CSV kosong atau tidak memiliki baris data.'])
      return
    }

    const rows: any[] = []
    const errors: string[] = []

    // regex for splitting CSV taking quotes into account
    const parseLine = (line: string) => {
      const result: string[] = []
      let insideQuote = false
      let current = ''
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          insideQuote = !insideQuote
        } else if (char === ',' && !insideQuote) {
          result.push(current.trim().replace(/^"|"$/g, ''))
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''))
      return result
    }

    const dataLines = lines.slice(1) // skip header
    dataLines.forEach((line, idx) => {
      const cols = parseLine(line)
      if (cols.length < 8) {
        errors.push(`Baris ${idx + 2}: Kolom kurang lengkap (minimal 8 kolom sampai kunci jawaban).`)
        return
      }

      const [mkName, topik, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci, pembahasan, sumber, tahun] = cols

      // Find matching course
      const matchedCourse = courses.find(
        (c) => c.nama.toLowerCase() === mkName.toLowerCase() || c.kode.toLowerCase() === mkName.toLowerCase()
      )

      if (!matchedCourse) {
        errors.push(`Baris ${idx + 2}: Mata kuliah "${mkName}" tidak ditemukan di daftar mata kuliah.`)
      }

      const cleanKunci = kunci.toLowerCase().trim()
      if (!['a', 'b', 'c', 'd'].includes(cleanKunci)) {
        errors.push(`Baris ${idx + 2}: Kunci jawaban harus 'a', 'b', 'c', atau 'd' (ditemukan: "${kunci}").`)
      }

      rows.push({
        course_id: matchedCourse?.id || null,
        course_name: matchedCourse?.nama || mkName,
        topik,
        pertanyaan,
        opsi_a,
        opsi_b,
        opsi_c,
        opsi_d,
        kunci: cleanKunci,
        pembahasan: pembahasan || null,
        sumber: sumber || null,
        tahun: tahun ? parseInt(tahun) || null : null,
      })
    })

    setCsvPreview(rows)
    setCsvErrors(errors)
  }

  const handleImportCsvSubmit = async () => {
    if (csvErrors.length > 0) {
      showToast('Perbaiki error validasi CSV sebelum mengimpor.', 'error')
      return
    }

    const validRows = csvPreview.filter((r) => r.course_id && ['a', 'b', 'c', 'd'].includes(r.kunci))
    if (validRows.length === 0) {
      showToast('Tidak ada data valid untuk diimpor.', 'error')
      return
    }

    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()

    const payloads = validRows.map((r) => ({
      course_id: r.course_id,
      topik: r.topik,
      pertanyaan: r.pertanyaan,
      opsi_a: r.opsi_a,
      opsi_b: r.opsi_b,
      opsi_c: r.opsi_c,
      opsi_d: r.opsi_d,
      kunci: r.kunci,
      pembahasan: r.pembahasan,
      sumber: r.sumber,
      tahun: r.tahun,
      diverifikasi_oleh: user?.email || 'admin (import CSV)',
    }))

    const { error } = await supabase.from('questions').insert(payloads)

    if (error) {
      showToast('Gagal mengimpor CSV: ' + error.message, 'error')
    } else {
      showToast(`Berhasil mengimpor ${payloads.length} soal ke bank soal!`, 'success')
      setIsCsvModalOpen(false)
      setCsvPreview([])
      setCsvErrors([])
      fetchData()
    }
    setImporting(false)
  }

  const filteredQuestions = questions.filter((q) => {
    if (selectedCourseFilter !== 'semua' && q.course_id !== selectedCourseFilter) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Kelola Bank Soal
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Soal hanya dapat diinput dan dikelola oleh admin kelas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold liquid-glass-pill border border-white/60 dark:border-white/10 hover:border-blue-400/50 transition-colors cursor-pointer"
            style={{ color: 'var(--color-text)' }}
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="liquid-button-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Satu Soal</span>
          </button>
        </div>
      </div>

      {/* Filter by course */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          Filter Mata Kuliah:
        </span>
        <select
          value={selectedCourseFilter}
          onChange={(e) => setSelectedCourseFilter(e.target.value)}
          className="h-9 px-3 rounded-xl border bg-white/50 dark:bg-black/30 backdrop-blur-sm border-slate-200/60 dark:border-white/10 font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          <option value="semua" className="dark:bg-neutral-900">Semua Mata Kuliah ({questions.length} Soal)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id} className="dark:bg-neutral-900">
              {c.nama} ({c.kode})
            </option>
          ))}
        </select>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="liquid-glass-card p-8 text-center flex flex-col items-center justify-center gap-2.5">
          <HelpCircle size={32} className="opacity-40 text-[var(--color-accent)]" />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Belum ada soal pada mata kuliah ini.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan tombol &ldquo;Tambah Satu Soal&rdquo; atau &ldquo;Import CSV&rdquo; di atas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="liquid-glass-card p-4 sm:p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider liquid-glass-pill bg-blue-500/10 text-[var(--color-accent)] border border-blue-500/20">
                    {q.courses?.nama || 'Mata Kuliah'} • {q.topik}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full liquid-glass-pill bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    Kunci: {q.kunci.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Edit Soal"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus Soal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {q.pertanyaan}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded-lg border ${q.kunci === 'a' ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
                  <strong>A.</strong> {q.opsi_a}
                </div>
                <div className={`p-2 rounded-lg border ${q.kunci === 'b' ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
                  <strong>B.</strong> {q.opsi_b}
                </div>
                <div className={`p-2 rounded-lg border ${q.kunci === 'c' ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
                  <strong>C.</strong> {q.opsi_c}
                </div>
                <div className={`p-2 rounded-lg border ${q.kunci === 'd' ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
                  <strong>D.</strong> {q.opsi_d}
                </div>
              </div>

              {q.pembahasan && (
                <div className="text-xs text-gray-500 bg-gray-50 dark:bg-neutral-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800">
                  <span className="font-semibold block mb-0.5">Pembahasan:</span>
                  {q.pembahasan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* ADD / EDIT SINGLE QUESTION MODAL */}
      {/* --------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 liquid-glass shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08] pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Edit Soal' : 'Tambah Soal Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="flex flex-col gap-3.5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Mata Kuliah <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id} className="dark:bg-neutral-900">
                        {c.nama} ({c.kode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Topik / Bab <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    placeholder="Contoh: Normalisasi"
                    required
                    className="w-full h-10 px-3 rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  rows={3}
                  required
                  placeholder="Tuliskan pertanyaan soal di sini..."
                  className="w-full p-3 rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Options A - D */}
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                  Opsi Jawaban & Kunci <span className="text-red-500">*</span>
                </label>

                {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                  const val = opt === 'a' ? opsiA : opt === 'b' ? opsiB : opt === 'c' ? opsiC : opsiD
                  const setter = opt === 'a' ? setOpsiA : opt === 'b' ? setOpsiB : opt === 'c' ? setOpsiC : setOpsiD

                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setKunci(opt)}
                        className={`w-9 h-9 rounded-lg font-bold text-xs uppercase flex items-center justify-center border shrink-0 transition-colors ${
                          kunci === opt
                            ? 'bg-emerald-500 text-white border-transparent'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'
                        }`}
                        title="Klik untuk memilih ini sebagai kunci jawaban benar"
                      >
                        {opt}
                      </button>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={`Teks Opsi ${opt.toUpperCase()}`}
                        required
                        className="flex-1 h-10 px-3 rounded-lg border bg-transparent"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Pembahasan */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Pembahasan / Penjelasan Jawaban <span className="text-xs font-normal text-gray-500">(opsional)</span>
                </label>
                <textarea
                  value={pembahasan}
                  onChange={(e) => setPembahasan(e.target.value)}
                  rows={2}
                  placeholder="Penjelasan mengapa jawaban tersebut benar..."
                  className="w-full p-3 rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Sumber & Tahun */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Sumber Soal
                  </label>
                  <input
                    type="text"
                    value={sumber}
                    onChange={(e) => setSumber(e.target.value)}
                    placeholder="Contoh: UAS 2023, UTS 2024"
                    className="w-full h-10 px-3 rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                    Tahun
                  </label>
                  <input
                    type="number"
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value ? Number(e.target.value) : '')}
                    placeholder="2024"
                    className="w-full h-10 px-3 rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 rounded-lg font-medium border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 h-10 rounded-lg font-bold text-white flex items-center gap-1.5 shadow-sm"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>Simpan Soal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* CSV IMPORT MODAL WITH PREVIEW & VALIDATION */}
      {/* --------------------------------------------------------- */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl p-6 rounded-3xl border border-white/60 dark:border-white/10 liquid-glass shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={20} style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Import Massal Soal dari CSV
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCsvModalOpen(false)
                  setCsvPreview([])
                  setCsvErrors([])
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-gray-50 dark:bg-neutral-800/50 text-xs">
              <div>
                <span className="font-bold block" style={{ color: 'var(--color-text)' }}>
                  Gunakan format CSV yang sesuai:
                </span>
                <span className="text-gray-500">
                  Kolom: mata_kuliah, topik, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci, pembahasan, sumber, tahun
                </span>
              </div>
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="inline-flex items-center gap-1 font-bold text-[var(--color-accent)] hover:underline shrink-0"
              >
                <Download size={13} />
                <span>Unduh Template CSV</span>
              </button>
            </div>

            {/* File upload input */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Pilih File CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[var(--color-accent)] hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {/* Error notifications */}
            {csvErrors.length > 0 && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex flex-col gap-1 max-h-36 overflow-y-auto">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={15} />
                  <span>Ditemukan {csvErrors.length} kesalahan validasi CSV:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {csvErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview table */}
            {csvPreview.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                  Pratinjau Data ({csvPreview.length} Soal Terdeteksi):
                </span>
                <div className="border rounded-xl overflow-hidden max-h-56 overflow-y-auto text-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100 dark:bg-neutral-800 font-bold text-left">
                      <tr>
                        <th className="p-2 border-b">No</th>
                        <th className="p-2 border-b">Mata Kuliah</th>
                        <th className="p-2 border-b">Topik</th>
                        <th className="p-2 border-b">Pertanyaan</th>
                        <th className="p-2 border-b">Kunci</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-2">{i + 1}</td>
                          <td className="p-2 font-medium">{row.course_name}</td>
                          <td className="p-2">{row.topik}</td>
                          <td className="p-2 truncate max-w-xs">{row.pertanyaan}</td>
                          <td className="p-2 font-bold uppercase">{row.kunci}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
              <button
                type="button"
                onClick={() => {
                  setIsCsvModalOpen(false)
                  setCsvPreview([])
                  setCsvErrors([])
                }}
                className="px-4 h-10 rounded-lg font-medium border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImportCsvSubmit}
                disabled={csvPreview.length === 0 || csvErrors.length > 0 || importing}
                className="px-5 h-10 rounded-lg font-bold text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                {importing && <Loader2 size={14} className="animate-spin" />}
                <span>Impor {csvPreview.length} Soal Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
