"use client"

import { useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { LAPORAN_SEQUENCES } from "@/app/component/Libraries/config/statusColors"

/**
 * WorkflowProgress - Visual stepper showing laporan workflow stages.
 *
 * Props:
 *   jenisPenelitian: "Penelitian" | "PkM"
 *   semester: "Ganjil" | "Genap"
 *   currentKode: current stage kode (e.g. "PUBLIKASI_GANJIL")
 *   status: current status string (optional, shown under current stage)
 */
export default function WorkflowProgress({ jenisPenelitian, semester, currentKode, status }) {
    const stages = useMemo(() => {
        if (!jenisPenelitian || !semester) return []
        const sem = semester === "Ganjil" ? "GANJIL" : "GENAP"
        const seq = LAPORAN_SEQUENCES[jenisPenelitian]
        if (!seq) return []
        return seq(sem)
    }, [jenisPenelitian, semester])

    if (!stages.length) return null

    const currentIdx = stages.findIndex(s => s.kode === currentKode)

    return (
        <div className="relative flex items-start w-full py-3">
            {stages.map((stage, i) => {
                const isCompleted = currentIdx >= 0 && i < currentIdx
                const isCurrent = stage.kode === currentKode

                return (
                    <div key={stage.kode} className="flex flex-col items-center flex-1 min-w-0 relative">
                        {/* Circle */}
                        <div
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0 z-10
                                ${isCompleted
                                    ? "bg-green-500 border-green-500 text-white"
                                    : isCurrent
                                        ? "bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200"
                                        : "bg-white border-gray-300 text-gray-500"
                                }
                            `}
                            aria-label={
                                isCompleted ? `${stage.label} — Selesai`
                                    : isCurrent ? `${stage.label} — ${status || "Sedang berlangsung"}`
                                        : `${stage.label} — Belum dimulai`
                            }
                        >
                            {isCompleted ? (
                                <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
                            ) : (
                                i + 1
                            )}
                        </div>

                        {/* Label */}
                        <span
                            className={`
                                mt-1.5 text-xs text-center leading-snug w-full break-words px-1
                                ${isCurrent
                                    ? "text-blue-700 font-semibold"
                                    : isCompleted
                                        ? "text-green-700 font-medium"
                                        : "text-gray-500"
                                }
                            `}
                        >
                            {stage.label}
                        </span>

                        {/* Status badge under current stage */}
                        {isCurrent && status && (
                            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700 font-medium text-center leading-tight max-w-full break-words">
                                {status}
                            </span>
                        )}

                        {/* Connector line — positioned at circle center (16px from top) */}
                        {i < stages.length - 1 && (
                            <div
                                className={`
                                    absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5
                                    ${isCompleted ? "bg-green-400" : "bg-gray-200"}
                                `}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
