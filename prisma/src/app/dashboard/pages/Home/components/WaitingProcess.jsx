"use client"

import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import Badge from "@/app/component/Display/Badge"
import { PROPOSAL_STATUS_COLORS, LAPORAN_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"

function getStatusBadge(type, status) {
    if (type === "proposal") {
        const style = PROPOSAL_STATUS_COLORS[status?.toLowerCase()] || PROPOSAL_STATUS_COLORS.default
        return <Badge color={style.color} size="xs">{style.label}</Badge>
    }
    if (type === "laporan") {
        const style = LAPORAN_STATUS_COLORS[status?.toLowerCase()] || LAPORAN_STATUS_COLORS.default
        return <Badge color={style.color} size="xs">{style.label}</Badge>
    }
    return <Badge color="gray" size="xs">{status}</Badge>
}

const TYPE_LABELS = {
    proposal: "Proposal",
    laporan: "Laporan",
}

const WAITING_EXPLANATIONS = {
    "Menunggu review Staff LPPM": "Proposal sedang diperiksa oleh Staff LPPM. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu penugasan reviewer": "Menunggu Staff LPPM menugaskan reviewer. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu review": "Review sedang dilakukan oleh reviewer. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu persetujuan Ketua LPPM": "Menunggu persetujuan dari Ketua LPPM. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu review Admin": "Laporan sedang diperiksa oleh Admin. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu review Staff LPPM": "Laporan sedang diperiksa oleh Staff LPPM. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu hasil dari Reviewers": "Menunggu hasil review dari reviewers. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu keputusan Ketua": "Menunggu keputusan dari Ketua. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu penugasan Reviewer": "Menunggu penugasan reviewer. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
    "Menunggu Persetujuan Ketua LPPM": "Menunggu persetujuan dari Ketua LPPM. Tidak ada tindakan yang diperlukan dari Anda saat ini.",
}

export default function WaitingProcess({ items = [], emptyMessage = "Tidak ada proses yang sedang menunggu pihak lain." }) {
    const router = useRouter()

    if (items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <FontAwesomeIcon icon={faClock} className="text-gray-400 text-sm" />
                </div>
                <p className="text-xs text-gray-500">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {items.map((item, index) => (
                <div
                    key={`${item.type}-${item.id}-${index}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faClock} className="text-amber-500 text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                {TYPE_LABELS[item.type] || item.type}
                            </span>
                            {item.semester && (
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {item.semester}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 truncate mb-0.5">
                            {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mb-1.5">
                            {WAITING_EXPLANATIONS[item.status] || `Menunggu proses dari pihak terkait.`}
                        </p>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(item.type, item.status)}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(item.action_url)}
                        className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-blue-600 whitespace-nowrap flex-shrink-0 mt-1"
                    >
                        Detail
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </button>
                </div>
            ))}
        </div>
    )
}
