"use client"

import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import Badge from "@/app/component/Display/Badge"
import { PROPOSAL_STATUS_COLORS, LAPORAN_STATUS_COLORS, DANA_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"

function getStatusBadge(type, status) {
    if (type === "proposal") {
        const style = PROPOSAL_STATUS_COLORS[status?.toLowerCase()] || PROPOSAL_STATUS_COLORS.default
        return <Badge color={style.color} size="xs">{style.label}</Badge>
    }
    if (type === "laporan") {
        const style = LAPORAN_STATUS_COLORS[status?.toLowerCase()] || LAPORAN_STATUS_COLORS.default
        return <Badge color={style.color} size="xs">{style.label}</Badge>
    }
    if (type === "dana") {
        const style = DANA_STATUS_COLORS[status?.toLowerCase()] || DANA_STATUS_COLORS.default
        return <Badge color={style.color} size="xs">{style.label}</Badge>
    }
    return <Badge color="gray" size="xs">{status}</Badge>
}

const TYPE_LABELS = {
    proposal: "Proposal",
    laporan: "Laporan",
    dana: "Dana",
}

const STATUS_ACTION_MAP = {
    "Dalam pengerjaan": "Lengkapi Laporan",
    "Menunggu kelengkapan data": "Lengkapi Data",
    "Revisi": "Perbaiki Laporan",
    "Menunggu bukti terima": "Lihat Status",
    "Menunggu konfirmasi admin": "Konfirmasi",
    "Menunggu Pengembalian Dana": "Lihat Status",
    "Menunggu review Staff LPPM": "Lihat Status",
    "Menunggu penugasan reviewer": "Lihat Status",
    "Menunggu review": "Lihat Status",
}

const STATUS_EXPLANATIONS = {
    "Dalam pengerjaan": "Laporan sedang dikerjakan dan perlu dilengkapi.",
    "Menunggu kelengkapan data": "Data laporan belum lengkap dan perlu dilengkapi sebelum proses berikutnya.",
    "Revisi": "Laporan perlu diperbaiki sesuai catatan review.",
    "Menunggu bukti terima": "Dana telah ditransfer, menunggu konfirmasi penerimaan dari Dosen.",
    "Menunggu konfirmasi admin": "Bukti penerimaan/pengembalian dana perlu dikonfirmasi oleh Staff.",
    "Menunggu Pengembalian Dana": "Dana perlu dikembalikan oleh Dosen yang bersangkutan.",
    "Menunggu review Staff LPPM": "Proposal sedang diperiksa oleh Staff LPPM.",
    "Menunggu penugasan reviewer": "Menunggu penugasan reviewer dari Staff LPPM.",
    "Menunggu review": "Proposal sedang dalam proses review oleh reviewer.",
}

export default function ActionQueue({ items = [], emptyMessage = "Tidak ada tindakan yang diperlukan saat ini." }) {
    const router = useRouter()

    if (items.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Semua sudah beres</p>
                <p className="text-xs text-gray-400">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item, index) => (
                <div
                    key={`${item.type}-${item.id}-${index}`}
                    data-highlight={`action-${item.type}-${item.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                    onClick={() => router.push(item.action_url)}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {TYPE_LABELS[item.type] || item.type}
                            </span>
                            {item.semester && (
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {item.semester}
                                </span>
                            )}
                            {item.jenis && (
                                <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                    {item.jenis}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate mb-1">
                            {item.title}
                        </p>
                        {STATUS_EXPLANATIONS[item.status] && (
                            <p className="text-xs text-gray-500 mb-1.5">
                                {STATUS_EXPLANATIONS[item.status]}
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            {getStatusBadge(item.type, item.status)}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:text-blue-800 whitespace-nowrap flex-shrink-0 mt-1">
                        <span className="hidden sm:inline">
                            {STATUS_ACTION_MAP[item.status] || "Lihat"}
                        </span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </div>
                </div>
            ))}
        </div>
    )
}
