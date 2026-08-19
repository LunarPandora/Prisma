/**
 * Centralized status badge color configuration.
 * All status-to-color mappings live here to ensure consistency across roles.
 *
 * Usage:
 *   import { PROPOSAL_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"
 *   <StatusBadge status={value} statusStyles={PROPOSAL_STATUS_COLORS} />
 */

// ── Kode Kegiatan → Human Label ──────────────────────────────────────
// Full labels for detail views (include type + semester)
export const KODE_KEGIATAN_LABELS = {
    "PROSES_PENELITIAN_GANJIL": "Proses Penelitian — Ganjil",
    "PROSES_PENELITIAN_GENAP": "Proses Penelitian — Genap",
    "PROSES_PKM_GANJIL": "Proses PkM — Ganjil",
    "PROSES_PKM_GENAP": "Proses PkM — Genap",
    "PUBLIKASI_GANJIL": "Publikasi — Ganjil",
    "PUBLIKASI_GENAP": "Publikasi — Genap",
    "DISEMINASI_GANJIL": "Diseminasi — Ganjil",
    "DISEMINASI_GENAP": "Diseminasi — Genap",
    "CLAIM_DANA_GANJIL": "Claim Dana — Ganjil",
    "CLAIM_DANA_GENAP": "Claim Dana — Genap",
    "PENGEMBALIAN_DANA_GANJIL": "Pengembalian Dana — Ganjil",
    "PENGEMBALIAN_DANA_GENAP": "Pengembalian Dana — Genap",
    "LUARAN_PENELITIAN": "Luaran Penelitian",
    "LUARAN_PKM": "Luaran PkM",
}

// Short labels for compact table badges
export const KODE_KEGIATAN_SHORT_LABELS = {
    "PROSES_PENELITIAN_GANJIL": "Proses",
    "PROSES_PENELITIAN_GENAP": "Proses",
    "PROSES_PKM_GANJIL": "Proses PkM",
    "PROSES_PKM_GENAP": "Proses PkM",
    "PUBLIKASI_GANJIL": "Publikasi",
    "PUBLIKASI_GENAP": "Publikasi",
    "DISEMINASI_GANJIL": "Diseminasi",
    "DISEMINASI_GENAP": "Diseminasi",
    "CLAIM_DANA_GANJIL": "Claim Dana",
    "CLAIM_DANA_GENAP": "Claim Dana",
    "PENGEMBALIAN_DANA_GANJIL": "Pengembalian",
    "PENGEMBALIAN_DANA_GENAP": "Pengembalian",
    "LUARAN_PENELITIAN": "Luaran",
    "LUARAN_PKM": "Luaran",
}

// Stage sequences per jenis_penelitian (mirrors KegiatanStage::laporanSequence)
export const LAPORAN_SEQUENCES = {
    Penelitian: (sem) => [
        { kode: `PROSES_PENELITIAN_${sem}`, label: "Proses Penelitian" },
        { kode: `PUBLIKASI_${sem}`, label: "Publikasi" },
        { kode: `DISEMINASI_${sem}`, label: "Diseminasi" },
        { kode: `CLAIM_DANA_${sem}`, label: "Claim Dana" },
    ],
    PkM: (sem) => [
        { kode: `CLAIM_DANA_${sem}`, label: "Claim Dana" },
        { kode: `PROSES_PKM_${sem}`, label: "Proses PkM" },
        { kode: `PUBLIKASI_${sem}`, label: "Publikasi" },
        { kode: `PENGEMBALIAN_DANA_${sem}`, label: "Pengembalian Dana" },
        { kode: `DISEMINASI_${sem}`, label: "Diseminasi" },
    ],
}

// Tab phase mapping — maps stage base codes to tab phase identifiers
const STAGE_TO_PHASE = {
    "PROSES_PENELITIAN": "proses",
    "PROSES_PKM": "proses",
    "PUBLIKASI": "publikasi",
    "DISEMINASI": "diseminasi",
    "CLAIM_DANA": "claim",
    "PENGEMBALIAN_DANA": "pengembalian",
}

// Tab display labels — short labels shown in tab buttons
const STAGE_TAB_LABELS = {
    "PROSES_PENELITIAN": "Proses",
    "PROSES_PKM": "Proses PkM",
    "PUBLIKASI": "Publikasi",
    "DISEMINASI": "Diseminasi",
    "CLAIM_DANA": "Claim Dana",
    "PENGEMBALIAN_DANA": "Pengembalian Dana",
}

/**
 * Build laporan tabs from stage sequence for a given type.
 * Returns tabs ordered by the workflow sequence.
 *
 * @param {string|null} jenisPenelitian - "Penelitian" | "PkM" | null (for "all")
 * @returns {Array<{key: string, label: string, phase: string}>}
 */
export function buildLaporanTabs(jenisPenelitian) {
    const stageKeys = new Set()
    const stageOrder = []

    const addStages = (type) => {
        const seq = LAPORAN_SEQUENCES[type]
        if (!seq) return
        const ganjil = seq("GANJIL")
        for (const stage of ganjil) {
            const base = stage.kode.replace(/_(GANJIL|GENAP)$/, "")
            if (!stageKeys.has(base)) {
                stageKeys.add(base)
                stageOrder.push(base)
            }
        }
    }

    if (jenisPenelitian && jenisPenelitian !== "all") {
        addStages(jenisPenelitian)
    } else {
        // "all" — show superset in Penelitian order first, then PkM-only stages
        addStages("Penelitian")
        addStages("PkM")
    }

    return stageOrder.map(base => ({
        key: base,
        label: STAGE_TAB_LABELS[base] || base,
        phase: STAGE_TO_PHASE[base] || base.toLowerCase(),
    })).concat([{ key: "SELESAI", label: "Selesai", phase: "selesai" }])
}

// ── Skema ────────────────────────────────────────────────────────────
export const SKEMA_STATUS_COLORS = {
    Draft: { color: "yellow", label: "Draft" },
    Aktif: { color: "blue", label: "Aktif" },
    Selesai: { color: "green", label: "Selesai" },
}

// ── Kegiatan ─────────────────────────────────────────────────────────
export const KEGIATAN_STATUS_COLORS = {
    ditutup: { color: "red", label: "Ditutup" },
    dibuka: { color: "blue", label: "Dibuka" },
    default: { color: "green", label: "—" },
}

// ── Proposal ─────────────────────────────────────────────────────────
// Shared statuses between Admin & Dosen use the same color.
export const PROPOSAL_STATUS_COLORS = {
    "draft": { color: "gray", label: "Draft" },
    "menunggu proposal untuk diupload": { color: "blue", label: "Menunggu proposal untuk diupload" },
    "menunggu review dari ketua lppm": { color: "blue", label: "Menunggu review dari Ketua LPPM" },
    "menunggu review staff lppm": { color: "yellow", label: "Menunggu review Staff LPPM" },
    "menunggu penugasan reviewer": { color: "blue", label: "Menunggu penugasan reviewer" },
    "menunggu review": { color: "yellow", label: "Menunggu review" },
    "menunggu persetujuan ketua lppm": { color: "orange", label: "Menunggu persetujuan Ketua LPPM" },
    "proposal diterima": { color: "green", label: "Proposal Diterima" },
    "dalam pengerjaan": { color: "purple", label: "Dalam pengerjaan" },
    "ditolak": { color: "red", label: "Ditolak" },
    "revisi": { color: "orange", label: "Revisi" },
    default: { color: "gray", label: "—" },
}

// ── Review (Reviewer) ────────────────────────────────────────────────
export const REVIEW_STATUS_COLORS = {
    "belum direview": { color: "red", label: "Belum direview" },
    "telah direview": { color: "green", label: "Telah direview" },
    default: { color: "gray", label: "—" },
}

// ── Laporan ──────────────────────────────────────────────────────────
// Admin sees more statuses (ketua/staff review, reviewer assignment).
// Dosen sees fewer statuses (what it manages directly).
// Shared statuses use the SAME color.
export const LAPORAN_STATUS_COLORS = {
    "belum dimulai": { color: "gray", label: "Belum dimulai" },
    "dalam pengerjaan": { color: "purple", label: "Dalam pengerjaan" },
    "menunggu kelengkapan data": { color: "yellow", label: "Menunggu kelengkapan data" },
    "menunggu review admin": { color: "blue", label: "Menunggu review Admin" },
    "menunggu review staff lppm": { color: "indigo", label: "Menunggu review Staff LPPM" },
    "menunggu review": { color: "blue", label: "Menunggu review" },
    "menunggu hasil dari reviewers": { color: "indigo", label: "Menunggu hasil dari Reviewers" },
    "menunggu keputusan ketua": { color: "purple", label: "Menunggu keputusan Ketua" },
    "menunggu penugasan reviewer": { color: "cyan", label: "Menunggu penugasan Reviewer" },
    "menunggu persetujuan ketua lppm": { color: "amber", label: "Menunggu Persetujuan Ketua LPPM" },
    "menunggu konfirmasi pengiriman dana": { color: "emerald", label: "Menunggu konfirmasi pengiriman dana" },
    "menunggu konfirmasi penerimaan dana": { color: "teal", label: "Menunggu konfirmasi penerimaan dana" },
    "revisi": { color: "orange", label: "Revisi" },
    "selesai": { color: "green", label: "Selesai" },
    default: { color: "gray", label: "—" },
}

// ── Laporan Kode Kegiatan ────────────────────────────────────────────
export const LAPORAN_KODE_COLORS = {
    "Proses": "purple",
    "Proses PkM": "purple",
    "Publikasi": "blue",
    "Diseminasi": "yellow",
    "Claim Dana": "emerald",
    "Pengembalian": "orange",
    "Pengembalian Dana": "orange",
    "Luaran": "green",
}

// ── Jenis Penelitian Badge Colors ────────────────────────────────────
export const JENIS_PENELITIAN_COLORS = {
    "Penelitian": "purple",
    "PkM": "teal",
}

// ── Dana ─────────────────────────────────────────────────────────────
export const DANA_STATUS_COLORS = {
    "menunggu bukti terima": { color: "yellow", label: "Menunggu bukti terima" },
    "menunggu konfirmasi admin": { color: "blue", label: "Menunggu konfirmasi admin" },
    "menunggu pengembalian dana": { color: "yellow", label: "Menunggu Pengembalian Dana" },
    "dilewati": { color: "gray", label: "Dilewati" },
    "selesai": { color: "green", label: "Selesai" },
    default: { color: "gray", label: "—" },
}

// ── Ketua: Kegiatan Edit ─────────────────────────────────────────────
export const KEGIATAN_EDIT_STATUS_COLORS = {
    "menunggu otorisasi": { color: "yellow", label: "Menunggu Otorisasi" },
    "disetujui": { color: "green", label: "Disetujui" },
    default: { color: "red", label: "—" },
}

// ── Users (Admin) ────────────────────────────────────────────────────
export const USER_STATUS_COLORS = {
    "aktif": { color: "green", label: "Aktif" },
    default: { color: "red", label: "—" },
}

// ── Google Scholar Sync ──────────────────────────────────────────────
export const SCHOLAR_SYNC_STATUS_COLORS = {
    pending: { color: "yellow", label: "Menunggu sinkronisasi" },
    syncing: { color: "blue", label: "Sedang menyinkronkan data" },
    success: { color: "green", label: "Sinkronisasi berhasil" },
    failed: { color: "red", label: "Sinkronisasi gagal" },
}
