export function formatDeadline(deadline: string, hanyaTanggal: boolean): string {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))

  let target: Date
  if (hanyaTanggal) {
    // Treat as 23:59 WIB that day
    const [year, month, day] = deadline.slice(0, 10).split('-').map(Number)
    target = new Date(year, month - 1, day, 23, 59, 0)
  } else {
    target = new Date(new Date(deadline).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  }

  const diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) return 'Sudah lewat'

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Same calendar day check
  const sameDay =
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate()

  // Tomorrow check
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    tomorrow.getFullYear() === target.getFullYear() &&
    tomorrow.getMonth() === target.getMonth() &&
    tomorrow.getDate() === target.getDate()

  if (sameDay) {
    if (hanyaTanggal) return 'Hari ini'
    if (diffMinutes < 1) return 'Sebentar lagi'
    if (diffMinutes < 60) return `${diffMinutes} menit lagi`
    return `${diffHours} jam lagi`
  }

  if (isTomorrow) return 'Besok'

  if (diffDays <= 7) return `${diffDays} hari lagi`

  const weeks = Math.floor(diffDays / 7)
  if (weeks <= 4) return `${weeks} minggu lagi`

  const months = Math.floor(diffDays / 30)
  return `${months} bulan lagi`
}

export function getUrgencyLevel(deadline: string, hanyaTanggal: boolean): 'green' | 'yellow' | 'red' {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))

  let target: Date
  if (hanyaTanggal) {
    const [year, month, day] = deadline.slice(0, 10).split('-').map(Number)
    target = new Date(year, month - 1, day, 23, 59, 0)
  } else {
    target = new Date(new Date(deadline).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  }

  const diffMs = target.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays <= 1) return 'red'
  if (diffDays <= 3) return 'yellow'
  return 'green'
}

export function formatTanggal(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export function formatJam(mulai: string, selesai: string): string {
  return `${mulai.slice(0, 5)} – ${selesai.slice(0, 5)}`
}

export function getSapaan(): string {
  const jam = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  })
  const h = parseInt(jam)
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function getHariIni(): string {
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  return days[now.getDay()]
}

export function checkCooldown(key: string, seconds: number): boolean {
  try {
    const last = sessionStorage.getItem(`cooldown_${key}`)
    if (last && Date.now() - parseInt(last) < seconds * 1000) return false
    return true
  } catch {
    return true
  }
}

export function setCooldown(key: string): void {
  try {
    sessionStorage.setItem(`cooldown_${key}`, Date.now().toString())
  } catch {}
}
