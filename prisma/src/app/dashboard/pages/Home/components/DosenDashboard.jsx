"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFileLines,
    faClipboardList,
    faExclamationTriangle,
    faCheckCircle,
    faClock,
    faArrowRight,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import ActionQueue from "./ActionQueue"
import RecentActivity from "./RecentActivity"
import WorkflowProgressTracker from "./WorkflowProgressTracker"
import WaitingProcess from "./WaitingProcess"
import Button from "@/app/component/Inputs/Button"
import { SummaryCardSkeleton, ActionQueueSkeleton } from "./LoadingSkeleton"
import { getDosenDashboard } from "@/app/component/Libraries/api/dashboard"
import useHighlight from "@/app/component/Libraries/hooks/useHighlight"

export default function DosenDashboard() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const highlight = useHighlight()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getDosenDashboard()
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <SummaryCardSkeleton key={i} />)}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4"><ActionQueueSkeleton /></div>
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
    const actionQueue = data?.action_queue || []
    const waitingProcess = data?.waiting_process || []
    const recentActivity = data?.recent_activity || []
    const workflowProgress = data?.workflow_progress

    const handleSummaryClick = (highlightPrefix) => {
        highlight(highlightPrefix, { prefix: true, scroll: true })
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-medium">Beranda</h1>
                <p className="text-lg text-gray-500 font-light">Apa yang perlu Anda lakukan hari ini</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={faFileLines}
                    label="Proposal Aktif"
                    value={s.total_proposal || 0}
                    subtitle="Total diajukan"
                    color="blue"
                    description={`${s.total_proposal || 0} proposal telah diajukan`}
                />
                <SummaryCard
                    icon={faClipboardList}
                    label="Laporan Berjalan"
                    value={s.laporan_aktif || 0}
                    subtitle="Sedang berjalan"
                    color="teal"
                    description={`${s.laporan_aktif || 0} laporan aktif`}
                />
                <SummaryCard
                    icon={faExclamationTriangle}
                    label="Perlu Tindakan"
                    value={s.perlu_tindakan || 0}
                    subtitle="Menunggu aksi Anda"
                    color="red"
                    href="/dashboard?module=dosenmonitoringprogress"
                    actionLabel={s.perlu_tindakan > 0 ? "Lihat Tindakan" : undefined}
                    description={s.perlu_tindakan > 0 ? "Ada laporan yang perlu diselesaikan" : "Semua sudah beres"}
                />
                <SummaryCard
                    icon={faCheckCircle}
                    label="Selesai"
                    value={s.laporan_selesai || 0}
                    subtitle="Terkirim"
                    color="green"
                    description={`${s.laporan_selesai || 0} laporan selesai`}
                />
            </div>

            {/* Perlu Tindakan Anda - Primary Section */}
            <DashboardSection title="Perlu Tindakan Anda">
                <ActionQueue
                    items={actionQueue}
                    emptyMessage="Tidak ada tindakan yang diperlukan saat ini."
                />
            </DashboardSection>

            {/* Progress Penelitian + Waiting Process */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workflowProgress && (
                    <DashboardSection title="Progress Penelitian">
                        <WorkflowProgressTracker progress={workflowProgress} />
                    </DashboardSection>
                )}

                <DashboardSection title="Menunggu Proses">
                    <WaitingProcess
                        items={waitingProcess}
                        emptyMessage="Tidak ada proses yang sedang menunggu pihak lain."
                    />
                </DashboardSection>
            </div>

            {/* Aktivitas Terbaru */}
            <DashboardSection title="Aktivitas Terbaru">
                <RecentActivity items={recentActivity} />
            </DashboardSection>
        </div>
    )
}
