"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsers, faBook, faFileLines, faBuilding } from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import ActionQueue from "./ActionQueue"
import Button from "@/app/component/Inputs/Button"
import { SummaryCardSkeleton, ActionQueueSkeleton } from "./LoadingSkeleton"
import { getSuperadminDashboard } from "@/app/component/Libraries/api/dashboard"

export default function SuperadminDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getSuperadminDashboard()
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
                <p className="text-lg text-gray-500 font-light">Overview sistem PRISMA</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard icon={faUsers} label="Total Pengguna" value={s.total_users || 0} subtitle="Semua role" color="blue" />
                <SummaryCard icon={faBook} label="Total Skema" value={s.total_skema || 0} subtitle={`${s.active_skema || 0} aktif`} color="purple" />
                <SummaryCard icon={faFileLines} label="Total Proposal" value={s.total_proposals || 0} subtitle="Semua status" color="teal" />
                <SummaryCard icon={faBuilding} label="Laporan Aktif" value={s.active_laporan || 0} subtitle={`dari ${s.total_laporan || 0} total`} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DashboardSection title="Pengguna per Role">
                    <div className="flex flex-col gap-2">
                        {Object.entries(data?.summary?.users_by_role || {}).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{role}</span>
                                <span className="text-sm font-semibold text-gray-800">{count}</span>
                            </div>
                        ))}
                    </div>
                </DashboardSection>

                <DashboardSection title="Kegiatan per Status">
                    <div className="flex flex-col gap-2">
                        {Object.entries(data?.kegiatan_by_status || {}).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{status}</span>
                                <span className="text-sm font-semibold text-gray-800">{count}</span>
                            </div>
                        ))}
                        {Object.keys(data?.kegiatan_by_status || {}).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">Belum ada data kegiatan</p>
                        )}
                    </div>
                </DashboardSection>
            </div>

            <DashboardSection title="Proposal Terbaru">
                <ActionQueue
                    items={(data?.recent_proposals || []).map((p) => ({
                        type: "proposal",
                        id: p.proposal_id,
                        title: p.judul,
                        status: p.status,
                        owner: p.dosen,
                        action_url: "/dashboard?module=users",
                    }))}
                    emptyMessage="Belum ada proposal"
                />
            </DashboardSection>
        </div>
    )
}
