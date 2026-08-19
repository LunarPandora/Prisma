"use client"

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useUserStore } from "@/app/stores/useUserStore";

import { getModuleAccess } from "@/app/component/Libraries/utils/menu";

import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder";
import useHighlight from "@/app/component/Libraries/hooks/useHighlight";

import CustomTable from "@/app/component/Table/CustomTable";
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date";
import ContextMenu from "@/app/component/Context/ContextMenu";
import { motion, AnimatePresence } from "framer-motion";
import Alert from "@/app/component/Alert/Alert";
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu";
import { getLaporan, finishLaporan } from "@/app/component/Libraries/api/laporan";
import TextTag from "@/app/component/Tags/TextTag";
import Badge, { StatusBadge } from "@/app/component/Display/Badge";
import { LAPORAN_STATUS_COLORS, LAPORAN_KODE_COLORS, KODE_KEGIATAN_SHORT_LABELS, JENIS_PENELITIAN_COLORS, buildLaporanTabs } from "@/app/component/Libraries/config/statusColors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { createLaporanDosenMenus } from "@/app/component/Libraries/config/Laporan/LaporanDosenMenu";
import LogbookViewDosen from "./LogbookView";
import PublikasiForm from "./PublikasiForm";
import TransferProofForm from "./TransferProofForm";
import SitasiForm from "./SitasiForm";
import { fetchSettings } from "@/app/component/Libraries/api/settings";
import SelectInput from "@/app/component/Inputs/SelectInput";

export default function MonitoringPenelitianLaporan({ skema, onBack, highlightId, initialTab, initialJenis }){
    const defaultForm = {
        // search: "",
        // kegiatan_id: "",
    }

    const qb = useQueryBuilder()
    const [qs, setqs] = useState('')

    const [form, setForm] = useState(defaultForm)
    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    const [refreshKey, setRefreshKey] = useState(0)
    const [tempLaporan, setTempLaporan] = useState({})

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
    const [showAddLogbookModal, setShowAddLogbookModal] = useState(false)

    const [showFinishModal, setShowFinishModal] = useState(false)
    const [showPublikasiModal, setShowPublikasiModal] = useState(false)

    const [showClaimProofModal, setShowClaimProofModal] = useState(false)
    const [showPengembalianProofModal, setShowPengembalianProofModal] = useState(false)
    const [showSitasiModal, setShowSitasiModal] = useState(false)
    const [showRevisiReasonModal, setShowRevisiReasonModal] = useState(false)

    const [alertMsg, setAlertMsg] = useState("")
    const [alertStatus, setAlertStatus] = useState("info")
    const [showAlert, setShowAlert] = useState(false)

    const [tempRowData, setTempRowData] = useState({})

    const [loadingForm, setLoadingForm] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("dosenmonitoringprogresslaporan", user?.role)

    const [semesterFilter, setSemesterFilter] = useState("both") // "ganjil" | "genap" | "both"

    const availableTypes = useMemo(() =>
        [...new Set(skema?.kegiatan?.map(k => k.jenis_penelitian) || [])],
        [skema]
    )

    const [typeFilter, setTypeFilter] = useState(initialJenis || availableTypes[0] || "Penelitian")

    const tabs = useMemo(() => buildLaporanTabs(typeFilter), [typeFilter])

    const tabMaxActions = useMemo(() => ({
        PROSES_PENELITIAN: 3,
        PROSES_PKM: 3,
        PUBLIKASI: 1,
        DISEMINASI: 1,
        CLAIM_DANA: 1,
        PENGEMBALIAN_DANA: 1,
        LUARAN: 1,
        SELESAI: 1,
    }), [])

    const [activeTab, setActiveTab] = useState("PROSES_PENELITIAN")
    const [settings, setSettings] = useState(null)

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab)
    }, [initialTab])

    // Reset activeTab when typeFilter changes to keep view consistent
    useEffect(() => {
        if (!initialTab && !initialJenis) setActiveTab(tabs[0]?.key || "PROSES_PENELITIAN")
    }, [typeFilter])

    useEffect(() => {
        fetchSettings().then(setSettings).catch(() => {})
    }, [])

    useEffect(() => {
        qb.resetFilters()
        
        const key = tabs.find(t => t.key === activeTab)?.key
        if (!key) return

        if (key === "SELESAI") {
            qb.addFilter("completed", "1")
            if (skema?.skema_id) qb.addFilter("skema_id", skema.skema_id)
            if (typeFilter !== "all") qb.addFilter("jenis_penelitian", typeFilter)
            setqs(qb.toQueryString())
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
        setqs(qb.toQueryString())
        setRefreshKey(prev => prev + 1)
    }, [activeTab, semesterFilter, typeFilter, skema])

    const currentTab = tabs.find(t => t.key === activeTab)

    const isSemesterActive = (targetSemester) => {
        if (skema?.status !== 'Aktif') return false
        if (settings?.ignore_kegiatan_dates) return true

        return skema?.kegiatan?.some(p => {
            if (!p.kode_kegiatan?.includes(targetSemester)) return false

            if (p.manual_status_override) {
                return p.status === 'Terbuka'
            }

            const today = new Date().toISOString().slice(0, 10)
            if (!p.tgl_mulai || !p.tgl_selesai) return p.status === 'Terbuka'
            return today >= p.tgl_mulai && today <= p.tgl_selesai
        })
    }

    const menus = createLaporanDosenMenus({
        user,
        access,
        semesterFilter,
        isSemesterActive,
        handleViewLogbook,
        handleFinish,
        handlePublikasi,
        handleUploadClaimProof,
        handleUploadPengembalianProof,
        handleSitasi,
        handleViewRevisiReason,
    })

    const contextMenus = useMemo(() => {
        const itemTabMap = {
            "Cek Logbook": ["PROSES_PENELITIAN", "PROSES_PKM"],
            "Selesaikan Laporan": ["PROSES_PENELITIAN", "PROSES_PKM"],
            "Publikasi": ["PUBLIKASI"],
            "Upload Bukti Terima Claim Dana": ["CLAIM_DANA"],
            "Upload Bukti Pengembalian Dana": ["PENGEMBALIAN_DANA"],
            "Kelola Sitasi": ["LUARAN_PENELITIAN", "LUARAN_PKM"],
        }
        const allItems0 = menus.row[0]?.items ?? []
        const filtered0 = allItems0.filter(item => {
            const tabKeys = itemTabMap[item.text]
            return tabKeys?.includes(activeTab)
        })
        const revisiItems = menus.row[1]?.items ?? []
        const filteredGroups = []
        if (filtered0.length > 0) filteredGroups.push({ type: "group", items: filtered0 })
        if (revisiItems.length > 0) filteredGroups.push({ type: "group", items: revisiItems })
        return { main: [], row: filteredGroups }
    }, [menus, activeTab])

    const rowActions = useMemo(() => {
        const itemTabMap = {
            "Cek Logbook": ["PROSES_PENELITIAN", "PROSES_PKM"],
            "Selesaikan Laporan": ["PROSES_PENELITIAN", "PROSES_PKM"],
            "Publikasi": ["PUBLIKASI"],
            "Upload Bukti Terima Claim Dana": ["CLAIM_DANA"],
            "Upload Bukti Pengembalian Dana": ["PENGEMBALIAN_DANA"],
            "Kelola Sitasi": ["LUARAN_PENELITIAN", "LUARAN_PKM"],
        }
        const allItems = menus.row[0]?.items ?? []
        return allItems.filter(item => {
            const tabKeys = itemTabMap[item.text]
            return tabKeys?.includes(activeTab)
        })
    }, [menus, activeTab])

    function handleViewLogbook(r){
        setTempLaporan(r)
        setShowLogbookModal(true)
    }

    function handleFinish(r){
        const prosesKodes = [
            "PROSES_PENELITIAN_GANJIL", "PROSES_PENELITIAN_GENAP",
            "PROSES_PKM_GANJIL", "PROSES_PKM_GENAP",
        ]

        if (!prosesKodes.includes(r.kode_kegiatan)) {
            setAlertMsg("Laporan sedang bukan pada tahap Proses.")
            setAlertStatus("error")
            setShowAlert(true)
            return
        }

        setTempLaporan(r)
        setShowFinishModal(true)
    }

    function handlePublikasi(r){
        if (!["PUBLIKASI_GANJIL", "PUBLIKASI_GENAP"].includes(r.kode_kegiatan)) {
            setAlertMsg("Laporan belum memasuki tahap Publikasi.")
            setAlertStatus("error")
            setShowAlert(true)
            return
        }

        setTempLaporan(r)
        setShowPublikasiModal(true)
    }

    function handleUploadClaimProof(r){
        setTempLaporan(r)
        setShowClaimProofModal(true)
    }

    function handleUploadPengembalianProof(r){
        setTempLaporan(r)
        setShowPengembalianProofModal(true)
    }

    function handleSitasi(r){
        setTempLaporan(r)
        setShowSitasiModal(true)
    }

    function handleViewRevisiReason(r){
        setTempLaporan(r)
        setShowRevisiReasonModal(true)
    }

    async function confirmFinish(){
        try {
            const formData = new FormData()
            formData.append("laporan_id", tempLaporan.laporan_id)

            const res = await finishLaporan(formData)

            if (res.data.status === "success") {
                setAlertMsg("Laporan selesai. Tahap Publikasi telah dimulai.")
                setAlertStatus("success")
            } else {
                setAlertMsg(res.data.message || "Gagal menyelesaikan laporan.")
                setAlertStatus("error")
            }
        }
        catch (err) {
            console.error(err)

            setAlertMsg("Gagal menyelesaikan laporan.")
            setAlertStatus("error")
        }
        finally {
            setShowFinishModal(false)
            setShowAlert(true)
            refreshTable()
        }
    }

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    // const handleChange = (e, type) => {
    //     const { name, value } = e.target
    //     // setForm(prev => ({
    //     //     ...prev,
    //     //     [name]: value,
    //     // }))

    //     // if(type == 'search'){
    //     //     qb.setSearch(e.target.value)
    //     // }
    //     // else if(type == 'filter'){
    //     //     qb.addFilter(e.target.name, e.target.value)
    //     // }
    // }

    // const handleSearch = () => {
    //     setqs(qb.toQueryString(form.search))
    //     refreshTable()
    // }

    return (
        <div 
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => openMenu(e)}
        >
            <div className="flex flex-col justify-between items-start gap-5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button
                        onClick={onBack}
                        className="hover:text-black"
                    >
                        Monitoring Progress
                    </button>
                    <span>›</span>
                    <span>{skema.nama_skema}</span>
                    <span>›</span>
                    <span className="font-medium text-black">
                        Monitoring Progress Laporan
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Monitoring Progress Laporan — {skema.tahun_ajaran}</h1>
                    <p className="text-lg text-gray-500 font-light">Cek dan lacak progress pengerjaan laporan anda disini.</p>
                </div>

                {/* <div className="bg-white rounded-lg p-3 w-full flex items-end gap-2">
                    <div className="w-1/4">
                        <TextInput
                            name="search" 
                            type="text"
                            placeholder="Cari judul penelitian, dsb..."
                            icon={faFile}
                            value={form.search}
                            onChange={(e) => handleChange(e, 'search')}
                        />
                    </div>

                    <div className="w-1/4">
                        <SelectInput
                            name="kegiatan_id"
                            value={form.kegiatan_id}
                            onChange={(e) => handleChange(e, 'filter')}
                            dataSource={fetchAllKegiatan}
                            transform={(item) => ({
                                text: item.nama_kegiatan,
                                value: item.kegiatan_id
                            })}
                            icon={faSquarePollVertical}
                            placeholder="Pilih kegiatan penelitian"
                        />
                    </div>
                    <div className="w-1/4">
                        <Button icon={faSearch} onClick={handleSearch} className="!p-4" />
                    </div>
                </div> */}

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

                <CustomTable
                    fetchMethod={getLaporan}
                    searchQuery={qs}
                    refreshKey={refreshKey}
                    className="w-full"
                    roundedStyle="rounded-lg rounded-tl-none"
                    onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                    maxActions={tabMaxActions[activeTab] ?? 1}
                    rowActions={rowActions}
                    onRefresh={refreshTable}
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
                            render: (value, row) => {
                                return (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <TextTag color={`${row.semester == 'Ganjil' ? '#C4161C' : '#0197CA'}`} size="text-xs">{ row.semester }</TextTag>
                                            <div className="relative w-full">
                                                <p className="text-sm line-clamp-1 peer">{ row.judul }</p>

                                                <span className="absolute opacity-0 top-5 w-fit text-xs bg-white drop-shadow-sm border border-gray-300 px-2 py-1 rounded-lg z-10 transition-all duration-200 ease-in-out translate-y-8 peer-hover:opacity-100 peer-hover:translate-y-0">
                                                    <p className="w-full">{ row.judul }</p>
                                                </span>
                                            </div>
                                            {row.status === "Revisi" && row.catatan && (
                                                <div className="relative group">
                                                    <FontAwesomeIcon
                                                        icon={faExclamationTriangle}
                                                        className="text-orange-500 text-sm cursor-help"
                                                    />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-xs bg-white drop-shadow-sm border border-gray-300 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                                                        Laporan dikembalikan oleh Admin untuk direvisi.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            header: "Kegiatan",
                            key: "nama_kegiatan",
                            width: "10%",
                            render: (value) => {
                                return (
                                    <span className="text-sm">{value || "-"}</span>
                                )
                            }
                        },
                        {
                            header: "Tahap & Status",
                            key: "kode_kegiatan",
                            width: "18%",
                            render: (value, row) => {

                                if (!value) {
                                    return <span className="text-sm italic text-gray-500">-</span>
                                }

                                const label = KODE_KEGIATAN_SHORT_LABELS[value] || value

                                return (
                                    <div className="flex flex-col gap-1">
                                        <Badge color={LAPORAN_KODE_COLORS[label] || 'gray'} size="sm" className="w-fit">
                                            {label}
                                        </Badge>
                                        <Badge color={LAPORAN_STATUS_COLORS[row.status]?.color || 'gray'} size="sm" intensity="light" className="w-fit">
                                            {row.status || "-"}
                                        </Badge>
                                    </div>
                                )
                            }
                        },
                        { 
                            header: "Tgl Submit", 
                            key: "tgl_submit", 
                            width: "12%",
                            render: (value, row) => { 
                                return (row.progress.tgl_submit == null ? '-' : formatIndonesianDate(row.progress.tgl_submit))
                            } 
                        },
                        ...(activeTab === "DISEMINASI" ? [{
                            header: "Reviewer", 
                            key: "nama_reviewer",
                            width: "18%",
                            render: (value, row) => {
                                if(row.members.length > 0){
                                    return (
                                        <div className="grid grid-cols-1 gap-1">
                                            {
                                                row.members.map((p, i) => (
                                                    <span className="relative" key={i}>
                                                        <div className="flex items-center gap-2 text-xs peer">
                                                            <Image
                                                                src={`${p.avatar}`}
                                                                alt={p.nama}
                                                                width={25}
                                                                height={25}
                                                                className="relative rounded-full peer"
                                                                unoptimized
                                                            />
                                                            <p className="peer truncate">{p.nama}</p>
                                                        </div>
                                                        
                                                        <span className="absolute -top-7 bg-white shadow-lg opacity-0 peer-hover:opacity-100 rounded-md text-black text-xs px-2 py-1 transition-opacity duration-200 ease-in-out">{p.nama}</span>
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                                else{
                                    return (
                                        <span className="text-sm italic text-gray-500">Tidak ada anggota.</span>
                                    )
                                }
                            }
                        }] : []),
                        // { 
                        //     header: "Status", 
                        //     key: "status",
                        //     render: (value, row) => {
                        //         const isActive = value.toLowerCase()
                        //         const style = statusStyles[isActive] || statusStyles.default
        
                        //         return (
                        //             <span className={`${style} text-sm px-2 py-1 border rounded`}>
                        //                 { value }
                        //             </span>
                        //         )
                        //     }
                        // },
                    ]}
                />
            </div>

            <AnimatePresence>
                {showLogbookModal && (
                    <LogbookViewDosen
                        close={() => setShowLogbookModal(false)}
                        data={tempLaporan}
                        refresh={refreshTable}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPublikasiModal && (
                    <PublikasiForm
                        close={() => setShowPublikasiModal(false)}
                        laporan={tempLaporan}
                        refresh={refreshTable}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFinishModal && (
                    <Alert
                        alertType="warning"
                        title="Selesaikan Laporan"
                        msg="Apakah anda yakin ingin menyelesaikan laporan ini? Laporan akan memasuki tahap Publikasi."
                        onCancel={() => setShowFinishModal(false)}
                        onAccept={confirmFinish}
                        acceptText="Selesaikan"
                        isConfirmation={true}
                        withBackground={true}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showClaimProofModal && (
                    <TransferProofForm
                        mode="claim"
                        close={() => setShowClaimProofModal(false)}
                        laporan={tempLaporan}
                        refresh={refreshTable}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPengembalianProofModal && (
                    <TransferProofForm
                        mode="pengembalian"
                        close={() => setShowPengembalianProofModal(false)}
                        laporan={tempLaporan}
                        refresh={refreshTable}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSitasiModal && (
                    <SitasiForm
                        close={() => setShowSitasiModal(false)}
                        laporan={tempLaporan}
                        refresh={refreshTable}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRevisiReasonModal && (
                    <motion.div
                        key="revisiReasonModal"
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-0">
                            <div className="bg-orange-50 border-b border-orange-200 rounded-t-xl px-6 py-4 flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-full">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-orange-800">Laporan Perlu Revisi</h2>
                            </div>
                            <div className="px-6 py-5">
                                <p className="text-sm text-gray-500 mb-3">Laporan anda dikembalikan oleh Admin untuk direvisi.</p>
                                {tempLaporan.catatan ? (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-orange-800 mb-1">Catatan Revisi:</p>
                                        <p className="text-sm text-orange-700" dangerouslySetInnerHTML={{ __html: tempLaporan.catatan }} />
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 italic">Tidak ada catatan revisi yang diberikan.</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => setShowRevisiReasonModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showAlert && (
                <Alert
                    msg={alertMsg}
                    alertType={alertStatus}
                    onCancel={() => setShowAlert(false)}
                />
            )}

            <ContextMenu
                contextMenu={contextMenu}
                closeMenu={closeMenu}
                menus={contextMenus}
            />
        </div>
    )
}