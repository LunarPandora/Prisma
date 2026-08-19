"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
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
    PENERIMAAN_PROPOSAL: "Penerimaan\nProposal",
    SELEKSI_PROPOSAL: "Seleksi\nProposal",
    PENGUMUMAN_SURAT_TUGAS: "Pengumuman\nSurat Tugas",
    PROSES_PENELITIAN_GANJIL: "Proses Penelitian\nGanjil",
    PROSES_PENELITIAN_GENAP: "Proses Penelitian\nGenap",
    PUBLIKASI_GANJIL: "Publikasi\nGanjil",
    PUBLIKASI_GENAP: "Publikasi\nGenap",
    DISEMINASI_GANJIL: "Diseminasi\nGanjil",
    DISEMINASI_GENAP: "Diseminasi\nGenap",
    CLAIM_DANA_GANJIL: "Claim Dana\nGanjil",
    CLAIM_DANA_GENAP: "Claim Dana\nGenap",
    PROSES_PKM_GANJIL: "Proses PkM\nGanjil",
    PROSES_PKM_GENAP: "Proses PkM\nGenap",
    PENGEMBALIAN_DANA_GANJIL: "Pengembalian Dana\nGanjil",
    PENGEMBALIAN_DANA_GENAP: "Pengembalian Dana\nGenap",
    LUARAN_PENELITIAN: "Luaran\nPenelitian",
    LUARAN_PKM: "Luaran\nPkM",
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

function StageNode({ stage, isLast }) {
    const label = DISPLAY_LABELS[stage.kode_kegiatan] || stage.nama_kegiatan
    const outOfRange = isOutOfRange(stage)
    const badgeColor = statusBadgeColor(stage.effective_status, outOfRange)
    const warningMsg = "Kegiatan dibuka secara manual meskipun tanggal saat ini berada di luar rentang kegiatan."

    return (
        <div className="flex items-stretch flex-shrink-0" style={{ minWidth: 120 }}>
            <div className="flex flex-col items-center">
                <div
                    className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                        stage.effective_status === "Terbuka"
                            ? outOfRange
                                ? "border-amber-500 bg-amber-100"
                                : "border-green-500 bg-green-100"
                            : stage.effective_status === "Selesai"
                                ? "border-gray-400 bg-gray-100"
                                : "border-blue-300 bg-blue-50"
                    }`}
                />
                {!isLast && (
                    <div className="w-px flex-1 min-h-[24px] bg-gray-200" />
                )}
            </div>

            <div className="flex flex-col pl-3 pb-4 min-w-0">
                <p className="text-xs font-medium text-gray-800 whitespace-pre-line leading-tight">
                    {label}
                </p>

                <div className="flex items-center gap-1 mt-1">
                    <Badge color={badgeColor} size="xs">
                        {stage.effective_status}
                    </Badge>
                    {outOfRange && (
                        <span className="relative group cursor-help">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-[10px]" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {warningMsg}
                            </span>
                        </span>
                    )}
                </div>

                {stage.tgl_mulai && stage.tgl_selesai && (
                    <p className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                        {formatDateShort(stage.tgl_mulai)} – {formatDateShort(stage.tgl_selesai)}
                    </p>
                )}
            </div>
        </div>
    )
}

function WorkflowTimeline({ flow }) {
    const order = flow.jenis_penelitian === "PkM" ? STAGE_ORDER_PKM : STAGE_ORDER_PENELITIAN

    const sorted = [...flow.stages].sort((a, b) => {
        const ai = order.indexOf(a.kode_kegiatan)
        const bi = order.indexOf(b.kode_kegiatan)
        const aIdx = ai === -1 ? 999 : ai
        const bIdx = bi === -1 ? 999 : bi
        return aIdx - bIdx
    })

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
                <p className="text-xs font-medium text-gray-700">{flow.skema_nama}</p>
            </div>

            <div className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                <div className="flex min-w-max">
                    {sorted.map((stage, i) => (
                        <StageNode
                            key={stage.kegiatan_id}
                            stage={stage}
                            isLast={i === sorted.length - 1}
                        />
                    ))}
                </div>
            </div>
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
        <>
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
                <div className="flex flex-col gap-6">
                    {flowsForTab.map((flow) => (
                        <WorkflowTimeline key={`${flow.skema_id}_${flow.jenis_penelitian}`} flow={flow} />
                    ))}
                </div>
            )}
        </div>

        <style>{`
            .scrollbar-thin::-webkit-scrollbar {
                height: 6px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 3px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 3px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }
        `}</style>
        </>
    )
}
