"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faSpinner, faCheckCircle, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import Badge from "@/app/component/Display/Badge"
import Button from "@/app/component/Inputs/Button"
import { SummaryCardSkeleton } from "./LoadingSkeleton"
import { getReviewerDashboard } from "@/app/component/Libraries/api/dashboard"

export default function ReviewerDashboard() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-4xl font-medium">Beranda</h1>
                <p className="text-lg text-gray-500 font-light">Tugas review yang menunggu Anda</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <SummaryCard icon={faClock} label="Menunggu Review" value={s.menunggu_review || 0} subtitle="Belum dinilai" color="yellow" />
                <SummaryCard icon={faSpinner} label="Sedang Dikerjakan" value={s.sedang_dikerjakan || 0} subtitle="Sedang dinilai" color="blue" />
                <SummaryCard icon={faCheckCircle} label="Review Selesai" value={s.review_selesai || 0} subtitle="Telah selesai" color="green" />
            </div>

            <DashboardSection title="Antrian Review">
                {queue.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">Tidak ada review yang menunggu.</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-gray-100">
                        {queue.map((item) => (
                            <div
                                key={item.penugasan_id || item.id}
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
                                    onClick={() => router.push(`/dashboard?module=reviewproposal&type=${item.type}&highlight_id=${item.reviewable_id}`)}
                                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap cursor-pointer"
                                >
                                    Mulai Penilaian
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardSection>
        </div>
    )
}
