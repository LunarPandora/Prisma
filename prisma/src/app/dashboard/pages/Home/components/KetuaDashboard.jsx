"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileLines, faClipboardCheck, faShieldHalved, faCalendarCheck } from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import ActionQueue from "./ActionQueue"
import RecentActivity from "./RecentActivity"
import Button from "@/app/component/Inputs/Button"
import { SummaryCardSkeleton, ActionQueueSkeleton } from "./LoadingSkeleton"
import { getKetuaDashboard } from "@/app/component/Libraries/api/dashboard"

export default function KetuaDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getKetuaDashboard()
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
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => <SummaryCardSkeleton key={i} />)}
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

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-4xl font-medium">Beranda</h1>
                <p className="text-lg text-gray-500 font-light">Keputusan yang menunggu persetujuan Anda</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard icon={faFileLines} label="Proposal Menunggu" value={s.proposal_menunggu || 0} subtitle="Persetujuan Seleksi" color="blue" />
                <SummaryCard icon={faClipboardCheck} label="Laporan Menunggu" value={s.laporan_menunggu || 0} subtitle="Keputusan diperlukan" color="orange" />
                <SummaryCard icon={faShieldHalved} label="Otorisasi Pending" value={s.pending_auth || 0} subtitle="Menunggu persetujuan" color="red" />
                <SummaryCard icon={faCalendarCheck} label="Edit Kegiatan" value={s.pending_kegiatan_edit || 0} subtitle="Menunggu otorisasi" color="purple" />
            </div>

            <DashboardSection title="Menunggu Keputusan Saya">
                <ActionQueue
                    items={data?.action_queue || []}
                    emptyMessage="Tidak ada keputusan yang menunggu. Semua persetujuan sudah diproses."
                />
            </DashboardSection>

            <DashboardSection title="Aktivitas Terbaru">
                <RecentActivity items={data?.recent_activity || []} />
            </DashboardSection>
        </div>
    )
}
