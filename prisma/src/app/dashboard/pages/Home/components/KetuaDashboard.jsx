"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileLines, faClipboardCheck, faShieldHalved, faCalendarCheck, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import RecentActivity from "./RecentActivity"
import TaskActionModal from "./TaskActionModal"
import Button from "@/app/component/Inputs/Button"
import Badge from "@/app/component/Display/Badge"
import { SummaryCardSkeleton, ActionQueueSkeleton } from "./LoadingSkeleton"
import { getKetuaDashboard } from "@/app/component/Libraries/api/dashboard"
import { getProposal } from "@/app/component/Libraries/api/proposal"
import { getLaporan } from "@/app/component/Libraries/api/laporan"
import {
    PROPOSAL_STATUS_COLORS,
    LAPORAN_STATUS_COLORS,
} from "@/app/component/Libraries/config/statusColors"

const PRIMARY_TASK_LIMIT = 3

const TASK_PRIORITY = {
    "Menunggu review dari Ketua LPPM": 1,
    "Menunggu keputusan Ketua": 2,
    "Menunggu review Admin": 3,
    "Menunggu Persetujuan": 4,
}

const STATUS_EXPLANATIONS = {
    "Menunggu review dari Ketua LPPM": "Proposal menunggu persetujuan seleksi dari Ketua LPPM.",
    "Menunggu keputusan Ketua": "Laporan menunggu keputusan akhir dari Ketua LPPM.",
    "Menunggu review Admin": "Laporan sedang diperiksa oleh Admin.",
    "Menunggu Persetujuan": "Otorisasi menunggu persetujuan Anda.",
}

const STATUS_ACTION_LABELS = {
    "Menunggu review dari Ketua LPPM": "Tinjau Proposal",
    "Menunggu keputusan Ketua": "Keputusan Laporan",
    "Menunggu review Admin": "Lihat Laporan",
    "Menunggu Persetujuan": "Tinjau Otorisasi",
}

function getStatusPriority(item) {
    return TASK_PRIORITY[item.status] || 99
}

function sortTasksByPriority(items) {
    return [...items].sort((a, b) => {
        const pa = getStatusPriority(a)
        const pb = getStatusPriority(b)
        if (pa !== pb) return pa - pb
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    })
}

function getTaskStatusBadge(type, status) {
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
    authorization: "Otorisasi",
}

function TaskCard({ item, onClick }) {
    const explanation = STATUS_EXPLANATIONS[item.status]
    const actionLabel = STATUS_ACTION_LABELS[item.status] || "Lihat"

    return (
        <div
            data-highlight={`action-${item.type}-${item.id}`}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
            onClick={onClick}
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
                </div>
                <p className="text-sm font-medium text-gray-800 truncate mb-1">
                    {item.title}
                </p>
                {explanation && (
                    <p className="text-xs text-gray-500 mb-1.5">{explanation}</p>
                )}
                <div className="flex items-center gap-2">
                    {getTaskStatusBadge(item.type, item.status)}
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:text-blue-800 whitespace-nowrap flex-shrink-0 mt-1">
                <span className="hidden sm:inline">{actionLabel}</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </div>
        </div>
    )
}

function ProposalSubtitle({ record }) {
    const jenis = record.jenis_penelitian || record.jenis_penelitian_gan || record.jenis_penelitian_gen || "-"
    return (
        <>
            <span>{record.dosen?.nama || "-"}</span>
            <span className="mx-1">·</span>
            <span>{record.skema || "-"}</span>
            <span className="mx-1">·</span>
            <span>{jenis}</span>
        </>
    )
}

function LaporanSubtitle({ record }) {
    return (
        <>
            <span>{record.ketua?.nama || "-"}</span>
            <span className="mx-1">·</span>
            <span>{record.skema || "-"}</span>
            <span className="mx-1">·</span>
            <span>{record.jenis_penelitian || "-"}</span>
            <span className="mx-1">·</span>
            <span>{record.semester || "-"}</span>
        </>
    )
}

export default function KetuaDashboard() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeModal, setActiveModal] = useState(null)

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

    const sortedTasks = useMemo(() => {
        const raw = data?.action_queue || []
        return sortTasksByPriority(raw)
    }, [data?.action_queue])

    const primaryTasks = useMemo(() => sortedTasks.slice(0, PRIMARY_TASK_LIMIT), [sortedTasks])
    const remainingTasks = useMemo(() => sortedTasks.slice(PRIMARY_TASK_LIMIT), [sortedTasks])
    const remainingCount = remainingTasks.length

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

    const handleTaskClick = (item) => {
        router.push(item.action_url)
    }

    const navigateToProposal = (record) => {
        const params = new URLSearchParams({
            module: "staffmonitoringprogress",
            view: "proposal",
            proposal_id: record.proposal_id,
            tab: "SELEKSI_PROPOSAL",
        })
        if (record.skema_id) params.set("skema_id", record.skema_id)
        router.push(`/dashboard?${params.toString()}`)
    }

    const navigateToLaporan = (record) => {
        const params = new URLSearchParams({
            module: "staffmonitoringprogresslaporan",
            view: "laporan",
            laporan_id: record.laporan_id,
        })
        if (record.skema_id) params.set("skema_id", record.skema_id)
        if (record.tab) params.set("tab", record.tab)
        router.push(`/dashboard?${params.toString()}`)
    }

    const fetchProposalRecords = async (status, page, perPage) => {
        const res = await getProposal(`status=${encodeURIComponent(status)}&per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const fetchLaporanRecords = async (page, perPage) => {
        const res = await getLaporan(`pending_ketua=1&per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const proposalColumns = [
        { key: "judul", render: (r) => r.judul || "-" },
        { render: (r) => <ProposalSubtitle record={r} /> },
        { key: "status", render: (r) => <Badge color="blue" size="xs">{r.status}</Badge> },
    ]

    const laporanColumns = [
        { key: "judul", render: (r) => r.judul || "-" },
        { render: (r) => <LaporanSubtitle record={r} /> },
        { key: "status", render: (r) => <Badge color="orange" size="xs">{r.status}</Badge> },
    ]

    const remainingModalColumns = [
        {
            key: "title",
            render: (r) => `${TYPE_LABELS[r.type] || r.type}: ${r.title}`,
        },
        {
            render: (r) => STATUS_EXPLANATIONS[r.status] || "",
        },
        {
            key: "status",
            render: (r) => getTaskStatusBadge(r.type, r.status),
        },
    ]

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-4xl font-medium">Beranda</h1>
                <p className="text-lg text-gray-500 font-light">Keputusan yang menunggu persetujuan Anda</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={faFileLines}
                    label="Proposal Menunggu"
                    value={s.proposal_menunggu || 0}
                    subtitle={s.proposal_menunggu > 0 ? "Menunggu persetujuan seleksi" : "Tidak ada yang tertunda"}
                    color="blue"
                    actionLabel="Tinjau Proposal"
                    onCtaClick={() => setActiveModal("proposal_seleksi")}
                />
                <SummaryCard
                    icon={faClipboardCheck}
                    label="Laporan Menunggu"
                    value={s.laporan_menunggu || 0}
                    subtitle={s.laporan_menunggu > 0 ? "Keputusan diperlukan" : "Tidak ada yang perlu diputuskan"}
                    color="orange"
                    actionLabel="Tinjau Laporan"
                    onCtaClick={() => setActiveModal("laporan_keputusan")}
                />
                <SummaryCard
                    icon={faShieldHalved}
                    label="Otorisasi Pending"
                    value={s.pending_auth || 0}
                    subtitle={s.pending_auth > 0 ? "Menunggu persetujuan Anda" : "Tidak ada otorisasi tertunda"}
                    color="red"
                    actionLabel="Tinjau Otorisasi"
                    onCtaClick={() => setActiveModal("otorisasi")}
                />
                <SummaryCard
                    icon={faCalendarCheck}
                    label="Edit Kegiatan"
                    value={s.pending_kegiatan_edit || 0}
                    subtitle={s.pending_kegiatan_edit > 0 ? "Menunggu otorisasi" : "Tidak ada edit tertunda"}
                    color="purple"
                    actionLabel="Tinjau Edit"
                    onCtaClick={() => setActiveModal("edit_kegiatan")}
                />
            </div>

            <DashboardSection title="Menunggu Keputusan Saya">
                {sortedTasks.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Tidak ada keputusan yang menunggu</p>
                        <p className="text-xs text-gray-400">Semua persetujuan sudah diproses.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {primaryTasks.map((item, index) => (
                            <TaskCard
                                key={`${item.type}-${item.id}-${index}`}
                                item={item}
                                onClick={() => handleTaskClick(item)}
                            />
                        ))}

                        {remainingCount > 0 && (
                            <button
                                onClick={() => setActiveModal("remaining_tasks")}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 hover:border-blue-300 transition-all"
                            >
                                <span>Lihat {remainingCount} tugas lainnya</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </button>
                        )}
                    </div>
                )}
            </DashboardSection>

            <DashboardSection title="Aktivitas Terbaru">
                <RecentActivity items={data?.recent_activity || []} />
            </DashboardSection>

            <TaskActionModal
                isOpen={activeModal === "remaining_tasks"}
                onClose={() => setActiveModal(null)}
                title="Semua Tugas yang Perlu Ditindaklanjuti"
                subtitle={`${remainingCount} tugas menunggu tindakan Anda`}
                items={remainingTasks}
                columns={remainingModalColumns}
                onRecordClick={handleTaskClick}
                emptyMessage="Tidak ada tugas lainnya."
            />

            <TaskActionModal
                isOpen={activeModal === "proposal_seleksi"}
                onClose={() => setActiveModal(null)}
                title="Proposal Menunggu Persetujuan Seleksi"
                subtitle={`${s.proposal_menunggu || 0} proposal menunggu persetujuan Anda`}
                fetchRecords={(page, perPage) => fetchProposalRecords("Menunggu review dari Ketua LPPM", page, perPage)}
                columns={proposalColumns}
                onRecordClick={navigateToProposal}
                emptyMessage="Tidak ada proposal yang menunggu persetujuan."
                viewAllUrl="/dashboard?module=staffmonitoringprogress"
                viewAllLabel="Lihat Semua Proposal"
            />

            <TaskActionModal
                isOpen={activeModal === "laporan_keputusan"}
                onClose={() => setActiveModal(null)}
                title="Laporan Menunggu Keputusan"
                subtitle={`${s.laporan_menunggu || 0} laporan menunggu keputusan Anda`}
                fetchRecords={fetchLaporanRecords}
                columns={laporanColumns}
                onRecordClick={navigateToLaporan}
                emptyMessage="Tidak ada laporan yang menunggu keputusan."
                viewAllUrl="/dashboard?module=staffmonitoringprogresslaporan"
                viewAllLabel="Lihat Semua Laporan"
            />

            <TaskActionModal
                isOpen={activeModal === "otorisasi"}
                onClose={() => setActiveModal(null)}
                title="Otorisasi Menunggu Persetujuan"
                subtitle={`${s.pending_auth || 0} otorisasi menunggu persetujuan Anda`}
                items={(data?.action_queue || []).filter(i => i.type === "authorization")}
                columns={[
                    { key: "title", render: (r) => r.title || "-" },
                    { render: (r) => r.owner || "-" },
                    { key: "status", render: (r) => <Badge color="red" size="xs">{r.status}</Badge> },
                ]}
                onRecordClick={handleTaskClick}
                emptyMessage="Tidak ada otorisasi yang menunggu."
            />

            <TaskActionModal
                isOpen={activeModal === "edit_kegiatan"}
                onClose={() => setActiveModal(null)}
                title="Edit Kegiatan Menunggu Otorisasi"
                subtitle={`${s.pending_kegiatan_edit || 0} edit kegiatan menunggu otorisasi`}
                items={(data?.action_queue || []).filter(i => i.type === "kegiatan_edit")}
                columns={[
                    { key: "title", render: (r) => r.title || "-" },
                    { render: (r) => r.owner || "-" },
                    { key: "status", render: (r) => <Badge color="purple" size="xs">{r.status}</Badge> },
                ]}
                onRecordClick={handleTaskClick}
                emptyMessage="Tidak ada edit kegiatan yang menunggu."
            />
        </div>
    )
}
