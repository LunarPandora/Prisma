"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faCheckCircle,
    faCircle,
    faSpinner,
    faArrowRight,
    faChevronDown,
    faFlask,
    faBookOpen,
} from "@fortawesome/free-solid-svg-icons"

const STAGE_ICONS = {
    done: faCheckCircle,
    current: faSpinner,
    pending: faCircle,
}

const STAGE_COLORS = {
    done: "text-green-500",
    current: "text-blue-500",
    pending: "text-gray-300",
}

const STAGE_BG = {
    done: "bg-green-50 border-green-200",
    current: "bg-blue-50 border-blue-200",
    pending: "bg-gray-50 border-gray-200",
}

const STAGE_TEXT = {
    done: "text-green-700",
    current: "text-blue-700",
    pending: "text-gray-400",
}

function getStageStatus(done, isCurrent) {
    if (done) return "done"
    if (isCurrent) return "current"
    return "pending"
}

function StagePill({ label, status, description }) {
    const icon = STAGE_ICONS[status]
    const color = STAGE_COLORS[status]
    const bg = STAGE_BG[status]
    const textColor = STAGE_TEXT[status]

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bg}`}>
            <FontAwesomeIcon
                icon={icon}
                className={`text-sm flex-shrink-0 ${color} ${status === "current" ? "animate-pulse" : ""}`}
            />
            <div className="min-w-0">
                <p className={`text-xs font-medium ${textColor} truncate`}>{label}</p>
                {description && (
                    <p className="text-[10px] text-gray-400 truncate">{description}</p>
                )}
            </div>
        </div>
    )
}

function KegiatanSelector({ items, selectedIdx, onSelect }) {
    const [open, setOpen] = useState(false)
    const selected = items[selectedIdx]

    if (items.length <= 1) return null

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer"
            >
                <span className="text-sm font-medium text-gray-800 line-clamp-1 flex-1">
                    {selected?.judul}
                </span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                        {items.map((item, idx) => (
                            <button
                                key={item.proposal_id}
                                onClick={() => { onSelect(idx); setOpen(false) }}
                                className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors cursor-pointer ${
                                    idx === selectedIdx ? "bg-blue-50" : ""
                                }`}
                            >
                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.judul}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.skema_nama}</p>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default function WorkflowProgressTracker({ progress }) {
    const router = useRouter()
    const [selectedIdx, setSelectedIdx] = useState(0)

    if (!progress || !Array.isArray(progress) || progress.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon icon={faFlask} className="text-lg text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Belum Ada Kegiatan Penelitian</p>
                <p className="text-xs text-gray-400 mb-3">Anda belum memiliki kegiatan penelitian yang dapat ditampilkan.</p>
            </div>
        )
    }

    const item = progress[selectedIdx] || progress[0]
    const {
        judul,
        skema_nama,
        jenis_penelitian,
        current_state,
        current_description,
        navigation_url,
        proposal_stages,
        laporan_stages,
    } = item

    const jenisIcon = jenis_penelitian === "PkM" ? faBookOpen : faFlask

    return (
        <div className="flex flex-col gap-3">
            {/* Kegiatan selector */}
            <KegiatanSelector
                items={progress}
                selectedIdx={selectedIdx}
                onSelect={setSelectedIdx}
            />

            {/* Kegiatan info */}
            <div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{judul}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <FontAwesomeIcon icon={jenisIcon} className="text-[10px] text-gray-400" />
                    <p className="text-xs text-gray-500">{skema_nama}</p>
                </div>
            </div>

            {/* Current status */}
            {current_state && (
                <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg ${
                    current_state === "Selesai"
                        ? "bg-green-50 border border-green-100"
                        : current_state === "Ditolak"
                        ? "bg-red-50 border border-red-100"
                        : "bg-blue-50 border border-blue-100"
                }`}>
                    <FontAwesomeIcon
                        icon={current_state === "Selesai" ? faCheckCircle : faSpinner}
                        className={`text-sm mt-0.5 flex-shrink-0 ${
                            current_state === "Selesai"
                                ? "text-green-500"
                                : current_state === "Ditolak"
                                ? "text-red-500"
                                : "text-blue-500 animate-pulse"
                        }`}
                    />
                    <div className="min-w-0">
                        <p className={`text-xs font-semibold ${
                            current_state === "Selesai"
                                ? "text-green-700"
                                : current_state === "Ditolak"
                                ? "text-red-700"
                                : "text-blue-700"
                        }`}>{current_state}</p>
                        {current_description && (
                            <p className={`text-[11px] mt-0.5 ${
                                current_state === "Selesai"
                                    ? "text-green-600"
                                    : current_state === "Ditolak"
                                    ? "text-red-600"
                                    : "text-blue-600"
                            }`}>{current_description}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Proposal stages */}
            {proposal_stages && proposal_stages.length > 0 && (() => {
                const firstIncompleteProposal = proposal_stages.findIndex(s => !s.done)
                return (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Proposal</p>
                        <div className="flex flex-wrap gap-1.5">
                            {proposal_stages.map((stage, idx) => {
                                const isCurrent = !stage.done && idx === firstIncompleteProposal
                                const status = getStageStatus(stage.done, isCurrent)
                                return (
                                    <StagePill
                                        key={stage.label}
                                        label={stage.label}
                                        status={status}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )
            })()}

            {/* Laporan stages */}
            {laporan_stages && laporan_stages.length > 0 && (() => {
                const firstIncompleteLaporan = laporan_stages.findIndex(s => !s.done)
                return (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Laporan</p>
                        <div className="flex flex-wrap gap-1.5">
                            {laporan_stages.map((ls, idx) => {
                                const isCurrent = !ls.done && idx === firstIncompleteLaporan
                                const status = getStageStatus(ls.done, isCurrent)
                                const desc = ls.done ? "Selesai" : isCurrent ? ls.status : "Belum dimulai"
                                return (
                                    <StagePill
                                        key={ls.semester}
                                        label={`Laporan ${ls.semester}`}
                                        status={status}
                                        description={desc}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )
            })()}

            {/* CTA */}
            <button
                onClick={() => router.push(navigation_url)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer self-start"
            >
                Lihat Detail Kegiatan
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </button>
        </div>
    )
}
