"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SelectInput from "@/app/component/Inputs/SelectInput";
import { faFile, faSearch, faSquarePollVertical, faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { useUserStore } from "@/app/stores/useUserStore";

import { getModuleAccess } from "@/app/component/Libraries/utils/menu";

import { getProposal } from "@/app/component/Libraries/api/proposal";
import { getLaporan } from "@/app/component/Libraries/api/laporan";
import { fetchAllKegiatan } from "@/app/component/Libraries/api/kegiatan";
import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder";
import useHighlight from "@/app/component/Libraries/hooks/useHighlight";

import CustomTable from "@/app/component/Table/CustomTable";
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date";
import TextInput from "@/app/component/Inputs/TextInput";
import Button from "@/app/component/Inputs/Button";
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu";
import ContextMenu from "@/app/component/Context/ContextMenu";
import { AnimatePresence } from "framer-motion";
import TextTag from "@/app/component/Tags/TextTag";
import Badge, { StatusBadge } from "@/app/component/Display/Badge";
import { REVIEW_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors";
import FormPenilaianReviewer from "./PenilaianForm";
import { createReviewReviewerMenus } from "@/app/component/Libraries/config/Review/ReviewReviewerMenu";

export default function ListPengajuanReviewer(){
    const searchParams = useSearchParams()
    const highlightId = searchParams.get("highlight_id")
    const initialType = searchParams.get("type") || "proposal"

    const defaultForm = {
        search: "",
        kegiatan_id: "",
    }

    const qb = useQueryBuilder()
    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    const [qs, setqs] = useState('')
    const [form, setForm] = useState(defaultForm)

    const [refreshKey, setRefreshKey] = useState(0)
    const [showPenilaianModal, setShowPenilaianModal] = useState(false)

    const [reviewType, setReviewType] = useState(initialType)

    // const [editPenilaianModal, setEditPenilaianModal] = useState(false)
    // const [removePenilaianModal, setRemovePenilaianModal] = useState(false)
    
    const [tempRowData, setTempRowData] = useState({})

    const [loadingForm, setLoadingForm] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("reviewproposal", user?.role)

    const highlight = useHighlight(2000)

    useEffect(() => {
        if (highlightId) {
            const timer = setTimeout(() => {
                highlight(`row-${highlightId}`, { scroll: true })
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [highlightId, highlight, refreshKey])

    const canStartReview = (r) => {
        if (!access.create) return false

        if (reviewType === "laporan") {
            const myPenugasan = (r.penugasan || []).find(
                p => p.user_id === user?.id
            )
            return myPenugasan && myPenugasan.status_review === "Belum direview"
        }

        return r.status === "Belum direview"
    }

    const menus = createReviewReviewerMenus({
        user,
        access,
        reviewType,
        handleShow,
        handleTolak
    })

    function handleShow(r){
        setShowPenilaianModal(true)
        setTempRowData(r)
    }

    function handleTolak(r){
        setRemoveProposalModal(true)
        setTempRowData(r)
    }

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
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
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Monitoring Proses Review</h1>
                    <p className="text-lg text-gray-500 font-light">Cek progress review proposal dan publikasi (diseminasi) disini.</p>
                </div>

                <div className="flex border-b border-gray-300 w-full">
                    {[
                        { key: "proposal", label: "Review Proposal" },
                        { key: "laporan", label: "Review Laporan" },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setReviewType(tab.key)
                                refreshTable()
                            }}
                            className={
                                "px-4 py-2 text-sm " +
                                (reviewType === tab.key
                                    ? "border-b-2 border-black text-black font-medium"
                                    : "text-gray-500 hover:text-black")
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
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
                        <Button icon={faSearch} onClick={handleSearch} className="!p-4"></Button>
                    </div>
                </div>

                <CustomTable
                    fetchMethod={reviewType === "laporan" ? getLaporan : getProposal}
                    searchQuery={qb.toQueryString()}
                    refreshKey={refreshKey}
                    className="w-full"
                    roundedStyle="rounded-lg rounded-tl-none"
                    onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                    maxActions={1}
                    onRefresh={refreshTable}
                    rowHighlightKey={reviewType === "laporan" ? "laporan_id" : "proposal_id"}
                    rowActions={[
                        { icon: faClipboardList, text: "Mulai penilaian", action: handleShow, enabled: canStartReview }
                    ]}
                    columns={[
                        reviewType === "laporan"
                        ? {
                            header: "Judul Laporan",
                            key: "judul",
                            width: "25%",
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
                        }
                        : {
                            header: "Rencana Judul",
                            key: "judul",
                            width: "20%",
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
                            header: reviewType === "laporan" ? "Tgl Mulai" : "Tgl Pengajuan",
                            key: reviewType === "laporan" ? "tgl_mulai" : "tgl_pengajuan",
                            render: (value, row) => {
                                if (reviewType === "laporan") {
                                    const date = row.progress?.tgl_mulai
                                    return date ? formatIndonesianDate(date) : "-"
                                }
                                return value ? formatIndonesianDate(value) : "-"
                            }
                        },
                        {
                            header: "Ketua Peneliti", 
                            key: "nama",
                            width: "15%",
                            render: (value, row) => {
                                return (
                                    <span className="relative w-full">
                                        <div className="flex items-center gap-2 text-xs peer">
                                            <Image
                                                src={`${row.ketua?.avatar_url || ''}`}
                                                alt={row.ketua?.nama || 'Ketua'}
                                                width={25}
                                                height={25}
                                                className="relative rounded-full peer"
                                                unoptimized
                                            />
                                            <p className="peer truncate">{row.ketua.nama}</p>
                                        </div>
                                        
                                        <span className="absolute -top-7 bg-white shadow-lg opacity-0 peer-hover:opacity-100 rounded-md text-black text-xs px-2 py-1 transition-opacity duration-200 ease-in-out text-nowrap">{row.ketua.nama}</span>
                                    </span>
                                )
                            }
                        },
                        {
                            header: "Reviewer", 
                            key: "nama",
                            width: "20%",
                            render: (value, row) => {
                                if(row.penugasan.length > 0){
                                    return (
                                        <div className="grid grid-cols-2 gap-1">
                                            {
                                                row.penugasan.map((p, i) => {
                                                    return ( 
                                                        <span className="relative" key={i}>
                                                            <div className="flex items-center gap-2 text-xs peer">
                                                                <Image
                                                                    src={`${p.reviewer?.avatar_url || ''}`}
                                                                    alt={p.reviewer?.nama || 'Reviewer'}
                                                                    width={25}
                                                                    height={25}
                                                                    className="relative rounded-full peer"
                                                                    unoptimized
                                                                />
                                                                <p className="peer truncate">{p.reviewer?.nama}</p>
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
                        { 
                            header: "Status", 
                            key: "status",
                            render: (value, row) => {
                                if (reviewType === "laporan") {
                                    const myPenugasan = (row.penugasan || []).find(
                                        p => p.user_id === user?.id
                                    )
                                    const reviewStatus = myPenugasan?.status_review || "Belum direview"
                                    const isActive = reviewStatus.toLowerCase()
                                    return (
                                        <StatusBadge status={isActive} statusStyles={REVIEW_STATUS_COLORS} className="w-fit" />
                                    )
                                }
                                const isActive = value.toLowerCase()
        
                                return (
                                    <StatusBadge status={isActive} statusStyles={REVIEW_STATUS_COLORS} className="w-fit" />
                                )
                            }
                        },
                    ]}
                />
            </div>

             <AnimatePresence>
                {showPenilaianModal && (
                    <FormPenilaianReviewer
                        refresh={() => refreshTable()}
                        data={tempRowData}
                        close={() => setShowPenilaianModal(false)}
                    />
                )}
            </AnimatePresence>

            {/*
            <AnimatePresence>
                {addPenugasanModal && (
                    <FormPenugasanReviewer
                        refresh={() => refreshTable()}
                        close={(x) => x == 'all' ? closeAllModal() : setAddPenugasanModal(false)}
                        data={tempRowData}
                        alertMsg={(msg) => setAlertMsg(msg)}
                        alertStatus={(stt) => setAlertStatus(stt)}
                        alertTrigger={() => setShowAlert(true)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {removeProposalModal && 
                    <FormPenolakanPengajuan
                        refresh={() => refreshTable()}
                        close={(x) => x == 'all' ? closeAllModal() : setRemoveProposalModal(false)}
                        data={tempRowData}
                        alertMsg={(msg) => setAlertMsg(msg)}
                        alertStatus={(stt) => setAlertStatus(stt)}
                        alertTrigger={() => setShowAlert(true)}
                    />
                }
            </AnimatePresence> */}

            <ContextMenu
                contextMenu={contextMenu}
                closeMenu={closeMenu}
                menus={menus}
            />
        </div>
    )
}