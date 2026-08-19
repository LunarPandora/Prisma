// utils/pdfPreview.js

import * as pdfjsLib from "pdfjs-dist"
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

/**
 * Generate preview image (first page) from PDF file
 * @param {File} file
 * @param {number} scale (optional, default = 1.5)
 * @returns {Promise<string>} base64 image
 */
export async function generatePDFPreview(file, scale = 1.5) {
  if (!(file instanceof File)) {
    throw new Error("Invalid file")
  }

  const arrayBuffer = await file.arrayBuffer()
  const typedArray = new Uint8Array(arrayBuffer)

  const pdf = await pdfjsLib.getDocument(typedArray).promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale })

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  return canvas.toDataURL("image/png")
}

/**
 * Get total page count from PDF
 */
export async function getPDFPageCount(file) {
  if (!(file instanceof File)) {
    throw new Error("Invalid file")
  }

  const arrayBuffer = await file.arrayBuffer()
  const typedArray = new Uint8Array(arrayBuffer)

  const pdf = await pdfjsLib.getDocument(typedArray).promise
  return pdf.numPages
}

/**
 * Format file size (bytes → readable)
 */
export function formatFileSize(bytes) {
  if (!bytes) return "0 B"

  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"

  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

/**
 * Format date (timestamp → readable)
 */
export function formatDate(timestamp, locale = "id-ID") {
  if (!timestamp) return "-"

  const parts = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(timestamp)

  const weekday = parts.find(p => p.type === "weekday")?.value
  const day = parts.find(p => p.type === "day")?.value
  const month = parts.find(p => p.type === "month")?.value
  const year = parts.find(p => p.type === "year")?.value

  return `${weekday}, ${day} ${month} ${year}`
}

/**
 * Extract file metadata
 */
export function getFileMeta(file) {
  if (!(file instanceof File)) return null

  return {
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    lastModified: file.lastModified,
    formattedDate: formatDate(file.lastModified),
    type: file.type,
  }
}

/**
 * Validate PDF file
 */
export function isValidPDF(file) {
  if (!(file instanceof File)) return false

  const isPDF =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")

  return isPDF
}

/**
 * Validate PDF file size
 */
export function isPDFExceedSizeLimit(file, maxSizeMB = 10){
  if (!(file instanceof File)) return 0
  const isExceedingSize = file.size > maxSizeMB * 1024 * 1024

  return isExceedingSize;
}

/**
 * Estimate reading time based on page count
 * @param {File} file
 * @param {number} pages
 * @param {number} wordsPerMinute (default: 200)
 */
/**
 * Smart reading time estimator (with confidence + compact duration)
 */
export function estimateReadingTime(file, pages, wordsPerMinute = 200) {
  if (!(file instanceof File) || !pages || pages <= 0) {
    return {
      label: "—",
      minutes: 0,
      confidence: "low"
    }
  }

  let wordsPerPage = 500
  let confidence = "medium"

  // Page-based adjustment
  if (pages < 5) {
    wordsPerPage = 300
    confidence = "low"
  } else if (pages > 20) {
    wordsPerPage = 550
    confidence = "medium"
  }

  // Density-based adjustment
  const density = file.size / pages

  if (density < 50_000) {
    wordsPerPage -= 100
    confidence = "low"
  } else if (density > 200_000) {
    wordsPerPage += 100
    confidence = "high"
  }

  wordsPerPage = Math.max(250, Math.min(wordsPerPage, 700))

  const totalWords = pages * wordsPerPage
  const minutes = Math.ceil(totalWords / wordsPerMinute)

  let durationLabel = ""

  if (minutes < 60) {
    durationLabel = `${minutes} menit`
  } else {
    const hours = Math.floor(minutes / 60)
    const remaining = minutes % 60

    durationLabel = remaining > 0
      ? `${hours} jam ${remaining} menit`
      : `${hours} jam`
  }

  return {
    label: `Sekitar ${durationLabel}`,
    minutes,
    confidence
  }
}

/**
 * Extract metadata from PDF
 */
export async function getPDFMetadata(file) {
  if (!(file instanceof File)) {
    throw new Error("Invalid file")
  }

  const arrayBuffer = await file.arrayBuffer()
  const typedArray = new Uint8Array(arrayBuffer)

  const pdf = await pdfjsLib.getDocument(typedArray).promise

  try {
    const metadata = await pdf.getMetadata()

    return {
      title: metadata.info?.Title || null,
      author: metadata.info?.Author || null,
      creator: metadata.info?.Creator || null,
      producer: metadata.info?.Producer || null,
      creationDate: metadata.info?.CreationDate || null,
      modificationDate: metadata.info?.ModDate || null,
    }
  } catch (err) {
    console.warn("Metadata not available", err)
    return null
  }
}