"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { faFileLines, faUserCheck, faClipboardCheck, faMoneyBill, faArrowRight, faInbox } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import ActionQueue from "./ActionQueue"
import BebanKerjaStaff from "./BebanKerjaStaff"
import PeriodeBanner from "./PeriodeBanner"
import RecentActivity from "./RecentActivity"
import TaskActionModal from "./TaskActionModal"
import Button from "@/app/component/Inputs/Button"
import Badge from "@/app/component/Display/Badge"
import { SummaryCardSkeleton, ActionQueueSkeleton, ChartSkeleton } from "./LoadingSkeleton"
import { getStaffDashboard } from "@/app/component/Libraries/api/dashboard"
import { getProposal } from "@/app/component/Libraries/api/proposal"
import { getLaporan } from "@/app/component/Libraries/api/laporan"
import { getDana } from "@/app/component/Libraries/api/dana"
import useHighlight from "@/app/component/Libraries/hooks/useHighlight"
import {
    PROPOSAL_STATUS_COLORS,
    LAPORAN_STATUS_COLORS,
    DANA_STATUS_COLORS,
} from "@/app/component/Libraries/config/statusColors"

const PRIMARY_TASK_LIMIT = 3

const TASK_PRIORITY = {
    "Menunggu review Staff LPPM": 1,
    "Menunggu penugasan reviewer": 2,
    "Menunggu review Admin": 3,
    "Menunggu bukti terima": 4,
    "Menunggu konfirmasi admin": 5,
    "Menunggu Pengembalian Dana": 6,
}

const STATUS_EXPLANATIONS = {
    "Menunggu review Staff LPPM": "Proposal sedang diperiksa oleh Staff LPPM.",
    "Menunggu penugasan reviewer": "Menunggu penugasan reviewer dari Staff LPPM.",
    "Menunggu review": "Proposal sedang dalam proses review oleh reviewer.",
    "Menunggu review Admin": "Laporan sedang diperiksa oleh Admin.",
    "Dalam pengerjaan": "Laporan sedang dikerjakan dan perlu dilengkapi.",
    "Menunggu kelengkapan data": "Data laporan belum lengkap dan perlu dilengkapi.",
    "Revisi": "Laporan perlu diperbaiki sesuai catatan review.",
    "Menunggu bukti terima": "Dana telah ditransfer, menunggu konfirmasi penerimaan dari Dosen.",
    "Menunggu konfirmasi admin": "Bukti penerimaan/pengembalian dana perlu dikonfirmasi oleh Staff.",
    "Menunggu Pengembalian Dana": "Dana perlu dikembalikan oleh Dosen yang bersangkutan.",
}

const STATUS_ACTION_LABELS = {
    "Menunggu review Staff LPPM": "Periksa Proposal",
    "Menunggu penugasan reviewer": "Tugaskan Reviewer",
    "Menunggu review Admin": "Periksa Laporan",
    "Menunggu bukti terima": "Konfirmasi",
    "Menunggu konfirmasi admin": "Konfirmasi",
    "Menunggu Pengembalian Dana": "Lihat Status",
}

function getStatusPriority(item) {
    const status = item.status || ""
    return TASK_PRIORITY[status] || 99
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

const MODAL_CONFIGS = {
    seleksi_proposal: {
        title: "Proposal Menunggu Pemeriksaan",
        emptyMessage: "Tidak ada proposal yang memerlukan pemeriksaan saat ini.",
        viewAllUrl: "/dashboard?module=staffmonitoringprogress",
        viewAllLabel: "Lihat Semua Proposal",
    },
    penugasan_reviewer: {
        title: "Proposal Menunggu Penugasan Reviewer",
        emptyMessage: "Tidak ada proposal yang perlu ditugaskan reviewer saat ini.",
        viewAllUrl: "/dashboard?module=staffmonitoringprogress",
        viewAllLabel: "Lihat Semua Proposal",
    },
    pemeriksaan_laporan: {
        title: "Laporan Menunggu Pemeriksaan",
        emptyMessage: "Tidak ada laporan yang memerlukan pemeriksaan saat ini.",
        viewAllUrl: "/dashboard?module=staffmonitoringprogresslaporan",
        viewAllLabel: "Lihat Semua Laporan",
    },
    konfirmasi_dana: {
        title: "Dana Menunggu Konfirmasi",
        emptyMessage: "Tidak ada konfirmasi dana yang tertunda saat ini.",
        viewAllUrl: "/dashboard?module=staffmonitoringprogresslaporan",
        viewAllLabel: "Lihat Semua Dana",
    },
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

function DanaSubtitle({ record }) {
    return (
        <>
            <span>{record.proposal?.user?.nama || "-"}</span>
            <span className="mx-1">·</span>
            <span>{record.semester || "-"}</span>
        </>
    )
}

export default function StaffDashboard() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeModal, setActiveModal] = useState(null)
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

    const fetchProposalRecords = async (status, page, perPage) => {
        const res = await getProposal(`status=${encodeURIComponent(status)}&per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const fetchLaporanRecords = async (page, perPage) => {
        const res = await getLaporan(`pending_staff=1&per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const fetchDanaRecords = async (page, perPage) => {
        const res = await getDana(`pending_staff=1&per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const deriveTab = (kodeKegiatan) => {
        if (!kodeKegiatan) return "PROSES_PENELITIAN"
        return kodeKegiatan.replace(/_(GANJIL|GENAP)$/, "")
    }

    const navigateToProposal = (record) => {
        const skemaId = record.skema_id || record.kegiatan?.skema?.skema_id || record.kegiatan?.skema_id || ""
        const params = new URLSearchParams({
            module: "staffmonitoringprogress",
            view: "proposal",
            proposal_id: record.proposal_id,
            tab: "SELEKSI_PROPOSAL",
        })
        if (skemaId) params.set("skema_id", skemaId)
        router.push(`/dashboard?${params.toString()}`)
    }

    const navigateToLaporan = (record, overrideTab) => {
        const skemaId = record.skema_id || record.kegiatan?.skema?.skema_id || record.kegiatan?.skema_id || ""
        const tab = overrideTab || deriveTab(record.kode_kegiatan)
        const params = new URLSearchParams({
            module: "staffmonitoringprogresslaporan",
            view: "laporan",
            laporan_id: record.laporan_id,
            tab,
        })
        if (skemaId) params.set("skema_id", skemaId)
        router.push(`/dashboard?${params.toString()}`)
    }

    const handleTaskClick = (item) => {
        router.push(item.action_url)
    }

    const proposalColumns = [
        { key: "judul", render: (r) => r.judul || "-" },
        { render: (r) => <ProposalSubtitle record={r} /> },
        { key: "status", render: (r) => <Badge color="yellow" size="xs">{r.status}</Badge> },
    ]

    const reviewerColumns = [
        { key: "judul", render: (r) => r.judul || "-" },
        { render: (r) => <ProposalSubtitle record={r} /> },
        { key: "status", render: (r) => <Badge color="orange" size="xs">{r.status}</Badge> },
    ]

    const laporanColumns = [
        { key: "judul", render: (r) => r.judul || "-" },
        { render: (r) => <LaporanSubtitle record={r} /> },
        { key: "status", render: (r) => <Badge color="yellow" size="xs">{r.status}</Badge> },
    ]

    const danaColumns = [
        { key: "judul_penelitian", render: (r) => r.judul_penelitian || r.judul || "-" },
        { render: (r) => <DanaSubtitle record={r} /> },
        { key: "status", render: (r) => {
            const status = r.claim_dana_status || r.pengembalian_dana_status || "-"
            return <Badge color="yellow" size="xs">{status}</Badge>
        }},
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
                    actionLabel="Periksa Proposal"
                    onCtaClick={() => setActiveModal("seleksi_proposal")}
                />
                <SummaryCard
                    icon={faUserCheck}
                    label="Penugasan Reviewer"
                    value={s.reviewer_assignment_pending || 0}
                    subtitle={s.reviewer_assignment_pending > 0 ? "Belum ditugaskan" : "Tidak ada yang perlu ditugaskan"}
                    color="yellow"
                    actionLabel="Tugaskan Reviewer"
                    onCtaClick={() => setActiveModal("penugasan_reviewer")}
                />
                <SummaryCard
                    icon={faClipboardCheck}
                    label="Pemeriksaan Laporan"
                    value={s.laporan_review_pending || 0}
                    subtitle={s.laporan_review_pending > 0 ? "Menunggu tindakan Staff" : "Tidak ada yang perlu diperiksa"}
                    color="orange"
                    actionLabel="Periksa Laporan"
                    onCtaClick={() => setActiveModal("pemeriksaan_laporan")}
                />
                <SummaryCard
                    icon={faMoneyBill}
                    label="Konfirmasi Dana"
                    value={s.dana_confirmation_pending || 0}
                    subtitle={s.dana_confirmation_pending > 0 ? "Menunggu konfirmasi Staff" : "Tidak ada konfirmasi tertunda"}
                    color="teal"
                    actionLabel="Konfirmasi Dana"
                    onCtaClick={() => setActiveModal("konfirmasi_dana")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <DashboardSection title="Perlu Tindakan Anda">
                        {sortedTasks.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Tidak ada tindakan yang perlu dilakukan</p>
                                <p className="text-xs text-gray-400">Semua tugas Anda saat ini sudah selesai.</p>
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
                isOpen={activeModal === "seleksi_proposal"}
                onClose={() => setActiveModal(null)}
                title={MODAL_CONFIGS.seleksi_proposal.title}
                subtitle={`${s.proposal_selection_pending || 0} proposal memerlukan tindakan Anda`}
                fetchRecords={(page, perPage) => fetchProposalRecords("Menunggu review Staff LPPM", page, perPage)}
                columns={proposalColumns}
                onRecordClick={navigateToProposal}
                emptyMessage={MODAL_CONFIGS.seleksi_proposal.emptyMessage}
                viewAllUrl={MODAL_CONFIGS.seleksi_proposal.viewAllUrl}
                viewAllLabel={MODAL_CONFIGS.seleksi_proposal.viewAllLabel}
            />

            <TaskActionModal
                isOpen={activeModal === "penugasan_reviewer"}
                onClose={() => setActiveModal(null)}
                title={MODAL_CONFIGS.penugasan_reviewer.title}
                subtitle={`${s.reviewer_assignment_pending || 0} proposal memerlukan penugasan reviewer`}
                fetchRecords={(page, perPage) => fetchProposalRecords("Menunggu penugasan reviewer", page, perPage)}
                columns={reviewerColumns}
                onRecordClick={navigateToProposal}
                emptyMessage={MODAL_CONFIGS.penugasan_reviewer.emptyMessage}
                viewAllUrl={MODAL_CONFIGS.penugasan_reviewer.viewAllUrl}
                viewAllLabel={MODAL_CONFIGS.penugasan_reviewer.viewAllLabel}
            />

            <TaskActionModal
                isOpen={activeModal === "pemeriksaan_laporan"}
                onClose={() => setActiveModal(null)}
                title={MODAL_CONFIGS.pemeriksaan_laporan.title}
                subtitle={`${s.laporan_review_pending || 0} laporan memerlukan tindakan Anda`}
                fetchRecords={fetchLaporanRecords}
                columns={laporanColumns}
                onRecordClick={(r) => navigateToLaporan(r)}
                emptyMessage={MODAL_CONFIGS.pemeriksaan_laporan.emptyMessage}
                viewAllUrl={MODAL_CONFIGS.pemeriksaan_laporan.viewAllUrl}
                viewAllLabel={MODAL_CONFIGS.pemeriksaan_laporan.viewAllLabel}
            />

            <TaskActionModal
                isOpen={activeModal === "konfirmasi_dana"}
                onClose={() => setActiveModal(null)}
                title={MODAL_CONFIGS.konfirmasi_dana.title}
                subtitle={`${s.dana_confirmation_pending || 0} konfirmasi dana tertunda`}
                fetchRecords={fetchDanaRecords}
                columns={danaColumns}
                onRecordClick={(r) => navigateToLaporan(r, "CLAIM_DANA")}
                emptyMessage={MODAL_CONFIGS.konfirmasi_dana.emptyMessage}
                viewAllUrl={MODAL_CONFIGS.konfirmasi_dana.viewAllUrl}
                viewAllLabel={MODAL_CONFIGS.konfirmasi_dana.viewAllLabel}
            />
        </div>
    )
}
