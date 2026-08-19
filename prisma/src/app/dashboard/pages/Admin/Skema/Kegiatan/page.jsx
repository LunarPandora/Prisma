"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"

import ContextMenu from "@/app/component/Context/ContextMenu"

import FormKegiatan from "./KegiatanForm"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"

import { getKegiatan } from "@/app/component/Libraries/api/kegiatan"
import { createKegiatanAdminMenus } from "@/app/component/Libraries/config/Kegiatan/KegiatanAdminMenu"
import Badge from "@/app/component/Display/Badge"
import { KEGIATAN_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import CustomTable from "@/app/component/Table/CustomTable"
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date"
import SelectInput from "@/app/component/Inputs/SelectInput"
import { faFlask, faTriangleExclamation, faEdit } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder"

const statusDisplayMap = {
    'Belum dibuka': 'Ditutup',
    'Terbuka': 'Dibuka',
    'Selesai': 'Ditutup'
}

const getDisplayStatus = (backendStatus) => {
    return statusDisplayMap[backendStatus] || backendStatus
}

export default function Kegiatan({ skema, onBack }) {
    const [refreshKey, setRefreshKey] = useState(0)

    const [editKegiatanModal, setEditKegiatanModal] = useState(false)

    const id = skema.skema_id
    const [tempRowData, setTempRowData] = useState({})

    const qb = useQueryBuilder()
    const [qs, setQs] = useState("")

    const [filter, setFilter] = useState({
        jenis_penelitian: ""
    })

    const handleFilterChange = (e) => {
        const { name, value } = e.target

        setFilter(prev => ({
            ...prev,
            [name]: value
        }))
    }

    useEffect(() => {
        qb.resetFilters()

        qb.addFilter("skema_id", id)
        qb.addFilter(
            "jenis_penelitian",
            filter.jenis_penelitian
        )

        setQs(qb.toQueryString())
    }, [id, filter.jenis_penelitian])

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("ketuakegiatan", user?.role)

    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    function handleEdit(r) {
        setEditKegiatanModal(true)
        setTempRowData(r)
    }

    const menus = createKegiatanAdminMenus({
        access,
        handleEdit,
    })

    useEffect(() => {
        refreshTable()
    }, [qs])

    return (
        <div
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => openMenu(e)}
        >
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                    onClick={onBack}
                    className="hover:text-black"
                >
                    Skema
                </button>
                <span>›</span>
                <span>{skema.nama_skema}</span>
                <span>›</span>
                <span className="font-medium text-black">
                    List Kegiatan
                </span>
            </div>

            <div className="flex flex-col justify-between items-start gap-5">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">
                        Kegiatan Penelitian
                    </h1>

                    <p className="text-lg text-gray-500 font-light">
                        Kelola kegiatan penelitian dan PkM untuk skema ini.
                    </p>
                </div>

                <div className="bg-white rounded-lg p-3 w-full flex items-end gap-2">
                    <SelectInput
                        name="jenis_penelitian"
                        value={filter.jenis_penelitian}
                        icon={faFlask}
                        onChange={handleFilterChange}
                        options={[
                            {
                                text: "Penelitian",
                                value: "Penelitian"
                            },
                            {
                                text: "PkM",
                                value: "PkM"
                            }
                        ]}
                        placeholder="Jenis Penelitian"
                    />
                </div>

                <CustomTable
                    fetchMethod={getKegiatan}
                    searchQuery={qs}
                    refreshKey={refreshKey}
                    className="w-full"
                    roundedStyle="rounded-lg rounded-tl-none"
                    onContextRequest={(e, type, data, source) =>
                        openMenu(e, type, data, source)
                    }
                    maxActions={1}
                    onRefresh={refreshTable}
                    rowActions={[
                        { icon: faEdit, text: "Edit", action: handleEdit, enabled: access.update }
                    ]}
                    columns={[
                        {
                            header: "Jenis",
                            key: "jenis_penelitian",
                            render: (value) => (
                                <span
                                    className={`px-2 py-1 rounded text-sm ${
                                        value === "Penelitian"
                                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                                            : "bg-green-100 text-green-700 border border-green-300"
                                    }`}
                                >
                                    {value}
                                </span>
                            )
                        },

                        {
                            header: "Nama Kegiatan",
                            key: "nama_kegiatan",
                            render: (value, row) => {
                                const today = new Date().toISOString().slice(0, 10)
                                const isTerbuka = row.status === 'Terbuka'
                                const isOutsideRange =
                                    row.tgl_mulai && row.tgl_selesai
                                        ? today < row.tgl_mulai || today > row.tgl_selesai
                                        : false

                                const isManual = !!row.manual_status_override

                                return (
                                    <span className="flex items-center gap-1.5">
                                        {value}
                                        {isManual && isTerbuka && isOutsideRange && (
                                            <span
                                                title="Kegiatan ini secara manual diatur ke Dibuka oleh Admin, namun berada di luar rentang tanggal aktif."
                                                className="text-yellow-500 cursor-help"
                                            >
                                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                            </span>
                                        )}
                                    </span>
                                )
                            }
                        },

                        {
                            header: "Tanggal Mulai",
                            key: "tgl_mulai",
                            render: (value) => (
                                value
                                    ? formatIndonesianDate(value)
                                    : "-"
                            )
                        },

                        {
                            header: "Tanggal Selesai",
                            key: "tgl_selesai",
                            render: (value) => (
                                value
                                    ? formatIndonesianDate(value)
                                    : "-"
                            )
                        },

                        {
                            header: "Status",
                            key: "status",
                            render: (value, row) => {
                                const displayStatus = getDisplayStatus(value)
                                const status = displayStatus?.toLowerCase()

                                const statusBadge = (() => {
                                    if (status === "ditutup") {
                                        return (
                                            <Badge color={KEGIATAN_STATUS_COLORS[status]?.color || 'gray'} size="md" className="w-fit">
                                                {displayStatus}
                                            </Badge>
                                        )
                                    }

                                    if (status === "dibuka") {
                                        return (
                                            <Badge color={KEGIATAN_STATUS_COLORS[status]?.color || 'gray'} size="md" className="w-fit">
                                                {displayStatus}
                                            </Badge>
                                        )
                                    }

                                    return (
                                        <Badge color={KEGIATAN_STATUS_COLORS.default?.color || 'gray'} size="md" className="w-fit">
                                            {displayStatus}
                                        </Badge>
                                    )
                                })()

                                const isManual = !!row.manual_status_override

                                return (
                                    <span className="flex items-center gap-1.5">
                                        {statusBadge}
                                        {isManual && (
                                            <span
                                                title="Status ini diatur secara manual oleh Admin."
                                                className="text-yellow-500 text-xs cursor-help"
                                            >
                                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                            </span>
                                        )}
                                    </span>
                                )
                            }
                        },
                    ]}
                />
            </div>

            <AnimatePresence mode="wait">
                {editKegiatanModal && (
                    <FormKegiatan
                        refresh={() => refreshTable()}
                        close={() => setEditKegiatanModal(false)}
                        isEdit={true}
                        data={tempRowData}
                    />
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
