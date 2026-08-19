"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileLines, faUserCheck, faClipboardCheck, faMoneyBill } from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import ActionQueue from "./ActionQueue"
import BebanKerjaStaff from "./BebanKerjaStaff"
import PeriodeBanner from "./PeriodeBanner"
import RecentActivity from "./RecentActivity"
import Button from "@/app/component/Inputs/Button"
import { SummaryCardSkeleton, ActionQueueSkeleton, ChartSkeleton } from "./LoadingSkeleton"
import { getStaffDashboard } from "@/app/component/Libraries/api/dashboard"
import useHighlight from "@/app/component/Libraries/hooks/useHighlight"

export default function StaffDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const highlight = useHighlight()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getStaffDashboard()
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4"><ActionQueueSkeleton /></div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4"><ChartSkeleton /></div>
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
    const wl = data?.workload || {}

    const handleWorkloadCategoryClick = (highlightPrefix) => {
        highlight(highlightPrefix, { prefix: true, scroll: true })
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-semibold">Beranda</h1>
                <p className="text-base text-gray-500 mt-1">Tugas dan tanggung jawab Staff LPPM</p>
            </div>

            <DashboardSection title="Tahapan Kegiatan">
                <PeriodeBanner
                    periodes={data?.active_periodes || []}
                    kegiatanFlows={data?.kegiatan_flows || []}
                />
            </DashboardSection>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={faFileLines}
                    label="Seleksi Proposal"
                    value={s.proposal_selection_pending || 0}
                    subtitle={s.proposal_selection_pending > 0 ? "Menunggu pemeriksaan Staff" : "Tidak ada yang tertunda"}
                    color="blue"
                    href="/dashboard?module=staffmonitoringprogress"
                    actionLabel="Periksa Proposal"
                />
                <SummaryCard
                    icon={faUserCheck}
                    label="Penugasan Reviewer"
                    value={s.reviewer_assignment_pending || 0}
                    subtitle={s.reviewer_assignment_pending > 0 ? "Belum ditugaskan" : "Tidak ada yang perlu ditugaskan"}
                    color="yellow"
                    href="/dashboard?module=staffmonitoringprogress"
                    actionLabel="Tugaskan Reviewer"
                />
                <SummaryCard
                    icon={faClipboardCheck}
                    label="Pemeriksaan Laporan"
                    value={s.laporan_review_pending || 0}
                    subtitle={s.laporan_review_pending > 0 ? "Menunggu tindakan Staff" : "Tidak ada yang perlu diperiksa"}
                    color="orange"
                    href="/dashboard?module=staffmonitoringprogresslaporan"
                    actionLabel="Periksa Laporan"
                />
                <SummaryCard
                    icon={faMoneyBill}
                    label="Konfirmasi Dana"
                    value={s.dana_confirmation_pending || 0}
                    subtitle={s.dana_confirmation_pending > 0 ? "Menunggu konfirmasi Staff" : "Tidak ada konfirmasi tertunda"}
                    color="teal"
                    href="/dashboard?module=staffmonitoringprogresslaporan"
                    actionLabel="Konfirmasi Dana"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <DashboardSection title="Perlu Tindakan Anda">
                        <ActionQueue
                            items={data?.action_queue || []}
                            emptyMessage="Tidak ada tindakan yang perlu Anda lakukan saat ini."
                        />
                    </DashboardSection>
                </div>

                <div className="lg:col-span-2">
                    <DashboardSection title="Beban Kerja Staff">
                        <BebanKerjaStaff data={wl} onCategoryClick={handleWorkloadCategoryClick} />
                    </DashboardSection>
                </div>
            </div>

            <DashboardSection title="Perubahan Terbaru">
                <RecentActivity items={data?.recent_activity || []} />
            </DashboardSection>
        </div>
    )
}
