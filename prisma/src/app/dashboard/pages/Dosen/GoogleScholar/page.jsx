"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faSpinner,
    faExclamationTriangle,
    faLink,
    faRefresh,
    faExternalLinkAlt,
    faBook,
    faQuoteRight,
    faAward,
    faStar,
    faGraduationCap,
    faSearch,
    faChartLine,
    faX,
} from "@fortawesome/free-solid-svg-icons"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

import Button from "@/app/component/Inputs/Button"
import TextInput from "@/app/component/Inputs/TextInput"
import CustomTable from "@/app/component/Table/CustomTable"
import ContextMenu from "@/app/component/Context/ContextMenu"
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder"
import { createGoogleScholarDosenMenus } from "@/app/component/Libraries/config/GoogleScholar/GoogleScholarDosenMenu"
import Badge from "@/app/component/Display/Badge"
import { SCHOLAR_SYNC_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"
import {
    getScholarDashboard,
    connectScholarProfile,
    syncScholarProfile,
    getScholarPublications,
    getPublicationCitationHistory,
} from "@/app/component/Libraries/api/scholar"

function formatDateTime(isoString) {
    if (!isoString) return "Belum pernah disinkronkan"
    const cleaned = isoString.replace(/\.\d+Z$/, "Z")
    const date = new Date(cleaned)
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
    }).format(date)
}

function MetricCard({ icon, label, value, color }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <FontAwesomeIcon icon={icon} className="text-white text-sm" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-semibold">{value ?? "-"}</p>
            </div>
        </div>
    )
}

export default function GoogleScholarPage() {
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [profileUrl, setProfileUrl] = useState("")
    const [connecting, setConnecting] = useState(false)

    const [syncing, setSyncing] = useState(false)

    const [showUrlModal, setShowUrlModal] = useState(false)
    const [editUrl, setEditUrl] = useState("")

    const qb = useQueryBuilder()
    const [pubQs, setPubQs] = useState("")
    const [pubRefreshKey, setPubRefreshKey] = useState(0)
    const [pubSearch, setPubSearch] = useState("")

    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    const [citModalPub, setCitModalPub] = useState(null)
    const [citModalLoading, setCitModalLoading] = useState(false)
    const [citModalData, setCitModalData] = useState(null)
    const [citModalError, setCitModalError] = useState(null)

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await getScholarDashboard()
            setDashboard(res.data.data)
        } catch (err) {
            console.error(err)
            setError("Gagal memuat data profil Google Scholar.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboard()
    }, [fetchDashboard])

    useEffect(() => {
        if (!dashboard?.connected || !dashboard?.profile) return

        const status = dashboard.profile.sync_status
        if (status !== "pending" && status !== "syncing") return

        const interval = setInterval(async () => {
            try {
                const res = await getScholarDashboard()
                const newData = res.data.data
                setDashboard(newData)
                const newStatus = newData?.profile?.sync_status
                if (newStatus === "success" || newStatus === "failed" || !newStatus) {
                    clearInterval(interval)
                    if (newStatus === "success") {
                        setPubRefreshKey((p) => p + 1)
                    }
                }
            } catch {
                clearInterval(interval)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [dashboard?.connected, dashboard?.profile?.sync_status])

    useEffect(() => {
        if (!dashboard?.connected) return
        qb.resetFilters()
        setPubQs(qb.toQueryString())
        setPubRefreshKey((p) => p + 1)
    }, [dashboard?.connected])

    async function handleConnect() {
        if (!profileUrl.trim()) {
            return
        }

        try {
            setConnecting(true)
            const formData = new FormData()
            formData.append("profile_url", profileUrl.trim())
            await connectScholarProfile(formData)
            setProfileUrl("")
            await fetchDashboard()
        } catch (err) {
            console.error(err)
        } finally {
            setConnecting(false)
        }
    }

    async function handleSync() {
        try {
            setSyncing(true)
            await syncScholarProfile()
            await fetchDashboard()
        } catch (err) {
            console.error(err)
        } finally {
            setSyncing(false)
        }
    }

    async function handleUpdateUrl() {
        if (!editUrl.trim()) {
            return
        }

        try {
            setConnecting(true)
            const formData = new FormData()
            formData.append("profile_url", editUrl.trim())
            await connectScholarProfile(formData)
            setShowUrlModal(false)
            setEditUrl("")
            await fetchDashboard()
        } catch (err) {
            console.error(err)
        } finally {
            setConnecting(false)
        }
    }

    function handlePubSearch(e) {
        const value = e.target.value
        setPubSearch(value)
        qb.setSearch(value)
        setPubQs(qb.toQueryString())
        setPubRefreshKey((p) => p + 1)
    }

    async function handleViewCitationHistory() {
        const pub = contextMenu?.data
        if (!pub?.publication_id) return

        closeMenu()
        setCitModalPub(pub)
        setCitModalLoading(true)
        setCitModalData(null)
        setCitModalError(null)

        try {
            const res = await getPublicationCitationHistory(pub.publication_id)
            setCitModalData(res.data.data)
        } catch (err) {
            const msg = err.response?.data?.message || "Riwayat sitasi gagal dimuat. Silakan coba kembali."
            setCitModalError(msg)
        } finally {
            setCitModalLoading(false)
        }
    }

    function handleCloseCitModal() {
        setCitModalPub(null)
        setCitModalData(null)
        setCitModalError(null)
    }

    async function handleRetryCitationHistory() {
        if (!citModalPub?.publication_id) return

        setCitModalLoading(true)
        setCitModalError(null)

        try {
            const res = await getPublicationCitationHistory(citModalPub.publication_id)
            setCitModalData(res.data.data)
        } catch (err) {
            const msg = err.response?.data?.message || "Riwayat sitasi gagal dimuat. Silakan coba kembali."
            setCitModalError(msg)
        } finally {
            setCitModalLoading(false)
        }
    }

    const menus = createGoogleScholarDosenMenus({
        onViewCitationHistory: handleViewCitationHistory,
    })

    const isSyncing = dashboard?.profile?.sync_status === "pending" || dashboard?.profile?.sync_status === "syncing"
    const profile = dashboard?.profile
    const citationsByYear = profile?.citations_by_year
        ? [...profile.citations_by_year].sort((a, b) => a.year - b.year)
        : []
    const statusInfo = profile?.sync_status ? SCHOLAR_SYNC_STATUS_COLORS[profile.sync_status] : null

    if (loading) {
        return (
            <div className="flex flex-col gap-5 min-h-screen">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Google Scholar</h1>
                    <p className="text-lg text-gray-500 font-light">Memuat data...</p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <FontAwesomeIcon icon={faSpinner} className="text-foreground/30 text-3xl animate-spin" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-5 min-h-screen">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Google Scholar</h1>
                    <p className="text-lg text-gray-500 font-light">Terjadi kesalahan.</p>
                </div>
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-4xl" />
                    <p className="text-gray-500">{error}</p>
                    <Button onClick={fetchDashboard} icon={faRefresh}>Muat Ulang</Button>
                </div>
            </div>
        )
    }

    if (!dashboard?.connected) {
        return (
            <div className="flex flex-col gap-5 min-h-screen">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Google Scholar</h1>
                    <p className="text-lg text-gray-500 font-light">Monitor profil Google Scholar Anda.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-6 max-w-xl mx-auto mt-10">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-2xl" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-medium mb-2">Hubungkan Profil Google Scholar</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Hubungkan profil Google Scholar Anda untuk menampilkan jumlah sitasi, h-index,
                            i10-index, riwayat sitasi, dan daftar publikasi secara otomatis.
                        </p>
                    </div>
                    <div className="w-full flex flex-col gap-3">
                        <TextInput
                            icon={faLink}
                            tag="URL Profil Google Scholar"
                            placeholder="https://scholar.google.com/citations?user=..."
                            value={profileUrl}
                            onChange={(e) => setProfileUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-400">
                            Contoh: https://scholar.google.com/citations?user=SCHOLAR_AUTHOR_ID
                        </p>
                        <Button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="w-full"
                        >
                            {connecting ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    Menghubungkan...
                                </>
                            ) : (
                                "Hubungkan Profil"
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">Google Scholar</h1>
                <p className="text-lg text-gray-500 font-light">Monitor profil Google Scholar Anda.</p>
            </div>

            {/* Profile Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-medium">{profile?.display_name || "Profil Google Scholar"}</h2>
                            {statusInfo && (
                                <Badge color={statusInfo.color} size="sm" intensity="light" className="w-fit">
                                    {statusInfo.label}
                                </Badge>
                            )}
                        </div>
                        {profile?.affiliation && (
                            <p className="text-sm text-gray-500">{profile.affiliation}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                            {profile?.profile_url && (
                                <a
                                    href={profile.profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:underline"
                                >
                                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                    Buka Profil Google Scholar
                                </a>
                            )}
                            <span>Terakhir diperbarui: {formatDateTime(profile?.last_synced_at)}</span>
                        </div>
                        {profile?.sync_status === "failed" && profile?.last_sync_error && (
                            <p className="text-sm text-red-500 mt-1">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                {profile.last_sync_error}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setEditUrl(profile?.profile_url || "")
                                setShowUrlModal(true)
                            }}
                        >
                            Perbarui URL Profil
                        </Button>
                        <Button
                            onClick={handleSync}
                            disabled={isSyncing || syncing}
                            icon={faRefresh}
                        >
                            {isSyncing ? "Menyinkronkan..." : "Perbarui Data"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={faQuoteRight}
                    label="Total Sitasi"
                    value={profile?.total_citations ?? "-"}
                    color="bg-blue-500"
                />
                <MetricCard
                    icon={faBook}
                    label="Total Publikasi"
                    value={profile?.publications_count ?? "-"}
                    color="bg-emerald-500"
                />
                <MetricCard
                    icon={faAward}
                    label="h-index"
                    value={profile?.h_index ?? "-"}
                    color="bg-purple-500"
                />
                <MetricCard
                    icon={faStar}
                    label="i10-index"
                    value={profile?.i10_index ?? "-"}
                    color="bg-amber-500"
                />
            </div>

            {/* Citation History Graph */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4">Riwayat Sitasi</h3>
                {citationsByYear.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={citationsByYear}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="year"
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                                allowDecimals={false}
                            />
                            <Tooltip
                                formatter={(value) => [value, "Sitasi"]}
                                labelFormatter={(label) => `Tahun ${label}`}
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="citation_count"
                                stroke="#0197CA"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#0197CA" }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <FontAwesomeIcon icon={faChartLine} className="text-3xl mb-3" />
                        <p className="text-sm">Riwayat sitasi belum tersedia.</p>
                    </div>
                )}
            </div>

            {/* Publication Table */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-lg font-medium">Daftar Publikasi</h3>
                    <TextInput
                        icon={faSearch}
                        placeholder="Cari publikasi..."
                        value={pubSearch}
                        onChange={handlePubSearch}
                        className="w-full sm:w-72"
                    />
                </div>
                <CustomTable
                    fetchMethod={getScholarPublications}
                    searchQuery={pubQs}
                    refreshKey={pubRefreshKey}
                    onContextRequest={openMenu}
                    rowActions={[
                        { icon: faChartLine, text: "Lihat Riwayat Sitasi", action: handleViewCitationHistory }
                    ]}
                    columns={[
                        {
                            header: "Judul Publikasi",
                            key: "title",
                            width: "35%",
                            render: (value, row) => (
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium line-clamp-2">{value || "-"}</span>
                                    {row.authors && (
                                        <span className="text-xs text-gray-400 line-clamp-1">{row.authors}</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            header: "Tahun Terbit",
                            key: "publication_year",
                            width: "10%",
                            render: (value) => (
                                <span className="text-sm">{value || "-"}</span>
                            ),
                        },
                        {
                            header: "Jurnal / Sumber",
                            key: "publication_name",
                            width: "25%",
                            render: (value) => (
                                <span className="text-sm line-clamp-2">{value || "-"}</span>
                            ),
                        },
                        {
                            header: "Jumlah Sitasi",
                            key: "citation_count",
                            width: "10%",
                            render: (value) => (
                                <span className="text-sm font-medium">{value ?? 0}</span>
                            ),
                        },
                        {
                            header: "Tautan",
                            key: "publication_url",
                            width: "10%",
                            render: (value) =>
                                value ? (
                                    <a
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline text-sm flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                        Buka
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                ),
                        },
                    ]}
                />
            </div>

            {/* Update URL Modal */}
            <AnimatePresence>
                {showUrlModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div className="w-full max-w-lg bg-white p-5 rounded-xl flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-medium">Perbarui URL Profil</p>
                                <button
                                    onClick={() => setShowUrlModal(false)}
                                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faX} className="text-gray-400" />
                                </button>
                            </div>
                            <TextInput
                                icon={faLink}
                                tag="URL Profil Google Scholar"
                                placeholder="https://scholar.google.com/citations?user=..."
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                            />
                            <p className="text-xs text-gray-400">
                                Profil baru akan disinkronkan setelah URL diperbarui.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setShowUrlModal(false)}>
                                    Batal
                                </Button>
                                <Button onClick={handleUpdateUrl} disabled={connecting}>
                                    {connecting ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                            Memperbarui...
                                        </>
                                    ) : (
                                        "Perbarui"
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Citation History Modal */}
            <AnimatePresence>
                {citModalPub && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div className="w-full max-w-xl bg-white p-5 rounded-xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-medium">Riwayat Sitasi Publikasi</p>
                                <button
                                    onClick={handleCloseCitModal}
                                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faX} className="text-gray-400" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2">{citModalPub.title}</p>

                            {citModalLoading && (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <FontAwesomeIcon icon={faSpinner} className="text-3xl text-foreground/30 animate-spin" />
                                    <p className="text-sm text-gray-500">Memuat riwayat sitasi...</p>
                                </div>
                            )}

                            {!citModalLoading && citModalError && (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-400" />
                                    <p className="text-sm text-gray-500 text-center">{citModalError}</p>
                                    <Button onClick={handleRetryCitationHistory} variant="secondary" icon={faRefresh}>
                                        Coba Kembali
                                    </Button>
                                </div>
                            )}

                            {!citModalLoading && !citModalError && citModalData && (
                                <>
                                    {citModalData.citations_by_year?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={citModalData.citations_by_year}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="year"
                                                    tick={{ fontSize: 12 }}
                                                    stroke="#9ca3af"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    stroke="#9ca3af"
                                                    allowDecimals={false}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [value, "Sitasi"]}
                                                    labelFormatter={(label) => `Tahun ${label}`}
                                                    contentStyle={{
                                                        borderRadius: "8px",
                                                        border: "1px solid #e5e7eb",
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="citation_count"
                                                    stroke="#0197CA"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "#0197CA" }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                            <FontAwesomeIcon icon={faChartLine} className="text-3xl mb-3" />
                                            <p className="text-sm">Riwayat sitasi untuk publikasi ini belum tersedia.</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1 text-sm text-gray-500 border-t pt-3">
                                        <p>Total sitasi saat ini: <span className="font-medium text-gray-700">{citModalData.publication?.total_citations ?? 0}</span></p>
                                        {citModalData.last_synced_at && (
                                            <p>Data terakhir diperbarui: {formatDateTime(citModalData.last_synced_at)}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ContextMenu
                contextMenu={contextMenu}
                closeMenu={closeMenu}
                menus={menus}
            />

        </div>
    )
}


