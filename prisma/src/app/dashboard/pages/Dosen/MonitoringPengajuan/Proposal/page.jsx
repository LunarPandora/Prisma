"use client"

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import SelectInput from "@/app/component/Inputs/SelectInput";
import { faFile, faSearch, faSquarePollVertical, faEdit, faTrashCan, faPlus, faFileUpload, faFilePdf, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserStore } from "@/app/stores/useUserStore";

import { getModuleAccess } from "@/app/component/Libraries/utils/menu";

import { deleteProposal, getProposal } from "@/app/component/Libraries/api/proposal";
import { fetchAllKegiatan } from "@/app/component/Libraries/api/kegiatan";
import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder";
import useHighlight from "@/app/component/Libraries/hooks/useHighlight";

import CustomTable from "@/app/component/Table/CustomTable";
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date";
import ContextMenu from "@/app/component/Context/ContextMenu";
import { motion, AnimatePresence } from "framer-motion";
import TextInput from "@/app/component/Inputs/TextInput";
import Button from "@/app/component/Inputs/Button";
import Alert from "@/app/component/Alert/Alert";
import { createProposalDosenMenus } from "@/app/component/Libraries/config/Proposal/proposalDosenMenu";
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu";
import LoadingBar from "@/app/component/AppLoader/LoadingBar";
import Badge, { StatusBadge } from "@/app/component/Display/Badge";
import { PROPOSAL_STATUS_COLORS, KODE_KEGIATAN_SHORT_LABELS, LAPORAN_KODE_COLORS, JENIS_PENELITIAN_COLORS } from "@/app/component/Libraries/config/statusColors";
import FormProposalViewDosen from "./ProposalViewForm";
import FormProposal from "./ProposalForm";
import FormProposalUpload from "./ProposalUploadForm";
import TextTag from "@/app/component/Tags/TextTag";


export default function MonitoringProgressProposal({ skema, onBack, highlightId, initialTab, initialJenis }){
    const defaultForm = {
        search: "",
        kegiatan_id: "",
    }

    const qb = useQueryBuilder()
    const [qs, setqs] = useState('')

    const [form, setForm] = useState(defaultForm)
    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    const [refreshKey, setRefreshKey] = useState(0)
    const [addProposalModal, setAddProposalModal] = useState(false)
    const [editProposalModal, setEditProposalModal] = useState(false)
    const [viewProposalModal, setViewProposalModal] = useState(false)
    const [removeProposalModal, setRemoveProposalModal] = useState(false)
    const [uploadProposalModal, setUploadProposalModal] = useState(false)
    const [rejectionModal, setRejectionModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})

    const [loadingForm, setLoadingForm] = useState(false)

    const highlight = useHighlight(2000)

    useEffect(() => {
        if (highlightId) {
            const timer = setTimeout(() => {
                highlight(`row-${highlightId}`, { scroll: true })
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [highlightId, highlight, refreshKey])

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("dosenmonitoringprogress", user?.role)

    const tabs = useMemo(() => [
        { label: "Pengajuan", value: "PENERIMAAN_PROPOSAL" },
        { label: "Seleksi",   value: "SELEKSI_PROPOSAL" },
        { label: "Pengumuman", value: "PENGUMUMAN_SURAT_TUGAS" }
    ], [])

    const [activeTab, setActiveTab] = useState("PENERIMAAN_PROPOSAL")

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab)
    }, [initialTab])

    const availableTypes = useMemo(() =>
        [...new Set(skema?.kegiatan?.map(k => k.jenis_penelitian) || [])],
        [skema]
    )

    const [typeFilter, setTypeFilter] = useState("all")

    useEffect(() => {
        if (initialJenis) {
            setTypeFilter(initialJenis)
        } else if (availableTypes.length === 1) {
            setTypeFilter(availableTypes[0])
        } else {
            setTypeFilter("all")
        }
    }, [availableTypes])

    useEffect(() => {
        qb.resetFilters()
        if (activeTab === "PENGUMUMAN_SURAT_TUGAS") {
            qb.addFilter("status", "Proposal Diterima,Dalam pengerjaan")
        } else if (activeTab === "PENERIMAAN_PROPOSAL") {
            qb.addFilter("kode_kegiatan", activeTab)
            qb.addFilter("status", "Draft,Ditolak,Revisi,Menunggu proposal untuk diupload")
        } else {
            qb.addFilter("kode_kegiatan", activeTab)
        }
        if (typeFilter !== "all") {
            qb.addFilter("jenis_penelitian", typeFilter)
        }
        if (skema?.skema_id) qb.addFilter("skema_id", skema.skema_id)
        setqs(qb.toQueryString())
        setRefreshKey(prev => prev + 1)
    }, [activeTab, typeFilter, skema])

    const menus = createProposalDosenMenus({
        user,
        access,
        handleView,
        handleAddG,
        handleEditG,
        handleRemoveG,
        handleUpload,
        handleViewRejection
    })

    function handleView(r){
        setViewProposalModal(true)
        setTempRowData(r)
    }

    function handleAddG(){
        setAddProposalModal(true)
    }

    function handleEditG(r){
        setEditProposalModal(true)
        setTempRowData(r)
    }

    function handleRemoveG(r){
        setRemoveProposalModal(true)
        setTempRowData(r)
    }
    
    function handleUpload(r){
        setUploadProposalModal(true)
        setTempRowData(r)
    }

    function handleViewRejection(r){
        setRejectionModal(true)
        setTempRowData(r)
    }

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    async function removeProposal(){
        try{
            setLoadingForm(true)

            const formData = new FormData()
            formData.append('proposal_id', tempRowData.proposal_id)
            await deleteProposal(formData)

            setLoadingForm(false)
        }
        catch(err){
            console.error(err)
        }
        finally{
            refreshTable()
            setRemoveProposalModal(false)
        }
    }

    const handleChange = (e, type) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))

        if(type == 'search'){
            qb.setSearch(e.target.value)
        }
        else if(type == 'filter'){
            qb.addFilter(e.target.name, e.target.value)
        }
    }

    const handleSearch = () => {
        setqs(qb.toQueryString(form.search))
        refreshTable()
    }

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
                        Monitoring Progress Proposal
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Monitoring Pengajuan Proposal — {skema.tahun_ajaran}</h1>
                    <p className="text-lg text-gray-500 font-light">Cek progress pengajuan dan progress proposal anda disini.</p>
                </div>

                <div className="bg-white rounded-lg p-3 w-full flex items-end gap-2">
                    <div className="w-1/4">
                        <TextInput
                            name="search" 
                            type="text"
                            placeholder="Cari reviewer, judul penelitian, dsb..."
                            icon={faFile}
                            value={form.search}
                            onChange={(e) => handleChange(e, 'search')}
                        />
                    </div>
                </div>

                {availableTypes.length > 1 && (
                    <div className="flex items-center gap-2">
                        <SelectInput
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={[
                                { text: "Semua Jenis", value: "all" },
                                ...availableTypes.map(t => ({
                                    text: t === 'PkM' ? 'PkM' : 'Penelitian',
                                    value: t
                                }))
                            ]}
                            placeholder="Jenis"
                            className="w-40"
                        />
                    </div>
                )}

                <div className="flex border-b border-gray-300 w-full overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={
                                "px-4 py-2 text-sm whitespace-nowrap " +
                                (activeTab === tab.value
                                    ? "border-b-2 border-black text-black font-medium"
                                    : "text-gray-500 hover:text-black")
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <CustomTable
                    fetchMethod={getProposal}
                    searchQuery={qs}
                    refreshKey={refreshKey}
                    className="w-full"
                    roundedStyle="rounded-lg rounded-tl-none"
                    onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                    maxActions={3}
                    onRefresh={refreshTable}
                    rowHighlightKey="proposal_id"
                    rowActions={[
                        { icon: faEdit, text: "Edit", action: handleEditG, enabled: (r) => r.status === "Draft" },
                        { icon: faFileUpload, text: "Upload", action: handleUpload, enabled: (r) => r.status === "Menunggu proposal untuk diupload" },
                        { icon: faTrashCan, text: "Hapus", action: handleRemoveG, enabled: (r) => ["Draft", "Menunggu proposal untuk diupload"].includes(r.status), danger: true },
                        { icon: faEdit, text: "Perbaiki", action: handleEditG, enabled: (r) => r.status === "Revisi" },
                        { icon: faExclamationTriangle, text: "Penolakan", action: handleViewRejection, enabled: (r) => r.status === "Ditolak" }
                    ]}
                    headerRight={
                        <button
                            onClick={handleAddG}
                            className="flex items-center gap-2 bg-foreground/90 hover:bg-foreground text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Ajukan Proposal</span>
                        </button>
                    }
                    columns={[  
                        {
                            header: "Jenis",
                            key: "jenis_penelitian_gan",
                            width: "12%",
                            render: (value, row) => (
                                <div className="flex flex-col gap-1">
                                    <TextTag color="#C4161C" size="text-xs" className="w-fit">
                                        Ganjil: {value === 'PkM' ? 'PkM' : 'Penelitian'}
                                    </TextTag>
                                    <TextTag color="#0197CA" size="text-xs" className="w-fit">
                                        Genap: {row.jenis_penelitian_gen === 'PkM' ? 'PkM' : 'Penelitian'}
                                    </TextTag>
                                </div>
                            )
                        },
                        { 
                            header: "Rencana Judul",
                            key: "judul", 
                            width: "22%",
                            render: (value, row) => {
                                return (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <TextTag color="#C4161C" size="text-xs">Ganjil</TextTag>
                                            <div className="relative w-full">
                                                <p className="text-sm line-clamp-1 peer">{ row.rencana_judul_publikasi_gan }</p>

                                                <span className="absolute opacity-0 top-5 w-fit text-xs bg-white drop-shadow-sm border border-gray-300 px-2 py-1 rounded-lg z-10 transition-all duration-200 ease-in-out translate-y-8 peer-hover:opacity-100 peer-hover:translate-y-0">
                                                    <p className="w-full">{ row.rencana_judul_publikasi_gan }</p>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TextTag color="#0197CA" size="text-xs">Genap</TextTag>
                                            <div className="relative w-full">
                                                <p className="text-sm line-clamp-1 peer">{ row.rencana_judul_publikasi_gen }</p>

                                                <span className="absolute opacity-0 top-5 w-fit text-xs bg-white drop-shadow-sm border border-gray-300 px-2 py-1 rounded-lg z-10 transition-all duration-200 ease-in-out translate-y-8 peer-hover:opacity-100 peer-hover:translate-y-0">
                                                    <p className="w-full">{ row.rencana_judul_publikasi_gen }</p>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        },
                        { 
                            header: "Tahap & Status", 
                            key: "status",
                            width: "18%",
                            render: (value, row) => {
                                const isActive = value.toLowerCase()
                                const stageLabel = KODE_KEGIATAN_SHORT_LABELS[row.kode_kegiatan] || row.nama_kegiatan || "-"
                                return (
                                    <div className="flex flex-col gap-1">
                                        <Badge color={LAPORAN_KODE_COLORS[stageLabel] || 'gray'} size="sm" className="w-fit">
                                            {stageLabel}
                                        </Badge>
                                        <div className="flex items-center gap-1.5">
                                            <StatusBadge status={isActive} statusStyles={PROPOSAL_STATUS_COLORS} className="w-fit" />
                                            {row.status === "Revisi" && row.pending_return_reason && (
                                                <div className="relative group">
                                                    <FontAwesomeIcon
                                                        icon={faExclamationTriangle}
                                                        className="text-orange-500 text-sm cursor-help"
                                                    />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 text-xs bg-white drop-shadow-sm border border-gray-300 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                                                        <p className="font-medium text-orange-700 mb-1">Perlu perbaikan:</p>
                                                        <p className="text-gray-600">{row.pending_return_reason}</p>
                                                    </span>
                                                </div>
                                            )}
                                            {row.status === "Ditolak" && row.rejected_by_ketua_seleksi_reason && (
                                                <div className="relative group">
                                                    <FontAwesomeIcon
                                                        icon={faExclamationTriangle}
                                                        className="text-red-500 text-sm cursor-help"
                                                    />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 text-xs bg-white drop-shadow-sm border border-gray-300 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                                                        <p className="font-medium text-red-700 mb-1">Ditolak:</p>
                                                        <p className="text-gray-600">{row.rejected_by_ketua_seleksi_reason}</p>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            header: "Reviewer", 
                            key: "nama_reviewer",
                            width: "18%",
                            render: (value, row) => {
                                if(row.penugasan.length > 0){
                                    return (
                                        <div className="grid grid-cols-1 gap-1">
                                            {
                                                row.penugasan.map((p, i) => (
                                                    <span className="relative" key={i}>
                                                        <div className="flex items-center gap-2 text-xs peer">
                                                            <Image
                                                                src={`${p.reviewer.avatar_url}`}
                                                                alt={p.reviewer.nama}
                                                                width={25}
                                                                height={25}
                                                                className="relative rounded-full peer"
                                                                unoptimized
                                                            />
                                                            <p className="peer truncate">{p.reviewer.nama}</p>
                                                        </div>
                                                        
                                                        <span className="absolute -top-7 bg-white shadow-lg opacity-0 peer-hover:opacity-100 rounded-md text-black text-xs px-2 py-1 transition-opacity duration-200 ease-in-out">{p.reviewer.nama}</span>
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                                else{
                                    return (
                                        <span className="text-sm italic text-gray-500">Belum ada reviewer yang ditugaskan.</span>
                                    )
                                }
                            }
                        },
                        ...(activeTab === "PENGUMUMAN_SURAT_TUGAS" ? [{
                            header: "Surat Tugas Pengumuman",
                            key: "dokumen",
                            width: "15%",
                            render: (value, row) => {
                                const stDoc = row.dokumen?.find(d => d.jenis_dokumen === "Pengumuman Surat Tugas")

                                if (stDoc?.file_url) {
                                    return (
                                        <a
                                            href={stDoc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm"
                                        >
                                            <FontAwesomeIcon icon={faFilePdf} />
                                            Lihat Surat Tugas
                                        </a>
                                    )
                                }

                                return (
                                    <span className="text-gray-400 italic text-xs">
                                        Belum diupload
                                    </span>
                                )
                            }
                        }] : []),
                    ]}
                />
            </div>

            <AnimatePresence>
                {addProposalModal && (
                    <FormProposal
                        refresh={() => refreshTable()}
                        close={() => setAddProposalModal(false)}
                        isEdit={false}
                        skema={skema}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editProposalModal && (
                    <FormProposal
                        refresh={() => refreshTable()}
                        close={() => setEditProposalModal(false)}
                        data={tempRowData}
                        isEdit={true}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {uploadProposalModal && (
                    <FormProposalUpload
                        refresh={() => refreshTable()}
                        close={() => setUploadProposalModal(false)}
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewProposalModal && (
                    <FormProposalViewDosen
                        close={() => setViewProposalModal(false)}
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {removeProposalModal && !loadingForm && (
                    <Alert 
                        alertType="warning"
                        title="Hapus draft proposal"
                        msg="Apakah anda yakin ingin menghapus draft proposal ini?" 
                        onCancel={() => setRemoveProposalModal(false)} 
                        onAccept={() => removeProposal()} 
                        acceptText="Hapus"
                        isConfirmation={true}
                    />
                )}
            </AnimatePresence>

            {removeProposalModal && loadingForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70]">
                    <LoadingBar />
                </div>
            )}

            <AnimatePresence>
                {rejectionModal && (
                    <motion.div
                        key="rejectionModal"
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-0">
                            <div className="bg-red-50 border-b border-red-200 rounded-t-xl px-6 py-4 flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-red-800">Proposal Ditolak</h2>
                            </div>
                            <div className="px-6 py-5">
                                <p className="text-sm text-gray-500 mb-3">Proposal anda telah ditolak oleh Ketua LPPM.</p>
                                {tempRowData.rejected_by_ketua_seleksi_reason && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-red-800 mb-1">Alasan Penolakan:</p>
                                        <p className="text-sm text-red-700">{tempRowData.rejected_by_ketua_seleksi_reason}</p>
                                    </div>
                                )}
                                {!tempRowData.rejected_by_ketua_seleksi_reason && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 italic">Tidak ada alasan yang diberikan.</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => setRejectionModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
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