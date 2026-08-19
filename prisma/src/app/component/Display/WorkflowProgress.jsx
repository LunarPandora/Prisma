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
        <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
            {stages.map((stage, i) => {
                const isCompleted = currentIdx >= 0 && i < currentIdx
                const isCurrent = stage.kode === currentKode
                const isUpcoming = currentIdx >= 0 && i > currentIdx

                return (
                    <div key={stage.kode} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-1 min-w-0">
                            {/* Circle */}
                            <div className={`
                                w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 shrink-0
                                ${isCompleted
                                    ? "bg-green-500 border-green-500 text-white"
                                    : isCurrent
                                        ? "bg-blue-500 border-blue-500 text-white"
                                        : "bg-white border-gray-300 text-gray-400"
                                }
                            `}>
                                {isCompleted ? (
                                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            {/* Label */}
                            <span className={`
                                text-[10px] text-center leading-tight max-w-[70px] truncate
                                ${isCurrent ? "text-blue-600 font-medium" : isCompleted ? "text-green-600" : "text-gray-400"}
                            `}>
                                {stage.label}
                            </span>
                            {/* Status under current */}
                            {isCurrent && status && (
                                <span className="text-[9px] text-gray-500 text-center max-w-[70px] truncate">
                                    {status}
                                </span>
                            )}
                        </div>
                        {/* Connector line */}
                        {i < stages.length - 1 && (
                            <div className={`
                                flex-1 h-0.5 mx-1 mt-[-12px]
                                ${isCompleted ? "bg-green-500" : "bg-gray-200"}
                            `} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
