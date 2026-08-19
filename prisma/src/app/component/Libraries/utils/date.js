export function formatIndonesianRange(range) {
  if (!range?.from) return ""

  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const parseDate = (d) => (d instanceof Date ? d : new Date(d))

  const from = formatter.format(parseDate(range.from))

  if (!range.to) return from

  const to = formatter.format(parseDate(range.to))

  return `${from} hingga ${to}`
}

export function formatToPHPDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatIndonesianDate(dateString) {
  if (!dateString) return "-"
  const cleaned = dateString.replace(/\.\d+Z$/, 'Z')
  const date = new Date(cleaned)

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta"
  }).format(date)
}

export function relativeTime(isoString) {
  if (!isoString) return ""
  const now = new Date()
  const then = new Date(isoString)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 1) return `${diffDay} hari lalu`
  if (diffDay === 1) return "Kemarin"
  if (diffHour > 0) return `${diffHour} jam lalu`
  if (diffMin > 0) return `${diffMin} menit lalu`
  return "Baru saja"
}

export function formatTime(isoString) {
  if (!isoString) return ""
  return new Date(isoString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}