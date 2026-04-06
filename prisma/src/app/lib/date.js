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
  const date = new Date(dateString)

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date)
}