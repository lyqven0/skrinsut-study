// LocalStorage management helper for personal client-side data
// Strictly resilient with try/catch wrapping

export interface PersonalData {
  bookmarks: string[] // question_ids
  notes: Record<string, string> // question_id -> personal note
  practiceHistory: Array<{
    date: string
    courseId: string
    total: number
    score: number
  }>
  studiedMaterials: string[] // material_ids marked as studied (Phase 4)
  theme?: 'light' | 'dark'
}

const STORAGE_KEY = 'skrinsut_personal_data'

export function getPersonalData(): PersonalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        bookmarks: [],
        notes: {},
        practiceHistory: [],
        studiedMaterials: [],
      }
    }
    const parsed = JSON.parse(raw)
    return {
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      notes: typeof parsed.notes === 'object' && parsed.notes !== null ? parsed.notes : {},
      practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
      studiedMaterials: Array.isArray(parsed.studiedMaterials) ? parsed.studiedMaterials : [],
      theme: parsed.theme,
    }
  } catch {
    return {
      bookmarks: [],
      notes: {},
      practiceHistory: [],
      studiedMaterials: [],
    }
  }
}

export function savePersonalData(data: PersonalData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Fails silently if quota exceeded or disabled in private browsing
  }
}

// -------------------------------------------------------------
// Bookmark Operations
// -------------------------------------------------------------
export function toggleQuestionBookmark(questionId: string): boolean {
  const data = getPersonalData()
  const exists = data.bookmarks.includes(questionId)
  if (exists) {
    data.bookmarks = data.bookmarks.filter((id) => id !== questionId)
  } else {
    data.bookmarks.push(questionId)
  }
  savePersonalData(data)
  return !exists
}

export function isQuestionBookmarked(questionId: string): boolean {
  const data = getPersonalData()
  return data.bookmarks.includes(questionId)
}

// -------------------------------------------------------------
// Question Notes
// -------------------------------------------------------------
export function saveQuestionNote(questionId: string, note: string): void {
  const data = getPersonalData()
  if (!note.trim()) {
    delete data.notes[questionId]
  } else {
    data.notes[questionId] = note.trim()
  }
  savePersonalData(data)
}

export function getQuestionNote(questionId: string): string {
  const data = getPersonalData()
  return data.notes[questionId] || ''
}

// -------------------------------------------------------------
// Material Progress Tracking (Phase 4)
// -------------------------------------------------------------
export function toggleMaterialStudied(materialId: string): boolean {
  const data = getPersonalData()
  const exists = data.studiedMaterials.includes(materialId)
  if (exists) {
    data.studiedMaterials = data.studiedMaterials.filter((id) => id !== materialId)
  } else {
    data.studiedMaterials.push(materialId)
  }
  savePersonalData(data)
  return !exists
}

export function isMaterialStudied(materialId: string): boolean {
  const data = getPersonalData()
  return data.studiedMaterials.includes(materialId)
}

export function getStudiedMaterialsCount(materialIds: string[]): number {
  const data = getPersonalData()
  return materialIds.filter((id) => data.studiedMaterials.includes(id)).length
}

// -------------------------------------------------------------
// Export & Import Backup (JSON)
// -------------------------------------------------------------
export function exportPersonalDataJson(): void {
  const data = getPersonalData()
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `skrinsut_study_backup_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importPersonalDataJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr)
    if (typeof parsed !== 'object' || parsed === null) return false
    savePersonalData({
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      notes: typeof parsed.notes === 'object' && parsed.notes !== null ? parsed.notes : {},
      practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
      studiedMaterials: Array.isArray(parsed.studiedMaterials) ? parsed.studiedMaterials : [],
      theme: parsed.theme,
    })
    return true
  } catch {
    return false
  }
}

export function clearPersonalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('theme')
  } catch {}
}
