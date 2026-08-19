"use client"

import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faSearch,
    faCircleExclamation,
    faArrowRight,
    faFileLines,
    faClipboardCheck,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons"
import { motion } from "framer-motion"

import { getStaffMonitoringSkema } from "@/app/component/Libraries/api/skema"
import Badge from "@/app/component/Display/Badge"
import Button from "@/app/component/Inputs/Button"
import { SKEMA_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"
import useHighlight from "@/app/component/Libraries/hooks/useHighlight"
import { useUserStore } from "@/app/stores/useUserStore"
import AuthorizationQueue from "./AuthorizationQueue"

export default function SkemaSelection({ onSelectSkema, initialSkemaId, initialView }) {
    const [skemaList, setSkemaList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState("")
    const highlight = useHighlight(1500)
    const hasAutoSelected = useRef(false)
    const user = useUserStore(state => state.user)

    async function fetchSkema() {
        try {
            setLoading(true)
            setError(false)
            const res = await getStaffMonitoringSkema()
            setSkemaList(res.data.data ?? [])
        } catch (err) {
            console.error(err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSkema()
    }, [])

    useEffect(() => {
        if (loading || !initialSkemaId || hasAutoSelected.current) return
        const skema = skemaList.find(s => String(s.skema_id) === String(initialSkemaId))
        if (skema) {
            hasAutoSelected.current = true
            if (initialView === "proposal" || initialView === "laporan") {
                onSelectSkema(skema, initialView)
            } else {
                highlight(`skema-${skema.skema_id}`, { scroll: true })
            }
        }
    }, [loading, skemaList, initialSkemaId, initialView, onSelectSkema, highlight])

    const filtered = skemaList.filter(s => {
        const q = search.toLowerCase()
        return (
            s.nama_skema?.toLowerCase().includes(q) ||
            s.tahun_ajaran?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="flex flex-col gap-5 min-h-screen">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">
                    Monitoring Progress
                </h1>
                <p className="text-lg text-gray-500 font-light">
                    Pantau progres proposal, laporan, dan kegiatan pada setiap skema
                </p>
            </div>

            {/* ── Authorization Queue (Ketua only) ───────────────── */}
            <AuthorizationQueue user={user} />

            {/* ── Search ─────────────────────────────────────────── */}
            <div className="relative">
                <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama skema atau tahun ajaran..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* ── Content ────────────────────────────────────────── */}
            {loading ? (
                <SkemaGridSkeleton />
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-2 p-12">
                    <FontAwesomeIcon icon={faCircleExclamation} className="text-4xl text-red-400" />
                    <span className="text-gray-500">Gagal memuat data skema</span>
                    <Button variant="secondary" onClick={fetchSkema} size="sm">
                        Coba lagi
                    </Button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-12">
                    <FontAwesomeIcon icon={faSearch} className="text-3xl text-gray-300" />
                    <span className="text-gray-500">
                        {search
                            ? "Tidak ada skema yang ditemukan"
                            : "Belum ada skema yang dapat dimonitor"}
                    </span>
                    {search && (
                        <p className="text-sm text-gray-400">
                            Coba gunakan nama skema atau tahun ajaran yang berbeda
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((skema, i) => (
                        <SkemaCard
                            key={skema.skema_id}
                            skema={skema}
                            index={i}
                            onSelect={onSelectSkema}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/* ────────────────────────────────────────────────────────────────────
   SkemaCard
   ──────────────────────────────────────────────────────────────────── */

function SkemaCard({ skema, index, onSelect }) {
    const hasPending = skema.pending_actions > 0
    const statusStyle = SKEMA_STATUS_COLORS[skema.status] || SKEMA_STATUS_COLORS.Draft

    const proposalPending = skema.pending_breakdown?.["Seleksi Proposal"] || 0
    const reviewerPending = skema.pending_breakdown?.["Penugasan Reviewer"] || 0
    const laporanPending = skema.pending_breakdown?.["Pemeriksaan Laporan"] || 0
    const danaPending = skema.pending_breakdown?.["Konfirmasi Dana"] || 0

    const proposalNeedsAttention = proposalPending + reviewerPending > 0
    const laporanNeedsAttention = laporanPending + danaPending > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            data-highlight={`skema-${skema.skema_id}`}
            className={`
                bg-white rounded-lg border shadow-sm
                p-5 flex flex-col gap-3 text-left
                transition-all duration-200
                ${hasPending
                    ? "border-blue-300"
                    : "border-gray-200"
                }
            `}
        >
            {/* ── Top row: Name + Status ─────────────────────────── */}
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-800 leading-snug">
                    {skema.nama_skema}
                </h3>
                <Badge color={statusStyle?.color || "gray"} size="sm" className="whitespace-nowrap">
                    {skema.status}
                </Badge>
            </div>

            {/* ── Tahun ajaran ───────────────────────────────────── */}
            <span className="text-sm text-gray-500">
                Tahun Ajaran {skema.tahun_ajaran}
            </span>

            {/* ── Open kegiatan ──────────────────────────────────── */}
            {skema.open_kegiatan_count > 0 && (
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tahap terbuka
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {skema.open_kegiatan_labels.slice(0, 3).map((label) => (
                            <span
                                key={label}
                                className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium"
                            >
                                {label}
                            </span>
                        ))}
                        {skema.open_kegiatan_labels.length > 3 && (
                            <span className="text-xs text-gray-400">
                                +{skema.open_kegiatan_labels.length - 3} lainnya
                            </span>
                        )}
                    </div>
                    {skema.manual_override_count > 0 && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                            <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                            {skema.manual_override_count} di luar rentang tanggal
                        </span>
                    )}
                </div>
            )}

            {/* ── Actions ───────────────────────────────────────── */}
            <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-100">
                <button
                    onClick={() => onSelect(skema, "proposal")}
                    className={`
                        flex items-center justify-between gap-2 w-full
                        px-3 py-2.5 rounded-lg text-left text-sm
                        transition-all duration-150 cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                        ${proposalNeedsAttention
                            ? "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                            : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                        }
                    `}
                    aria-label={`Lihat Proposal skema ${skema.nama_skema}`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <FontAwesomeIcon icon={faFileLines} className="text-blue-500 text-xs shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-800">Proposal</span>
                            <span className="text-xs text-gray-500">
                                {skema.proposal_count} pengajuan
                                {proposalNeedsAttention && (
                                    <span className="text-amber-600 font-medium">
                                        {" "}· {proposalNeedsAttention ? proposalPending + reviewerPending : 0} perlu tindakan
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className={`text-xs shrink-0 ${proposalNeedsAttention ? "text-blue-600" : "text-gray-400"}`}
                    />
                </button>

                <button
                    onClick={() => onSelect(skema, "laporan")}
                    className={`
                        flex items-center justify-between gap-2 w-full
                        px-3 py-2.5 rounded-lg text-left text-sm
                        transition-all duration-150 cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                        ${laporanNeedsAttention
                            ? "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                            : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                        }
                    `}
                    aria-label={`Lihat Laporan skema ${skema.nama_skema}`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <FontAwesomeIcon icon={faClipboardCheck} className="text-green-500 text-xs shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-800">Laporan</span>
                            <span className="text-xs text-gray-500">
                                {skema.active_laporan_count} aktif
                                {laporanNeedsAttention && (
                                    <span className="text-amber-600 font-medium">
                                        {" "}· {laporanNeedsAttention ? laporanPending + danaPending : 0} perlu tindakan
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className={`text-xs shrink-0 ${laporanNeedsAttention ? "text-blue-600" : "text-gray-400"}`}
                    />
                </button>
            </div>
        </motion.div>
    )
}

/* ────────────────────────────────────────────────────────────────────
   Loading skeleton
   ──────────────────────────────────────────────────────────────────── */

function SkemaGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3 animate-pulse"
                >
                    <div className="flex items-start justify-between">
                        <div className="h-5 bg-gray-200 rounded w-2/3" />
                        <div className="h-5 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="flex gap-4">
                        <div className="h-4 bg-gray-100 rounded w-20" />
                        <div className="h-4 bg-gray-100 rounded w-24" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-28" />
                    <div className="border-t border-gray-100 pt-2 mt-auto">
                        <div className="h-4 bg-gray-100 rounded w-28" />
                    </div>
                </div>
            ))}
        </div>
    )
}
