"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import "quill/dist/quill.snow.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck, faCircleHalfStroke, faX } from "@fortawesome/free-solid-svg-icons"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"

import CustomTable from "@/app/component/Table/CustomTable"
import ContextMenu from "@/app/component/Context/ContextMenu"
import Alert from "@/app/component/Alert/Alert"
import TextTag from "@/app/component/Tags/TextTag"
import Badge from "@/app/component/Display/Badge"
import Button from "@/app/component/Inputs/Button"
import { LAPORAN_STATUS_COLORS, LAPORAN_KODE_COLORS, KODE_KEGIATAN_SHORT_LABELS, JENIS_PENELITIAN_COLORS, buildLaporanTabs } from "@/app/component/Libraries/config/statusColors"

const QuillEditor = dynamic(() => import("react-quill-new"), { ssr: false })

import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder"
import useHighlight from "@/app/component/Libraries/hooks/useHighlight"

import { getLaporan, adminDecideLaporan } from "@/app/component/Libraries/api/laporan"
import { staffDecideDiseminasi, authorizeDiseminasiRejection, finalDecisionDiseminasi } from "@/app/component/Libraries/api/diseminasi"
import { uploadBuktiTransfer, confirmPengembalianDana } from "@/app/component/Libraries/api/dana"
import { createAuthorizationRequest } from "@/app/component/Libraries/api/authorization"

import FormPenugasanReviewer from "../Proposal/PenugasanReviewerForm"
import LogbookView from "@/app/dashboard/pages/Dosen/MonitoringPengajuan/Laporan/LogbookView"
import LaporanViewForm from "./LaporanViewForm"

import { createKetuaLaporanMenus } from "@/app/component/Libraries/config/Laporan/KetuaLaporanMenu"
import { createStaffLaporanMenus } from "@/app/component/Libraries/config/Laporan/StaffLaporanMenu"
import SelectInput from "@/app/component/Inputs/SelectInput"

/*
|--------------------------------------------------------------------------
| Admin Laporan monitoring
|--------------------------------------------------------------------------
| Tabs by kode_kegiatan so the admin can traverse each stage:
|  - Proses Ganjil / Genap (view logbook)
|  - Publikasi Ganjil / Genap (view submission → assign reviewer → decide)
|--------------------------------------------------------------------------
*/

export default function MonitoringLaporanAdmin({ skema, onBack, highlightId, initialTab, initialJenis }) {

    const [semesterFilter, setSemesterFilter] = useState("both")

    const availableTypes = useMemo(() =>
        [...new Set(skema?.kegiatan?.map(k => k.jenis_penelitian) || [])],
        [skema]
    )

    const [typeFilter, setTypeFilter] = useState(initialJenis || availableTypes[0] || "Penelitian")

    const tabs = useMemo(() => buildLaporanTabs(typeFilter), [typeFilter])

    const [activeTab, setActiveTab] = useState("PROSES_PENELITIAN")

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab)
    }, [initialTab])

    // Reset activeTab when typeFilter changes to keep view consistent
    useEffect(() => {
        if (!initialTab && !initialJenis) setActiveTab(tabs[0]?.key || "PROSES_PENELITIAN")
    }, [typeFilter])

    const qb = useQueryBuilder()
    const [qs, setQs] = useState("")

    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    const [refreshKey, setRefreshKey] = useState(0)
    const [tempRow, setTempRow] = useState(null)

    const highlight = useHighlight(2000)

    useEffect(() => {
        if (highlightId) {
            const timer = setTimeout(() => {
                highlight(`row-${highlightId}`, { scroll: true })
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [highlightId, highlight, refreshKey])

    const [showLogbookModal, setShowLogbookModal] = useState(false)
    const [showViewDetailModal, setShowViewDetailModal] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [showKetuaApproveModal, setShowKetuaApproveModal] = useState(false)
    const [showKetuaRejectModal, setShowKetuaRejectModal] = useState(false)
    const [showStaffApproveModal, setShowStaffApproveModal] = useState(false)
    const [showStaffRejectModal, setShowStaffRejectModal] = useState(false)
    const [showKetuaFinalAcceptModal, setShowKetuaFinalAcceptModal] = useState(false)
    const [showKetuaFinalRejectModal, setShowKetuaFinalRejectModal] = useState(false)
    const [showBuktiTransferModal, setShowBuktiTransferModal] = useState(false)
    const [showBuktiPenerimaanModal, setShowBuktiPenerimaanModal] = useState(false)
    const [buktiTransferFile, setBuktiTransferFile] = useState(null)
    const [buktiPenerimaanFile, setBuktiPenerimaanFile] = useState(null)
    const [loadingBuktiTransfer, setLoadingBuktiTransfer] = useState(false)
    const [loadingBuktiPenerimaan, setLoadingBuktiPenerimaan] = useState(false)

    const [catatan, setCatatan] = useState("")

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("staffmonitoringprogresslaporan", user?.role)
    const isKetua = user?.role === "Ketua LPPM"

    const tabMaxActions = useMemo(() => isKetua ? ({
        PROSES_PENELITIAN: 2,
        PROSES_PKM: 2,
        PUBLIKASI: 3,
        DISEMINASI: 3,
        CLAIM_DANA: 2,
        PENGEMBALIAN_DANA: 2,
        SELESAI: 1,
    }) : ({
        PROSES_PENELITIAN: 5,
        PROSES_PKM: 5,
        PUBLIKASI: 5,
        DISEMINASI: 5,
        CLAIM_DANA: 5,
        PENGEMBALIAN_DANA: 5,
        SELESAI: 5,
    }), [isKetua])

    useEffect(() => {
        qb.resetFilters()
        
        const key = tabs.find(t => t.key === activeTab)?.key
        if (!key) return

        if (key === "SELESAI") {
            qb.addFilter("completed", "1")
            if (skema?.skema_id) qb.addFilter("skema_id", skema.skema_id)
            if (typeFilter !== "all") qb.addFilter("jenis_penelitian", typeFilter)
            setQs(qb.toQueryString())
            setRefreshKey(prev => prev + 1)
            return
        }

        // Tab key IS the stage base (e.g. PROSES_PENELITIAN, PUBLIKASI, CLAIM_DANA)
        // Just append semester suffix
        let kodes = []
        
        if (semesterFilter === "both") {
            kodes = [`${key}_GANJIL`, `${key}_GENAP`]
        } else if (semesterFilter === "ganjil") {
            kodes = [`${key}_GANJIL`]
        } else if (semesterFilter === "genap") {
            kodes = [`${key}_GENAP`]
        }

        if (kodes.length === 1) {
            qb.addFilter("kode_kegiatan", kodes[0])
        } else if (kodes.length > 1) {
            qb.addFilter("kode_kegiatan", kodes.join(","))
        }
        
        if (skema?.skema_id) qb.addFilter("skema_id", skema.skema_id)
        if (typeFilter !== "all") qb.addFilter("jenis_penelitian", typeFilter)
        setQs(qb.toQueryString())
        setRefreshKey(prev => prev + 1)
    }, [activeTab, semesterFilter, typeFilter, skema])

    const currentTab = tabs.find(t => t.key === activeTab)

    const menus = isKetua
        ? createKetuaLaporanMenus({
            access,
            phase: currentTab?.phase,
            handleLogbook,
            handleViewDetail,
            handleReject,
            handleKetuaApprove,
            handleKetuaReject,
            handleKetuaFinalAccept,
            handleKetuaFinalReject,
        })
        : createStaffLaporanMenus({
            access,
            phase: currentTab?.phase,
            handleLogbook,
            handleViewDetail,
            handleAssign,
            handleStaffApprove,
            handleStaffReject,
            handleStaffReturnLaporan,
            handleUploadBuktiTransfer,
            handleUploadBuktiPenerimaan,
        })

    const rowActions = useMemo(() =>
        (menus.row ?? []).flatMap(group => group.items ?? []),
    [menus])

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    function handleLogbook(r) {
        setTempRow(r)
        setShowLogbookModal(true)
    }

    function handleViewDetail(r) {
        setTempRow(r)
        setShowViewDetailModal(true)
    }

    function handleAssign(r) {
        setTempRow({
            ...r,
            reviewable_type: "App\\Models\\Laporan",
            reviewable_id: r.laporan_id,
        })
        setShowAssignModal(true)
    }

    function handleReject(r) {
        setTempRow(r)
        setShowRejectModal(true)
    }

    function handleKetuaApprove(r) {
        setTempRow(r)
        setShowKetuaApproveModal(true)
    }

    function handleKetuaReject(r) {
        setTempRow(r)
        setShowKetuaRejectModal(true)
    }

    function handleStaffApprove(r) {
        setTempRow(r)
        setShowStaffApproveModal(true)
    }

    function handleStaffReject(r) {
        setTempRow(r)
        setShowStaffRejectModal(true)
    }

    async function handleStaffReturnLaporan(r) {
        const reason = prompt('Alasan pengembalian laporan untuk perbaikan:')
        if (!reason || reason.length < 10) {
            alert('Alasan harus minimal 10 karakter')
            return
        }
        try {
            await createAuthorizationRequest({
                requestable_type: 'Laporan',
                requestable_id: r.laporan_id,
                action: 'return_laporan_for_revision',
                reason,
            })
        } catch(err) {
            console.error(err)
        } finally {
            refreshTable()
        }
    }

    function handleKetuaFinalAccept(r) {
        setTempRow(r)
        setShowKetuaFinalAcceptModal(true)
    }

    function handleKetuaFinalReject(r) {
        setTempRow(r)
        setCatatan("")
        setShowKetuaFinalRejectModal(true)
    }

    function handleKetuaApproveRejection(authorizationRequestId, reason) {
        runAuthorizeRejection(authorizationRequestId, "approve", reason)
    }

    function handleKetuaRejectRejection(authorizationRequestId, reason) {
        runAuthorizeRejection(authorizationRequestId, "reject", reason)
    }

    async function runAuthorizeRejection(authorizationRequestId, action, reason = "") {
        try {
            await authorizeDiseminasiRejection(authorizationRequestId, action, reason)
        } catch (err) {
            console.error(err)
        } finally {
            refreshTable()
        }
    }

    function handleUploadBuktiTransfer(r) {
        setTempRow(r)
        setBuktiTransferFile(null)
        setShowBuktiTransferModal(true)
    }

    function handleUploadBuktiPenerimaan(r) {
        setTempRow(r)
        setBuktiPenerimaanFile(null)
        setShowBuktiPenerimaanModal(true)
    }

    async function runUploadBuktiPenerimaan() {
        if (!buktiPenerimaanFile) return

        try {
            setLoadingBuktiPenerimaan(true)

            const formData = new FormData()
            formData.append("laporan_id", tempRow.laporan_id)
            formData.append("uploaded_file", buktiPenerimaanFile)

            await confirmPengembalianDana(formData)
        } catch (err) {
            console.error(err)
        } finally {
            setShowBuktiPenerimaanModal(false)
            setLoadingBuktiPenerimaan(false)
            refreshTable()
        }
    }

    async function runUploadBuktiTransfer() {
        if (!buktiTransferFile) return

        try {
            setLoadingBuktiTransfer(true)

            const formData = new FormData()
            formData.append("laporan_id", tempRow.laporan_id)
            formData.append("uploaded_file", buktiTransferFile)

            await uploadBuktiTransfer(formData)
        } catch (err) {
            console.error(err)
        } finally {
            setShowBuktiTransferModal(false)
            setLoadingBuktiTransfer(false)
            refreshTable()
        }
    }

    async function runDecision(decision, catatanValue = "") {
        try {
            const formData = new FormData()
            formData.append("laporan_id", tempRow.laporan_id)
            formData.append("decision", decision)
            if (catatanValue) formData.append("catatan", catatanValue)

            await adminDecideLaporan(formData)
        } catch (err) {
            console.error(err)
        } finally {
            setShowRejectModal(false)
            setCatatan("")
            refreshTable()
        }
    }

    async function runKetuaDecide(decision, catatanValue = "") {
        try {
            const formData = new FormData()
            formData.append("laporan_id", tempRow.laporan_id)
            formData.append("decision", decision)
            if (catatanValue) formData.append("catatan", catatanValue)

            await adminDecideLaporan(formData)
        } catch (err) {
            console.error(err)
        } finally {
            setShowKetuaApproveModal(false)
            setShowKetuaRejectModal(false)
            setCatatan("")
            refreshTable()
        }
    }

    async function runStaffDecide(decision) {
        try {
            const formData = new FormData()
            formData.append("laporan_id", tempRow.laporan_id)
            formData.append("decision", decision)
            if (decision === "reject" && catatan) formData.append("catatan", catatan)

            await staffDecideDiseminasi(formData)
        } catch (err) {
            console.error(err)
        } finally {
            setShowStaffApproveModal(false)
            setShowStaffRejectModal(false)
            setCatatan("")
            refreshTable()
        }
    }

    async function runFinalDecision(decision) {
        try {
            const formData = new FormData()
            formData.append("laporan_id", tempRow.laporan_id)
            formData.append("decision", decision)
            if (decision === "reject" && catatan) formData.append("catatan", catatan)

            await finalDecisionDiseminasi(formData)
        } catch (err) {
            console.error(err)
        } finally {
            setShowKetuaFinalAcceptModal(false)
            setShowKetuaFinalRejectModal(false)
            setCatatan("")
            refreshTable()
        }
    }

    return (
        <div
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => openMenu(e)}
        >
            {skema && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={onBack} className="hover:text-black">
                        Monitoring Progress
                    </button>
                    <span>›</span>
                    <span>{skema.nama_skema}</span>
                    <span>›</span>
                    <span className="font-medium text-black">Laporan</span>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">Laporan Penelitian — {skema.tahun_ajaran}</h1>
                <p className="text-lg text-gray-500 font-light">
                    Pantau logbook dan review submission laporan setiap tahap.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex border-b border-gray-300 w-full overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={
                                "px-4 py-2 text-sm whitespace-nowrap " +
                                (activeTab === tab.key
                                    ? "border-b-2 border-black text-black font-medium"
                                    : "text-gray-500 hover:text-black")
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {availableTypes.length > 1 && (
                        <SelectInput
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={
                                availableTypes.map(t => ({
                                    text: t === 'PkM' ? 'PkM' : 'Penelitian',
                                    value: t
                                }))
                            }
                            placeholder="Jenis"
                            className="w-40"
                        />
                    )}
                    <SelectInput
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        options={[
                            { text: "Ganjil & Genap", value: "both" },
                            { text: "Ganjil", value: "ganjil" },
                            { text: "Genap", value: "genap" },
                        ]}
                        placeholder="Pilih semester"
                        className="w-48"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-3 w-full border border-gray-300 rounded-md p-5 bg-white">
                <div className="flex flex-col gap-1">
                    <span className="text-gray-600 text-lg font-medium">
                        {currentTab?.phase === "proses"
                            ? "Logbook"
                            : currentTab?.phase === "publikasi"
                                ? "Publikasi"
                                : currentTab?.phase === "diseminasi"
                                    ? "Diseminasi"
                                    : currentTab?.phase === "claim"
                                        ? "Claim Dana"
                                        : currentTab?.phase === "pengembalian"
                                            ? "Pengembalian Dana"
                                            : "Luaran"
                        }
                    </span>
                    <span className="text-sm text-gray-500 font-light">
                        {currentTab?.phase === "proses"
                            ? "Pantau logbook pengerjaan peneliti pada tahap ini."
                            : currentTab?.phase === "publikasi"
                                ? "Review submission publikasi dan tentukan kelanjutan laporan."
                                : currentTab?.phase === "diseminasi"
                                    ? "Kelola diseminasi hasil penelitian."
                                    : "Upload bukti transfer dan konfirmasi penerimaan dana."}
                    </span>
                </div>

                <CustomTable
                    fetchMethod={getLaporan}
                    searchQuery={qs}
                    refreshKey={refreshKey}
                    className="w-full"
                    onContextRequest={(e, type, data, source) =>
                        openMenu(e, type, data, source)
                    }
                    maxActions={tabMaxActions[activeTab] ?? 4}
                    rowActions={rowActions}
                    onRefresh={refreshTable}
                    hideActions={isKetua && activeTab === "CLAIM_DANA" && typeFilter === "PkM"}
                    rowHighlightKey="laporan_id"
                columns={[
                    {
                        header: "Jenis",
                        key: "jenis_penelitian",
                        width: "8%",
                        render: (value) => (
                            <Badge
                                color={JENIS_PENELITIAN_COLORS[value] || 'gray'}
                                size="xs"
                                className="w-fit"
                            >
                                {value === 'PkM' ? 'PkM' : 'Penelitian'}
                            </Badge>
                        )
                    },
                    {
                        header: "Judul",
                        key: "judul",
                        width: "22%",
                        render: (value, row) => (
                            <div className="flex items-center gap-2">
                                <TextTag
                                    color={row.semester === "Ganjil" ? "#C4161C" : "#0197CA"}
                                    size="text-xs"
                                >
                                    {row.semester}
                                </TextTag>
                                <p className="text-sm line-clamp-2">
                                    {row.detail?.judul_penelitian || value}
                                </p>
                            </div>
                        )
                    },
                    {
                        header: "Ketua",
                        key: "ketua",
                        width: "13%",
                        render: (value) => (
                            <div className="flex items-center gap-2 text-xs">
                                {value?.avatar && (
                                    <Image
                                        src={value.avatar}
                                        alt={value.nama || ""}
                                        width={25}
                                        height={25}
                                        className="rounded-full"
                                        unoptimized
                                        onError={(e) => {
                                            e.currentTarget.src = "/img/user_placeholder.webp"
                                        }}
                                    />
                                )}
                                <span className="truncate">{value?.nama || "-"}</span>
                            </div>
                        )
                    },
                    {
                        header: "Kegiatan",
                        key: "nama_kegiatan",
                        width: "10%",
                        render: (value, row) => {
                            return (
                                <span className="text-sm">{value || row.skema || "-"}</span>
                            )
                        }
                    },
                    {
                        header: "Tahap & Status",
                        key: "status",
                        width: "18%",
                        render: (value, row) => {
                            const kodeLabel = KODE_KEGIATAN_SHORT_LABELS[row.kode_kegiatan] || row.kode_kegiatan

                            const isDiseminasi = kodeLabel === "Diseminasi"

                            return (
                                <div className="flex flex-col gap-1">
                                    <Badge color={LAPORAN_KODE_COLORS[kodeLabel] || 'gray'} size="sm" className="w-fit">
                                        {kodeLabel}
                                    </Badge>
                                    <Badge color={LAPORAN_STATUS_COLORS[value]?.color || 'gray'} size="sm" intensity="light" className="w-fit">
                                        {value || "-"}
                                    </Badge>
                                    {isDiseminasi && (
                                        <div className="flex flex-col gap-1 mt-0.5">
                                            <div className="flex gap-1">
                                                <Badge
                                                    color={row.detail?.ketua_diseminasi_approved ? 'green' : 'gray'}
                                                    size="xs"
                                                    intensity="light"
                                                >
                                                    Ketua: {row.detail?.ketua_diseminasi_approved ? "✓ Setuju" : "○ Belum"}
                                                </Badge>
                                                <Badge
                                                    color={row.detail?.has_pending_diseminasi_rejection ? 'red' : row.detail?.staff_diseminasi_approved ? 'green' : 'gray'}
                                                    size="xs"
                                                    intensity="light"
                                                >
                                                    Staff: {row.detail?.has_pending_diseminasi_rejection
                                                        ? "✗ Ditolak"
                                                        : row.detail?.staff_diseminasi_approved ? "✓ Setuju" : "○ Belum"}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    },
                    ...(currentTab?.phase === "diseminasi" ? [{
                        header: "Reviewer",
                        key: "penugasan",
                        width: "18%",
                        render: (value) => {
                            if (!value?.length) {
                                return (
                                    <span className="text-sm italic text-gray-500">
                                        Belum ditugaskan
                                    </span>
                                )
                            }
                            return (
                                <div className="grid grid-cols-1 gap-1">
                                    {value.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            {p.status_review === "Telah direview" ? (
                                                <FontAwesomeIcon icon={faCircleCheck} className="text-green-600" />
                                            ) : (
                                                <FontAwesomeIcon icon={faCircleHalfStroke} className="text-yellow-600" />
                                            )}
                                            <span className="truncate">
                                                {p.reviewer?.nama || "-"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    }] : []),
                ]}
                />
            </div>

            <AnimatePresence>
                {showLogbookModal && (
                    <LogbookView
                        close={() => setShowLogbookModal(false)}
                        data={tempRow}
                        refresh={refreshTable}
                        readOnly={true}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showViewDetailModal && (
                    <LaporanViewForm
                        close={() => setShowViewDetailModal(false)}
                        data={tempRow}
                        onKetuaApproveRejection={handleKetuaApproveRejection}
                        onKetuaRejectRejection={handleKetuaRejectRejection}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >
                        <div className="bg-white rounded-xl p-6 w-full max-w-xl flex flex-col gap-4">
                            <h2 className="text-xl font-medium">Kembalikan Laporan</h2>
                            <p className="text-gray-600">
                                Kembalikan laporan ke peneliti untuk direvisi. Berikan catatan agar peneliti tahu apa yang perlu diperbaiki.
                            </p>
                            <QuillEditor
                                theme="snow"
                                value={catatan}
                                onChange={setCatatan}
                                placeholder="Tulis catatan revisi di sini..."
                                className="h-40"
                            />
                            <div className="flex gap-2 justify-end mt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowRejectModal(false)
                                        setCatatan("")
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => runDecision("reject", catatan)}
                                >
                                    Kembalikan
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ketua Approve Diseminasi */}
            <AnimatePresence>
                {showKetuaApproveModal && (
                    <Alert
                        alertType="warning"
                        title="Setujui Diseminasi"
                        msg="Setujui diseminasi laporan ini? Laporan akan masuk tahap review Staff LPPM."
                        onCancel={() => setShowKetuaApproveModal(false)}
                        onAccept={() => runKetuaDecide("accept")}
                        acceptText="Setujui"
                        isConfirmation={true}
                        withBackground={true}
                    />
                )}
            </AnimatePresence>

            {/* Ketua Reject Diseminasi */}
            <AnimatePresence>
                {showKetuaRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >
                        <div className="bg-white rounded-xl p-6 w-full max-w-xl flex flex-col gap-4">
                            <h2 className="text-xl font-medium">Tolak Diseminasi</h2>
                            <p className="text-gray-600">
                                Kembalikan laporan ke peneliti dari tahap Diseminasi. Berikan catatan agar peneliti tahu apa yang perlu diperbaiki.
                            </p>
                            <QuillEditor
                                theme="snow"
                                value={catatan}
                                onChange={setCatatan}
                                placeholder="Tulis catatan revisi di sini..."
                                className="h-40"
                            />
                            <div className="flex gap-2 justify-end mt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowKetuaRejectModal(false)
                                        setCatatan("")
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => runKetuaDecide("reject", catatan)}
                                >
                                    Tolak
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assign Reviewer Modal (Staff only) */}
            <AnimatePresence>
                {showAssignModal && (
                    <FormPenugasanReviewer
                        data={tempRow}
                        close={() => setShowAssignModal(false)}
                        refresh={refreshTable}
                    />
                )}
            </AnimatePresence>

            {/* Staff Approve Diseminasi */}
            <AnimatePresence>
                {showStaffApproveModal && (
                    <Alert
                        alertType="warning"
                        title="Setujui Diseminasi"
                        msg="Setujui diseminasi sebagai Staff LPPM? Reviewer dapat ditugaskan setelah ini."
                        onCancel={() => setShowStaffApproveModal(false)}
                        onAccept={() => runStaffDecide("accept")}
                        acceptText="Setujui"
                        isConfirmation={true}
                        withBackground={true}
                    />
                )}
            </AnimatePresence>

            {/* Staff Reject Diseminasi */}
            <AnimatePresence>
                {showStaffRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >
                        <div className="bg-white rounded-xl p-6 w-full max-w-xl flex flex-col gap-4">
                            <h2 className="text-xl font-medium">Tolak Diseminasi</h2>
                            <p className="text-gray-600">
                                Tolak diseminasi sebagai Staff LPPM? Berikan alasan penolakan. Permintaan ini akan dikirim ke Ketua LPPM untuk persetujuan.
                            </p>
                            <QuillEditor
                                theme="snow"
                                value={catatan}
                                onChange={setCatatan}
                                placeholder="Tulis alasan penolakan diseminasi di sini..."
                                className="h-40"
                            />
                            <div className="flex gap-2 justify-end mt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowStaffRejectModal(false)
                                        setCatatan("")
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        if (!catatan.trim()) return
                                        runStaffDecide("reject")
                                    }}
                                >
                                    Tolak
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ketua Final Accept Diseminasi */}
            <AnimatePresence>
                {showKetuaFinalAcceptModal && (
                    <Alert
                        alertType="warning"
                        title="Terima Laporan"
                        msg="Terima laporan berdasarkan hasil review reviewer? Laporan akan lanjut ke tahap Claim Dana."
                        onCancel={() => setShowKetuaFinalAcceptModal(false)}
                        onAccept={() => runFinalDecision("accept")}
                        acceptText="Terima"
                        isConfirmation={true}
                        withBackground={true}
                    />
                )}
            </AnimatePresence>

            {/* Ketua Final Reject Diseminasi */}
            <AnimatePresence>
                {showKetuaFinalRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >
                        <div className="bg-white rounded-xl p-6 w-full max-w-xl flex flex-col gap-4">
                            <h2 className="text-xl font-medium">Tolak Laporan</h2>
                            <p className="text-gray-600">
                                Kembalikan laporan ke tahap Publikasi untuk direvisi berdasarkan hasil review reviewer. Berikan alasan penolakan.
                            </p>
                            <QuillEditor
                                theme="snow"
                                value={catatan}
                                onChange={setCatatan}
                                placeholder="Tulis alasan penolakan di sini..."
                                className="h-40"
                            />
                            <div className="flex gap-2 justify-end mt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowKetuaFinalRejectModal(false)
                                        setCatatan("")
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        if (!catatan.trim()) return
                                        runFinalDecision("reject")
                                    }}
                                >
                                    Tolak
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBuktiTransferModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Upload Bukti Transfer</h3>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowBuktiTransferModal(false)}
                                    icon={faX}
                                />
                            </div>

                            <p className="text-sm text-gray-500">
                                Upload bukti bahwa transfer dana telah berhasil dikirim ke peneliti.
                            </p>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">File (PDF/JPG/PNG, maks 5MB)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setBuktiTransferFile(e.target.files[0] || null)}
                                    className="text-sm"
                                />
                                {buktiTransferFile && (
                                    <span className="text-xs text-gray-500">{buktiTransferFile.name}</span>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowBuktiTransferModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={runUploadBuktiTransfer}
                                    disabled={!buktiTransferFile || loadingBuktiTransfer}
                                >
                                    {loadingBuktiTransfer ? "Mengupload..." : "Upload"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBuktiPenerimaanModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Upload Bukti Penerimaan Pengembalian</h3>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowBuktiPenerimaanModal(false)}
                                    icon={faX}
                                />
                            </div>

                            <p className="text-sm text-gray-500">
                                Upload bukti bahwa pengembalian dana telah diterima dari peneliti.
                            </p>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">File (PDF/JPG/PNG, maks 5MB)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setBuktiPenerimaanFile(e.target.files[0] || null)}
                                    className="text-sm"
                                />
                                {buktiPenerimaanFile && (
                                    <span className="text-xs text-gray-500">{buktiPenerimaanFile.name}</span>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowBuktiPenerimaanModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={runUploadBuktiPenerimaan}
                                    disabled={!buktiPenerimaanFile || loadingBuktiPenerimaan}
                                >
                                    {loadingBuktiPenerimaan ? "Mengupload..." : "Upload"}
                                </Button>
                            </div>
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
