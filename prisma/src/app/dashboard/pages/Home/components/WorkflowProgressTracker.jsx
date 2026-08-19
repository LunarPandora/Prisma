"use client"

import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faCircle, faSpinner, faArrowRight } from "@fortawesome/free-solid-svg-icons"

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

export default function WorkflowProgressTracker({ progress }) {
    const router = useRouter()

    if (!progress?.stages || Object.keys(progress.stages).length === 0) {
        return (
            <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Belum ada progress penelitian.</p>
            </div>
        )
    }

    const stages = Object.entries(progress.stages)
    const firstIncomplete = stages.findIndex(([, done]) => !done)
    const currentIdx = firstIncomplete === -1 ? stages.length - 1 : firstIncomplete
    const navigationUrl = progress.navigation_url || "/dashboard?module=dosenmonitoringprogress"

    const getStageDescription = (label, status) => {
        if (status === "done") return "Selesai"
        if (status === "current") {
            if (label === "Pengajuan") return "Proposal sedang dalam proses pengajuan"
            if (label === "Seleksi") return "Menunggu review dan seleksi proposal"
            if (label === "Surat Tugas") return "Proposal diterima, menunggu surat tugas"
            if (label.startsWith("Laporan")) return "Laporan perlu dikerjakan"
        }
        return "Belum dimulai"
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs text-gray-500 mb-0.5">Penelitian Terakhir</p>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{progress.proposal_judul}</p>
                </div>
                <button
                    onClick={() => router.push(navigationUrl)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                    Lihat Detail
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {stages.map(([label, done], idx) => {
                    const status = getStageStatus(done, idx === currentIdx)
                    const icon = STAGE_ICONS[status]
                    const color = STAGE_COLORS[status]
                    const bg = STAGE_BG[status]
                    const textColor = STAGE_TEXT[status]
                    const description = getStageDescription(label, status)

                    return (
                        <div
                            key={label}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bg} min-w-0 flex-1 sm:flex-none sm:min-w-[140px]`}
                        >
                            <FontAwesomeIcon
                                icon={icon}
                                className={`text-sm flex-shrink-0 ${color} ${status === "current" ? "animate-pulse" : ""}`}
                            />
                            <div className="min-w-0">
                                <p className={`text-xs font-medium ${textColor} truncate`}>{label}</p>
                                <p className="text-[10px] text-gray-400 truncate">{description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
