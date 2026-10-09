"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFileLines,
    faClipboardList,
    faExclamationTriangle,
    faCheckCircle,
    faArrowRight,
    faClock,
} from "@fortawesome/free-solid-svg-icons"
import SummaryCard from "./SummaryCard"
import DashboardSection from "./DashboardSection"
import ActionQueue from "./ActionQueue"
import RecentActivity from "./RecentActivity"
import WorkflowProgressTracker from "./WorkflowProgressTracker"
import TaskActionModal from "./TaskActionModal"
import Button from "@/app/component/Inputs/Button"
import Badge from "@/app/component/Display/Badge"
import { SummaryCardSkeleton, ActionQueueSkeleton } from "./LoadingSkeleton"
import { getDosenDashboard } from "@/app/component/Libraries/api/dashboard"
import { getProposal } from "@/app/component/Libraries/api/proposal"
import { getLaporan } from "@/app/component/Libraries/api/laporan"
import useHighlight from "@/app/component/Libraries/hooks/useHighlight"
import {
    PROPOSAL_STATUS_COLORS,
    LAPORAN_STATUS_COLORS,
} from "@/app/component/Libraries/config/statusColors"

const PRIMARY_TASK_LIMIT = 3
const WAITING_LIMIT = 3

const PERLU_TINDAKAN_STATUSES = [
    "Dalam pengerjaan",
    "Menunggu kelengkapan data",
    "Revisi",
    "Menunggu konfirmasi penerimaan dana",
    "Menunggu Pengembalian Dana",
]

const TASK_PRIORITY = {
    "Dalam pengerjaan": 1,
    "Menunggu kelengkapan data": 2,
    "Revisi": 3,
    "Menunggu konfirmasi penerimaan dana": 4,
    "Menunggu Pengembalian Dana": 5,
}

const STATUS_EXPLANATIONS = {
    "Dalam pengerjaan": "Laporan sedang dikerjakan dan perlu dilengkapi.",
    "Menunggu kelengkapan data": "Data laporan belum lengkap dan perlu dilengkapi sebelum proses berikutnya.",
    "Revisi": "Laporan perlu diperbaiki sesuai catatan review.",
    "Menunggu konfirmasi penerimaan dana": "Dana telah ditransfer, menunggu konfirmasi penerimaan dari Anda.",
    "Menunggu Pengembalian Dana": "Dana perlu dikembalikan sesuai ketentuan.",
    "Menunggu review Staff LPPM": "Sedang diperiksa oleh Staff LPPM.",
    "Menunggu penugasan reviewer": "Menunggu Staff LPPM menugaskan reviewer.",
    "Menunggu review": "Review sedang dilakukan oleh reviewer.",
    "Menunggu persetujuan Ketua LPPM": "Menunggu persetujuan dari Ketua LPPM.",
    "Menunggu review Admin": "Sedang diperiksa oleh Admin.",
    "Menunggu hasil dari Reviewers": "Menunggu hasil review dari reviewers.",
    "Menunggu keputusan Ketua": "Menunggu keputusan dari Ketua.",
    "Menunggu penugasan Reviewer": "Menunggu penugasan reviewer.",
    "Menunggu Persetujuan Ketua LPPM": "Menunggu persetujuan dari Ketua LPPM.",
}

const STATUS_ACTION_LABELS = {
    "Dalam pengerjaan": "Lengkapi Laporan",
    "Menunggu kelengkapan data": "Lengkapi Data",
    "Revisi": "Perbaiki Laporan",
    "Menunggu konfirmasi penerimaan dana": "Konfirmasi",
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
    return <Badge color="gray" size="xs">{status}</Badge>
}

const TYPE_LABELS = {
    proposal: "Proposal",
    laporan: "Laporan",
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
                    {item.jenis && (
                        <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            {item.jenis}
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
            <span>{record.skema || "-"}</span>
            <span className="mx-1">·</span>
            <span>{jenis}</span>
        </>
    )
}

function LaporanSubtitle({ record }) {
    return (
        <>
            <span>{record.skema || "-"}</span>
            <span className="mx-1">·</span>
            <span>{record.jenis_penelitian || "-"}</span>
            <span className="mx-1">·</span>
            <span>{record.semester || "-"}</span>
        </>
    )
}

export default function DosenDashboard() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeModal, setActiveModal] = useState(null)
    const [perluTindakanCount, setPerluTindakanCount] = useState(null)
    const highlight = useHighlight()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getDosenDashboard()
                setData(res.data.data)

                const statusQuery = PERLU_TINDAKAN_STATUSES.map(s => `status[]=${encodeURIComponent(s)}`).join("&")
                const countRes = await getLaporan(`${statusQuery}&count_only=1`)
                setPerluTindakanCount(countRes.data.data?.total ?? 0)
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

    const waitingProcess = data?.waiting_process || []

    const primaryWaiting = useMemo(() => waitingProcess.slice(0, WAITING_LIMIT), [waitingProcess])
    const remainingWaiting = useMemo(() => waitingProcess.slice(WAITING_LIMIT), [waitingProcess])
    const remainingWaitingCount = remainingWaiting.length

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
    const recentActivity = data?.recent_activity || []
    const workflowProgress = data?.workflow_progress

    const handleTaskClick = (item) => {
        router.push(item.action_url)
    }

    const deriveTab = (kodeKegiatan) => {
        if (!kodeKegiatan) return "PROSES_PENELITIAN"
        return kodeKegiatan.replace(/_(GANJIL|GENAP)$/, "")
    }

    const deriveProposalTab = (status) => {
        if (["Draft", "Menunggu proposal untuk diupload", "Ditolak", "Revisi"].includes(status)) {
            return "PENERIMAAN_PROPOSAL"
        }
        if (status === "Proposal Diterima") {
            return "PENGUMUMAN_SURAT_TUGAS"
        }
        return "SELEKSI_PROPOSAL"
    }

    const navigateToProposal = (record) => {
        const skemaId = record.skema_id || record.kegiatan?.skema?.skema_id || record.kegiatan?.skema_id || ""
        const tab = deriveProposalTab(record.status)
        const params = new URLSearchParams({
            module: "dosenmonitoringprogress",
            view: "proposal",
            proposal_id: record.proposal_id,
            tab,
        })
        if (skemaId) params.set("skema_id", skemaId)
        if (record.jenis_penelitian) params.set("jenis", record.jenis_penelitian)
        router.push(`/dashboard?${params.toString()}`)
    }

    const navigateToLaporan = (record, overrideTab) => {
        const skemaId = record.skema_id || record.kegiatan?.skema?.skema_id || record.kegiatan?.skema_id || ""
        const tab = overrideTab || deriveTab(record.kode_kegiatan)
        const params = new URLSearchParams({
            module: "dosenmonitoringprogresslaporan",
            view: "laporan",
            laporan_id: record.laporan_id,
            tab,
        })
        if (skemaId) params.set("skema_id", skemaId)
        if (record.jenis_penelitian) params.set("jenis", record.jenis_penelitian)
        router.push(`/dashboard?${params.toString()}`)
    }

    const fetchProposalRecords = async (page, perPage) => {
        const res = await getProposal(`per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const fetchActiveLaporanRecords = async (page, perPage) => {
        const res = await getLaporan(`per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const fetchPerluTindakanRecords = async (page, perPage) => {
        const query = PERLU_TINDAKAN_STATUSES.map(s => `status[]=${encodeURIComponent(s)}`).join("&")
        const res = await getLaporan(`${query}&per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const fetchSelesaiRecords = async (page, perPage) => {
        const res = await getLaporan(`status=Selesai&per_page=${perPage}&page=${page}`)
        return res.data.data
    }

    const proposalColumns = [
        { key: "judul", render: (r) => r.judul || "-" },
        { render: (r) => <ProposalSubtitle record={r} /> },
        { key: "status", render: (r) => {
            const style = PROPOSAL_STATUS_COLORS[r.status?.toLowerCase()] || PROPOSAL_STATUS_COLORS.default
            return <Badge color={style.color} size="xs">{style.label}</Badge>
        }},
    ]

    const laporanColumns = [
        { key: "judul_penelitian", render: (r) => r.judul_penelitian || r.judul || "-" },
        { render: (r) => <LaporanSubtitle record={r} /> },
        { key: "status", render: (r) => {
            const style = LAPORAN_STATUS_COLORS[r.status?.toLowerCase()] || LAPORAN_STATUS_COLORS.default
            return <Badge color={style.color} size="xs">{style.label}</Badge>
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
                <h1 className="text-4xl font-medium">Beranda</h1>
                <p className="text-lg text-gray-500 font-light">Apa yang perlu Anda lakukan hari ini</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={faFileLines}
                    label="Proposal Aktif"
                    value={s.total_proposal || 0}
                    subtitle="Total diajukan"
                    color="blue"
                    description={`${s.total_proposal || 0} proposal telah diajukan`}
                    actionLabel={s.total_proposal > 0 ? "Lihat Proposal" : undefined}
                    onCtaClick={s.total_proposal > 0 ? () => setActiveModal("proposal_aktif") : undefined}
                />
                <SummaryCard
                    icon={faClipboardList}
                    label="Laporan Berjalan"
                    value={s.laporan_aktif || 0}
                    subtitle="Sedang berjalan"
                    color="teal"
                    description={`${s.laporan_aktif || 0} laporan aktif`}
                    actionLabel={s.laporan_aktif > 0 ? "Lihat Laporan" : undefined}
                    onCtaClick={s.laporan_aktif > 0 ? () => setActiveModal("laporan_berjalan") : undefined}
                />
                <SummaryCard
                    icon={faExclamationTriangle}
                    label="Perlu Tindakan"
                    value={perluTindakanCount ?? (s.perlu_tindakan || 0)}
                    subtitle="Menunggu aksi Anda"
                    color="red"
                    description={(perluTindakanCount ?? s.perlu_tindakan) > 0 ? "Ada laporan yang perlu diselesaikan" : "Semua sudah beres"}
                    actionLabel={(perluTindakanCount ?? s.perlu_tindakan) > 0 ? "Lihat Tindakan" : undefined}
                    onCtaClick={(perluTindakanCount ?? s.perlu_tindakan) > 0 ? () => setActiveModal("perlu_tindakan") : undefined}
                />
                <SummaryCard
                    icon={faCheckCircle}
                    label="Selesai"
                    value={s.laporan_selesai || 0}
                    subtitle="Terkirim"
                    color="green"
                    description={`${s.laporan_selesai || 0} laporan selesai`}
                    actionLabel={s.laporan_selesai > 0 ? "Lihat Selesai" : undefined}
                    onCtaClick={s.laporan_selesai > 0 ? () => setActiveModal("selesai") : undefined}
                />
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workflowProgress !== undefined && (
                    <DashboardSection title="Progress Penelitian">
                        <WorkflowProgressTracker progress={workflowProgress} />
                    </DashboardSection>
                )}

                <DashboardSection title="Menunggu Proses">
                    {primaryWaiting.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                <FontAwesomeIcon icon={faClock} className="text-gray-400 text-sm" />
                            </div>
                            <p className="text-xs text-gray-500">Tidak ada proses yang sedang menunggu pihak lain.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {primaryWaiting.map((item, index) => (
                                <TaskCard
                                    key={`waiting-${item.type}-${item.id}-${index}`}
                                    item={item}
                                    onClick={() => handleTaskClick(item)}
                                />
                            ))}

                            {remainingWaitingCount > 0 && (
                                <button
                                    onClick={() => setActiveModal("remaining_waiting")}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 hover:border-blue-300 transition-all"
                                >
                                    <span>Lihat {remainingWaitingCount} lainnya</span>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                </button>
                            )}
                        </div>
                    )}
                </DashboardSection>
            </div>

            <DashboardSection title="Aktivitas Terbaru">
                <RecentActivity items={recentActivity} />
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
                isOpen={activeModal === "remaining_waiting"}
                onClose={() => setActiveModal(null)}
                title="Proses yang Sedang Menunggu"
                subtitle={`${remainingWaitingCount} proses menunggu pihak lain`}
                items={remainingWaiting}
                columns={remainingModalColumns}
                onRecordClick={handleTaskClick}
                emptyMessage="Tidak ada proses lainnya."
            />

            <TaskActionModal
                isOpen={activeModal === "proposal_aktif"}
                onClose={() => setActiveModal(null)}
                title="Semua Proposal"
                subtitle={`${s.total_proposal || 0} proposal telah diajukan`}
                fetchRecords={fetchProposalRecords}
                columns={proposalColumns}
                onRecordClick={navigateToProposal}
                emptyMessage="Tidak ada proposal."
                viewAllUrl="/dashboard?module=dosenmonitoringprogress"
                viewAllLabel="Lihat Semua Proposal"
            />

            <TaskActionModal
                isOpen={activeModal === "laporan_berjalan"}
                onClose={() => setActiveModal(null)}
                title="Laporan Berjalan"
                subtitle={`${s.laporan_aktif || 0} laporan sedang aktif`}
                fetchRecords={fetchActiveLaporanRecords}
                columns={laporanColumns}
                onRecordClick={(r) => navigateToLaporan(r)}
                emptyMessage="Tidak ada laporan yang sedang berjalan."
                viewAllUrl="/dashboard?module=dosenmonitoringprogresslaporan"
                viewAllLabel="Lihat Semua Laporan"
            />

            <TaskActionModal
                isOpen={activeModal === "perlu_tindakan"}
                onClose={() => setActiveModal(null)}
                title="Laporan Perlu Tindakan"
                subtitle={`${perluTindakanCount ?? (s.perlu_tindakan || 0)} laporan menunggu tindakan Anda`}
                fetchRecords={fetchPerluTindakanRecords}
                columns={laporanColumns}
                onRecordClick={(r) => navigateToLaporan(r)}
                emptyMessage="Tidak ada laporan yang perlu ditindaklanjuti."
                viewAllUrl="/dashboard?module=dosenmonitoringprogresslaporan"
                viewAllLabel="Lihat Semua Laporan"
            />

            <TaskActionModal
                isOpen={activeModal === "selesai"}
                onClose={() => setActiveModal(null)}
                title="Laporan Selesai"
                subtitle={`${s.laporan_selesai || 0} laporan telah selesai`}
                fetchRecords={fetchSelesaiRecords}
                columns={laporanColumns}
                onRecordClick={(r) => navigateToLaporan(r, "SELESAI")}
                emptyMessage="Belum ada laporan yang selesai."
                viewAllUrl="/dashboard?module=dosenmonitoringprogresslaporan&tab=SELESAI"
                viewAllLabel="Lihat Semua Laporan"
            />
        </div>
    )
}
