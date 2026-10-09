"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faCheckCircle, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import TaskActionModal from "./TaskActionModal"
import Badge from "@/app/component/Display/Badge"
import Button from "@/app/component/Inputs/Button"
import { SummaryCardSkeleton } from "./LoadingSkeleton"
import { getReviewerDashboard } from "@/app/component/Libraries/api/dashboard"


const PRIMARY_TASK_LIMIT = 3

const STATUS_ACTION_LABELS = {
    proposal: "Mulai Penilaian",
    laporan: "Mulai Penilaian",
}

function ReviewCard({ item, onClick }) {
    const actionLabel = STATUS_ACTION_LABELS[item.type] || "Lihat"

    return (
        <div
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.judul}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Badge color={item.type === "proposal" ? "blue" : "teal"} size="xs">
                        {item.type === "proposal" ? "Proposal" : `Laporan ${item.semester || ""}`}
                    </Badge>
                    <span className="text-xs text-gray-400">Dosen: {item.dosen}</span>
                </div>
            </div>
            <button
                onClick={onClick}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap cursor-pointer"
            >
                {actionLabel}
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </button>
        </div>
    )
}

export default function ReviewerDashboard() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeModal, setActiveModal] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getReviewerDashboard()
                setData(res.data.data)
            } catch (e) {
                setError("Gagal memuat data dashboard.")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <SummaryCardSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <p className="text-sm text-red-500 mb-2">{error}</p>
                    <Button variant="secondary" onClick={() => window.location.reload()} size="sm">
                        Muat ulang
                    </Button>
                </div>
            </div>
        )
    }

    const s = data?.summary || {}
    const queue = data?.review_queue || []
    const completedQueue = data?.completed_queue || []
    const primaryQueue = queue.slice(0, PRIMARY_TASK_LIMIT)
    const remainingQueue = queue.slice(PRIMARY_TASK_LIMIT)
    const remainingCount = remainingQueue.length

    const reviewColumns = [
        {
            key: "title",
            render: (r) => `${r.type === "proposal" ? "Proposal" : "Laporan"}: ${r.judul}`,
        },
        { render: (r) => r.dosen || "-" },
        { key: "type", render: (r) => <Badge color={r.type === "proposal" ? "blue" : "teal"} size="xs">{r.type === "proposal" ? "Proposal" : `Laporan ${r.semester || ""}`}</Badge> },
    ]

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-4xl font-medium">Beranda</h1>
                <p className="text-lg text-gray-500 font-light">Tugas review yang menunggu Anda</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <SummaryCard
                    icon={faClock}
                    label="Menunggu Review"
                    value={s.menunggu_review || 0}
                    subtitle={s.menunggu_review > 0 ? "Belum dinilai" : "Tidak ada yang tertunda"}
                    color="yellow"
                    actionLabel="Mulai Review"
                    onCtaClick={() => setActiveModal("menunggu_review")}
                />
                <SummaryCard
                    icon={faCheckCircle}
                    label="Review Selesai"
                    value={s.review_selesai || 0}
                    subtitle={s.review_selesai > 0 ? "Telah selesai" : "Belum ada review selesai"}
                    color="green"
                    actionLabel="Lihat Riwayat"
                    onCtaClick={() => setActiveModal("review_selesai")}
                />
            </div>

            <DashboardSection title="Antrian Review">
                {queue.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Tidak ada review yang menunggu</p>
                        <p className="text-xs text-gray-400">Semua penugasan review sudah diselesaikan.</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-gray-100">
                        {primaryQueue.map((item) => (
                            <ReviewCard
                                key={item.penugasan_id || item.id}
                                item={item}
                                onClick={() => router.push(`/dashboard?module=reviewproposal&type=${item.type}&highlight_id=${item.reviewable_id}`)}
                            />
                        ))}
                        {remainingCount > 0 && (
                            <button
                                onClick={() => setActiveModal("remaining_reviews")}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 hover:border-blue-300 transition-all"
                            >
                                <span>Lihat {remainingCount} review lainnya</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </button>
                        )}
                    </div>
                )}
            </DashboardSection>

            <TaskActionModal
                isOpen={activeModal === "menunggu_review"}
                onClose={() => setActiveModal(null)}
                title="Menunggu Review"
                subtitle={`${s.menunggu_review || 0} penugasan menunggu penilaian Anda`}
                items={queue.filter(i => i.status_review !== "Telah direview")}
                columns={reviewColumns}
                onRecordClick={(item) => router.push(`/dashboard?module=reviewproposal&type=${item.type}&highlight_id=${item.reviewable_id}`)}
                emptyMessage="Tidak ada review yang menunggu."
            />

            <TaskActionModal
                isOpen={activeModal === "review_selesai"}
                onClose={() => setActiveModal(null)}
                title="Review Selesai"
                subtitle={`${s.review_selesai || 0} review telah diselesaikan`}
                items={completedQueue}
                columns={reviewColumns}
                onRecordClick={(item) => router.push(`/dashboard?module=reviewproposal&type=${item.type}&highlight_id=${item.reviewable_id}`)}
                emptyMessage="Belum ada review yang selesai."
            />

            <TaskActionModal
                isOpen={activeModal === "remaining_reviews"}
                onClose={() => setActiveModal(null)}
                title="Semua Antrian Review"
                subtitle={`${remainingCount} review lainnya menunggu Anda`}
                items={remainingQueue}
                columns={reviewColumns}
                onRecordClick={(item) => router.push(`/dashboard?module=reviewproposal&type=${item.type}&highlight_id=${item.reviewable_id}`)}
                emptyMessage="Tidak ada review lainnya."
            />
        </div>
    )

}
