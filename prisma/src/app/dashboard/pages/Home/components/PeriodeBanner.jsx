"use client"

import { useState, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationTriangle, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import Badge from "@/app/component/Display/Badge"

const STAGE_ORDER_PENELITIAN = [
    "PENERIMAAN_PROPOSAL",
    "SELEKSI_PROPOSAL",
    "PENGUMUMAN_SURAT_TUGAS",
    "PROSES_PENELITIAN_GANJIL",
    "PUBLIKASI_GANJIL",
    "DISEMINASI_GANJIL",
    "CLAIM_DANA_GANJIL",
    "LUARAN_PENELITIAN",
    "PROSES_PENELITIAN_GENAP",
    "PUBLIKASI_GENAP",
    "DISEMINASI_GENAP",
    "CLAIM_DANA_GENAP",
]

const STAGE_ORDER_PKM = [
    "PENERIMAAN_PROPOSAL",
    "SELEKSI_PROPOSAL",
    "PENGUMUMAN_SURAT_TUGAS",
    "CLAIM_DANA_GANJIL",
    "PROSES_PKM_GANJIL",
    "PUBLIKASI_GANJIL",
    "PENGEMBALIAN_DANA_GANJIL",
    "DISEMINASI_GANJIL",
    "LUARAN_PKM",
    "CLAIM_DANA_GENAP",
    "PROSES_PKM_GENAP",
    "PUBLIKASI_GENAP",
    "PENGEMBALIAN_DANA_GENAP",
    "DISEMINASI_GENAP",
]

const DISPLAY_LABELS = {
    PENERIMAAN_PROPOSAL: "Penerimaan Proposal",
    SELEKSI_PROPOSAL: "Seleksi Proposal",
    PENGUMUMAN_SURAT_TUGAS: "Pengumuman Surat Tugas",
    PROSES_PENELITIAN_GANJIL: "Proses Penelitian Ganjil",
    PROSES_PENELITIAN_GENAP: "Proses Penelitian Genap",
    PUBLIKASI_GANJIL: "Publikasi Ganjil",
    PUBLIKASI_GENAP: "Publikasi Genap",
    DISEMINASI_GANJIL: "Diseminasi Ganjil",
    DISEMINASI_GENAP: "Diseminasi Genap",
    CLAIM_DANA_GANJIL: "Claim Dana Ganjil",
    CLAIM_DANA_GENAP: "Claim Dana Genap",
    PROSES_PKM_GANJIL: "Proses PkM Ganjil",
    PROSES_PKM_GENAP: "Proses PkM Genap",
    PENGEMBALIAN_DANA_GANJIL: "Pengembalian Dana Ganjil",
    PENGEMBALIAN_DANA_GENAP: "Pengembalian Dana Genap",
    LUARAN_PENELITIAN: "Luaran Penelitian",
    LUARAN_PKM: "Luaran PkM",
}

function formatDateShort(dateStr) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function isOutOfRange(stage) {
    if (!stage.manual_status_override || stage.effective_status !== "Terbuka") return false
    const now = new Date()
    const mulai = new Date(stage.tgl_mulai)
    const selesai = new Date(stage.tgl_selesai)
    return now < mulai || now > selesai
}

function statusBadgeColor(status, outOfRange) {
    if (status === "Terbuka") return outOfRange ? "amber" : "green"
    if (status === "Selesai") return "gray"
    return "blue"
}

function statusDotColor(status, outOfRange) {
    if (status === "Terbuka") return outOfRange ? "bg-amber-500" : "bg-green-500"
    if (status === "Selesai") return "bg-gray-400"
    return "bg-blue-400"
}

const warningMsg = "Kegiatan dibuka secara manual meskipun tanggal saat ini berada di luar rentang kegiatan."

function StageRow({ stage }) {
    const label = DISPLAY_LABELS[stage.kode_kegiatan] || stage.nama_kegiatan
    const outOfRange = isOutOfRange(stage)
    const badgeColor = statusBadgeColor(stage.effective_status, outOfRange)
    const dotColor = statusDotColor(stage.effective_status, outOfRange)

    return (
        <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />

            <span className="text-sm text-gray-700 flex-1 min-w-0 leading-snug">
                {label}
            </span>

            <div className="flex items-center gap-2 flex-shrink-0">
                {outOfRange && (
                    <span className="relative group/warn cursor-help">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-xs" />
                        <span className="absolute bottom-full right-0 mb-1 px-2 py-1 text-[10px] text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover/warn:opacity-100 transition-opacity pointer-events-none z-50">
                            {warningMsg}
                        </span>
                    </span>
                )}

                <Badge color={badgeColor} size="xs">
                    {stage.effective_status}
                </Badge>

                {stage.tgl_mulai && stage.tgl_selesai && (
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {formatDateShort(stage.tgl_mulai)} – {formatDateShort(stage.tgl_selesai)}
                    </span>
                )}
            </div>
        </div>
    )
}

function ActivityGroup({ flow, defaultExpanded }) {
    const [expanded, setExpanded] = useState(defaultExpanded)

    const order = flow.jenis_penelitian === "PkM" ? STAGE_ORDER_PKM : STAGE_ORDER_PENELITIAN

    const sorted = useMemo(() => {
        return [...flow.stages].sort((a, b) => {
            const ai = order.indexOf(a.kode_kegiatan)
            const bi = order.indexOf(b.kode_kegiatan)
            const aIdx = ai === -1 ? 999 : ai
            const bIdx = bi === -1 ? 999 : bi
            return aIdx - bIdx
        })
    }, [flow.stages, order])

    const counts = useMemo(() => {
        const c = { Terbuka: 0, Selesai: 0, other: 0 }
        for (const s of sorted) {
            if (s.effective_status === "Terbuka") c.Terbuka++
            else if (s.effective_status === "Selesai") c.Selesai++
            else c.other++
        }
        return c
    }, [sorted])

    const totalStages = sorted.length

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                aria-expanded={expanded}
            >
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-gray-400 text-xs transition-transform duration-200 flex-shrink-0 ${
                        expanded ? "rotate-0" : "-rotate-90"
                    }`}
                />

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{flow.skema_nama}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-gray-400">{totalStages} tahapan</span>
                        {counts.Terbuka > 0 && (
                            <span className="text-[11px] text-green-600 font-medium">{counts.Terbuka} Terbuka</span>
                        )}
                        {counts.other > 0 && (
                            <span className="text-[11px] text-blue-500 font-medium">{counts.other} Aktif</span>
                        )}
                        {counts.Selesai > 0 && (
                            <span className="text-[11px] text-gray-400">{counts.Selesai} Selesai</span>
                        )}
                    </div>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-100">
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {sorted.map((stage) => (
                            <StageRow key={stage.kegiatan_id} stage={stage} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const TABS = [
    { key: "Penelitian", label: "Penelitian" },
    { key: "PkM", label: "PkM" },
]

export default function PeriodeBanner({ periodes = [], kegiatanFlows = [] }) {
    const [activeTab, setActiveTab] = useState("Penelitian")

    if (kegiatanFlows.length === 0 && periodes.length === 0) {
        return (
            <p className="text-sm text-gray-400">Tidak ada tahapan kegiatan yang tersedia.</p>
        )
    }

    const flowsForTab = kegiatanFlows.filter(f => f.jenis_penelitian === activeTab)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex border-b border-gray-200">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
                            activeTab === tab.key
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {flowsForTab.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">
                    Tidak ada tahapan {activeTab} yang tersedia.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {flowsForTab.map((flow, i) => (
                        <ActivityGroup
                            key={`${flow.skema_id}_${flow.jenis_penelitian}`}
                            flow={flow}
                            defaultExpanded={i === 0}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
