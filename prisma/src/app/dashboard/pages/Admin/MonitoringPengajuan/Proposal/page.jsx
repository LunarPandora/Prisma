"use client"

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { faCheck, faFile, faQuestion, faX } from "@fortawesome/free-solid-svg-icons";
import { useUserStore } from "@/app/stores/useUserStore";

import { getModuleAccess } from "@/app/component/Libraries/utils/menu";

import { getProposal } from "@/app/component/Libraries/api/proposal";
import { ketuaDecideSeleksi, staffDecideSeleksi } from "@/app/component/Libraries/api/proposal";
import { createAuthorizationRequest } from "@/app/component/Libraries/api/authorization";
import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder";
import useHighlight from "@/app/component/Libraries/hooks/useHighlight";

import CustomTable from "@/app/component/Table/CustomTable";
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date";
import TextInput from "@/app/component/Inputs/TextInput";
import SelectInput from "@/app/component/Inputs/SelectInput";
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu";
import ContextMenu from "@/app/component/Context/ContextMenu";
import { createProposalAdminMenus } from "@/app/component/Libraries/config/Proposal/proposalAdminMenu";
import { AnimatePresence } from "framer-motion";
import FormPenugasanReviewer from "./PenugasanReviewerForm";
import FormPenolakanPengajuan from "./PenolakanPengajuanForm";
import FormProposalViewAdmin from "./ProposalViewForm";
import TextTag from "@/app/component/Tags/TextTag";
import Badge, { StatusBadge } from "@/app/component/Display/Badge";
import { PROPOSAL_STATUS_COLORS, KODE_KEGIATAN_SHORT_LABELS, LAPORAN_KODE_COLORS, JENIS_PENELITIAN_COLORS } from "@/app/component/Libraries/config/statusColors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormHasilReview from "./HasilReviewForm";
import PengumumanSuratTugasPanel from "./PengumumanSuratTugasPanel";
import TerimaProposalForm from "./TerimaProposalForm";

export default function Proposal({ skema, onBack, highlightId, initialTab, initialJenis }){
    const defaultForm = {
        search: "",
    }

    const qb = useQueryBuilder()
    const [qs, setQs] = useState('')

    const { contextMenu, openMenu, closeMenu } = useContextMenu()
    const [form, setForm] = useState(defaultForm)

    const [refreshKey, setRefreshKey] = useState(0)
    const [showProposalViewModal, setShowProposalViewModal] = useState(false)
    const [showHasilReviewModal, setShowHasilReviewModal] = useState(false)
    const [showTerimaProposalModal, setShowTerimaProposalModal] = useState(false)
    const [addPenugasanModal, setAddPenugasanModal] = useState(false)
    const [removeProposalModal, setRemoveProposalModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})

    const [loadingForm, setLoadingForm] = useState(false)

    const highlight = useHighlight(2000)

    const tabs = [
        {
            label: "Pengajuan",
            value: "PENERIMAAN_PROPOSAL"
        },
        {
            label: "Seleksi",
            value: "SELEKSI_PROPOSAL"
        },
        {
            label: "Pengumuman",
            value: "PENGUMUMAN_SURAT_TUGAS"
        }
    ]

    const [activeTab, setActiveTab] =
        useState("PENERIMAAN_PROPOSAL")

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
        if (highlightId) {
            const timer = setTimeout(() => {
                highlight(`row-${highlightId}`, { scroll: true })
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [highlightId, highlight, refreshKey])

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("staffmonitoringprogress", user?.role)
    const isKetua = user?.role === "Ketua LPPM"

    const statusReviewStyles = {
        'belum direview': {icon: faX, color: 'text-red-600'},
        'telah direview': {icon: faCheck, color: 'text-green-600'},
        default: {icon: faQuestion, color: 'text-blue-600'}
    }

    const menus = createProposalAdminMenus({
        user,
        access,
        handleShow,
        handlePenugasan,
        handleTolak,
        handleCheckReview,
        handleUploadSK,
        handleTerimaProposal,
        handleKetuaDecideSeleksi,
        handleStaffDecideSeleksi,
        handleStaffRejectProposal,
        handleStaffReturnProposal,
        handleViewSeleksiRejection
    })

    const rowActions = useMemo(() =>
        menus.row.flatMap(group => group.items),
    [menus])

    function handleShow(r){
        setShowProposalViewModal(true)
        setTempRowData(r)
    }

    function handleCheckReview(r){
        setShowHasilReviewModal(true)
        setTempRowData(r)
    }
    
    function handlePenugasan(r){
        setAddPenugasanModal(true)
        setTempRowData(r)
    }

    function handleTolak(r){
        setRemoveProposalModal(true)
        setTempRowData(r)
    }

    function handleUploadSK(r){
        setTempRowData(r)
        setActiveTab("PENGUMUMAN_SURAT_TUGAS")
    }

    function handleTerimaProposal(r){
        setShowTerimaProposalModal(true)
        setTempRowData(r)
    }

    function handleTerimaPengajuan(r){
        handleKetuaDecideSeleksi({ proposal_id: r.proposal_id, decision: 'accept' })
        setShowProposalViewModal(false)
    }

    async function handleKetuaDecideSeleksi(r){
        try {
            const formData = new FormData()
            formData.append('proposal_id', r.proposal_id)
            formData.append('decision', r.decision || 'accept')

            if (r.decision === 'reject') {
                const catatan = prompt('Alasan penolakan:')
                if (catatan === null) return
                formData.append('catatan', catatan || 'Proposal ditolak oleh Ketua LPPM')
            }

            await ketuaDecideSeleksi(formData)
        } catch(err){
            console.error(err)
        } finally {
            setTimeout(() => {
                refreshTable()
            }, 300)
        }
    }

    async function handleStaffDecideSeleksi(r, decision = 'accept'){
        try {
            const formData = new FormData()
            formData.append('proposal_id', r.proposal_id)
            formData.append('decision', decision)

            if (decision === 'reject') {
                const catatan = prompt('Alasan penolakan:')
                if (catatan === null) return
                formData.append('catatan', catatan || 'Proposal ditolak oleh Staff LPPM')
            }

            await staffDecideSeleksi(formData)
        } catch(err){
            console.error(err)
        } finally {
            setTimeout(() => {
                refreshTable()
            }, 300)
        }
    }

    async function handleStaffRejectProposal(r) {
        const reason = prompt('Alasan penolakan proposal:')
        if (!reason || reason.length < 10) {
            alert('Alasan harus minimal 10 karakter')
            return
        }
        try {
            await createAuthorizationRequest({
                requestable_type: 'Proposal',
                requestable_id: r.proposal_id,
                action: 'reject_proposal',
                reason,
            })
        } catch(err) {
            console.error(err)
        } finally {
            refreshTable()
        }
    }

    async function handleStaffReturnProposal(r) {
        const reason = prompt('Alasan pengembalian untuk perbaikan:')
        if (!reason || reason.length < 10) {
            alert('Alasan harus minimal 10 karakter')
            return
        }
        try {
            await createAuthorizationRequest({
                requestable_type: 'Proposal',
                requestable_id: r.proposal_id,
                action: 'return_proposal_for_revision',
                reason,
            })
        } catch(err) {
            console.error(err)
        } finally {
            refreshTable()
        }
    }

    function handleViewSeleksiRejection(r){
        setShowProposalViewModal(true)
        setTempRowData(r)
    }

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    function closeAllModal(){
        setAddPenugasanModal(false)
        setShowProposalViewModal(false)
        setShowHasilReviewModal(false)
        setShowTerimaProposalModal(false)
        setRemoveProposalModal(false)
    }

    const handleChange = (e, type) => {
        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value,
        }))

        switch(type){
            case "search":
                qb.setSearch(value)
                break

            case "filter":
                qb.addFilter(name, value)
                break
        }

        setQs(qb.toQueryString())
    }

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
        setQs(qb.toQueryString())
    }, [activeTab, typeFilter, skema])

    return (
        <div 
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => activeTab !== "PENGUMUMAN_SURAT_TUGAS" && openMenu(e)}
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
                    <h1 className="text-4xl font-medium">Monitoring Progress Proposal — {skema.tahun_ajaran}</h1>
                    <p className="text-lg text-gray-500 font-light">Cek progress pengajuan proposal dari dosen disini.</p>
                </div>

                <div className="bg-white rounded-lg p-3 w-full flex items-end gap-2">
                    <div className="w-1/4">
                        <TextInput
                            name="search" 
                            type="text"
                            placeholder="Cari dosen, judul penelitian, dsb..."
                            icon={faFile}
                            value={form.search}
                            onChange={(e) => handleChange(e, 'search')}
                        />
                    </div>
                    {availableTypes.length > 1 && (
                        <div className="w-1/6">
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
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

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

                {
                    activeTab === "PENGUMUMAN_SURAT_TUGAS" &&
                    <PengumumanSuratTugasPanel
                        skema={skema}
                        refreshKey={refreshKey}
                    />
                }

                {activeTab !== "PENGUMUMAN_SURAT_TUGAS" && (
                    <div className="flex flex-col gap-y-3 w-full border border-gray-300 rounded-md p-5 bg-white">
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-600 text-lg font-medium">
                                {activeTab === "PENERIMAAN_PROPOSAL"
                                    ? "Pengajuan Proposal"
                                    : "Seleksi Proposal"}
                            </span>
                            <span className="text-sm text-gray-500 font-light">
                                {activeTab === "PENERIMAAN_PROPOSAL"
                                    ? "Daftar proposal yang telah diajukan oleh peneliti."
                                    : "Daftar proposal yang sedang dalam proses seleksi oleh reviewer."}
                            </span>
                        </div>

                        <CustomTable
                            fetchMethod={getProposal}
                            searchQuery={qs}
                            refreshKey={refreshKey}
                            className="w-full"
                            onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                            maxActions={isKetua ? 3 : 5}
                            rowActions={rowActions}
                            onRefresh={refreshTable}
                            rowHighlightKey="proposal_id"
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
                            header: "Ketua Peneliti", 
                            key: "nama",
                            width: "13%",
                            render: (value, row) => {
                                return (
                                    <span className="relative w-full">
                                        <div className="flex items-center gap-2 text-xs peer">
                                            <Image
                                                src={`${row.dosen.avatar_url}`}
                                                alt={row.dosen.nama}
                                                width={25}
                                                height={25}
                                                className="relative rounded-full peer"
                                                unoptimized
                                            />
                                            <p className="peer truncate">{row.dosen.nama}</p>
                                        </div>
                                        
                                        <span className="absolute -top-7 bg-white shadow-lg opacity-0 peer-hover:opacity-100 rounded-md text-black text-xs px-2 py-1 transition-opacity duration-200 ease-in-out text-nowrap">{row.dosen.nama}</span>
                                    </span>
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
                            key: "status",
                            render: (value, row) => {
                                const isActive = value.toLowerCase()
                                const stageLabel = KODE_KEGIATAN_SHORT_LABELS[row.kode_kegiatan] || row.nama_kegiatan || "-"
                                const isSeleksi = [
                                    "Menunggu review dari Ketua LPPM",
                                    "Menunggu review Staff LPPM",
                                    "Menunggu penugasan reviewer",
                                    "Menunggu review",
                                    "Menunggu persetujuan Ketua LPPM"
                                ].includes(value)

                                return (
                                    <div className="flex flex-col gap-1">
                                        <Badge color={LAPORAN_KODE_COLORS[stageLabel] || 'gray'} size="sm" className="w-fit">
                                            {stageLabel}
                                        </Badge>
                                        <StatusBadge status={isActive} statusStyles={PROPOSAL_STATUS_COLORS} className="text-nowrap w-fit" />
                                        {isSeleksi && (
                                            <div className="flex gap-1">
                                                <Badge
                                                    color={row.ketua_seleksi_approved ? 'green' : 'gray'}
                                                    size="xs"
                                                    variant="bordered"
                                                    intensity="light"
                                                >
                                                    Ketua: {row.ketua_seleksi_approved ? "✓ Setuju" : "○ Belum"}
                                                </Badge>
                                                <Badge
                                                    color={row.has_pending_seleksi_rejection ? 'red' : row.staff_seleksi_approved ? 'green' : 'gray'}
                                                    size="xs"
                                                    variant="bordered"
                                                    intensity="light"
                                                >
                                                    Staff: {row.has_pending_seleksi_rejection
                                                        ? "✗ Ditolak"
                                                        : row.staff_seleksi_approved ? "✓ Setuju" : "○ Belum"}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        },
                        {
                            header: "Reviewer", 
                            key: "nama",
                            width: "18%",
                            render: (value, row) => {
                                if(row.penugasan.length > 0){
                                    return (
                                        <div className="grid grid-cols-1 gap-1">
                                            {
                                                row.penugasan.map((p, i) => {
                                                    const isActive = p.status_review.toLowerCase()
                                                    const style = statusReviewStyles[isActive] || statusReviewStyles.default

                                                    return ( 
                                                        <span className="relative" key={i}>
                                                            <div className="flex items-center gap-2 text-xs peer">
                                                                <Image
                                                                    src={`${p.reviewer?.avatar_url}`}
                                                                    alt={p.reviewer?.nama}
                                                                    width={25}
                                                                    height={25}
                                                                    className="relative rounded-full peer"
                                                                    unoptimized
                                                                />
                                                                <p className="peer truncate">{p.reviewer?.nama}</p>

                                                                <FontAwesomeIcon icon={style.icon} className={`${style.color} text-xs`} />
                                                            </div>
                                                        
                                                            <span className="absolute -top-7 bg-white shadow-lg opacity-0 peer-hover:opacity-100 rounded-md text-black text-xs px-2 py-1 transition-opacity duration-200 ease-in-out">{p.reviewer?.nama}</span>
                                                        </span>
                                                    )
                                                })
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
                    ]}
                        />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showProposalViewModal && (
                    <FormProposalViewAdmin
                        close={(x) => x == 'all' ? closeAllModal() : setShowProposalViewModal(false)}
                        data={tempRowData}
                        triggerPenugasan={(d) => handlePenugasan(d)}
                        triggerTolak={(d) => handleTolak(d)}
                        handleKetuaDecideSeleksi={handleKetuaDecideSeleksi}
                        handleStaffDecideSeleksi={handleStaffDecideSeleksi}
                        handleViewSeleksiRejection={handleViewSeleksiRejection}
                        handleTerimaPengajuan={handleTerimaPengajuan}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showHasilReviewModal && (
                    <FormHasilReview
                        refresh={() => refreshTable()}
                        close={(x) => x == 'all' ? closeAllModal() : setShowHasilReviewModal(false)}
                        data={tempRowData}
                        triggerTolak={(d) => handleTolak(d)}
                        triggerTerima={(d) => { setShowHasilReviewModal(false); handleTerimaProposal(d); }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showTerimaProposalModal && (
                    <TerimaProposalForm
                        refresh={() => refreshTable()}
                        close={(x) => x == 'all' ? closeAllModal() : setShowTerimaProposalModal(false)}
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {addPenugasanModal && (
                    <FormPenugasanReviewer
                        refresh={() => refreshTable()}
                        close={(x) => x == 'all' ? closeAllModal() : setAddPenugasanModal(false)}
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {removeProposalModal && 
                    <FormPenolakanPengajuan
                        refresh={() => refreshTable()}
                        close={(x) => x == 'all' ? closeAllModal() : setRemoveProposalModal(false)}
                        data={tempRowData}
                    />
                }
            </AnimatePresence>

            <ContextMenu
                contextMenu={contextMenu}
                closeMenu={closeMenu}
                menus={menus}
            />
        </div>
    )
}