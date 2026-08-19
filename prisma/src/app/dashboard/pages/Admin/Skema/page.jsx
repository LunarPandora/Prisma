"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faSpinner, faCircleExclamation, faPlus, faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { motion, AnimatePresence } from "framer-motion"

import Alert from "@/app/component/Alert/Alert"
import ContextMenu from "@/app/component/Context/ContextMenu"
import Button from "@/app/component/Inputs/Button"

import FormSkema from "./SkemaForm"
import Badge from "@/app/component/Display/Badge"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"

import { deleteSkema, getSkema } from "@/app/component/Libraries/api/skema"
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"

import { createSkemaAdminMenus } from "@/app/component/Libraries/config/Skema/skemaAdminMenu"
import { SKEMA_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"
import Kegiatan from "./Kegiatan/page"

export default function Skema() {
    const [selectedSkema, setSelectedSkema] = useState(null)

    if (selectedSkema) {
        return (
            <Kegiatan
                skema={selectedSkema}
                onBack={() => setSelectedSkema(null)}
            />
        )
    }

    return (
        <SkemaView
            onSelectSkema={(row) => setSelectedSkema(row)}
        />
    )
}

function SkemaView({ onSelectSkema }){
    const [skemaList, setSkemaList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState("")

    const [addSkemaModal, setAddSkemaModal] = useState(false)
    const [editSkemaModal, setEditSkemaModal] = useState(false)
    const [removeSkemaModal, setRemoveSkemaModal] = useState(false)

    const [tempRowData, setTempRowData] = useState({})
    const [loadingForm, setLoadingForm] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("ketuaskema", user?.role)

    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    const menus = createSkemaAdminMenus({
        access,
        handleAdd,
        handleEdit,
        handleDelete,
    })

    async function fetchSkema() {
        try {
            setLoading(true)
            setError(false)
            const res = await getSkema()
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

    function refreshTable(){
        fetchSkema()
    }

    function handleAdd(){
        setAddSkemaModal(true)
    }

    function handleEdit(row){
        setTempRowData(row)
        setEditSkemaModal(true)
    }

    function handleDelete(row){
        setTempRowData(row)
        setRemoveSkemaModal(true)
    }

    async function removeSkema(){
        try{
            setLoadingForm(true)

            const formData = new FormData()
            formData.append('skema_id', tempRowData.skema_id)

            await deleteSkema(formData)
        }
        catch(err){
            console.error(err)
        }
        finally{
            setLoadingForm(false)
            refreshTable()
            setRemoveSkemaModal(false)
        }
    }

    const filtered = skemaList.filter(s =>
        s.nama_skema?.toLowerCase().includes(search.toLowerCase()) ||
        s.tahun_ajaran?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => openMenu(e)}
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">
                    Skema Penelitian
                </h1>

                <p className="text-lg text-gray-500 font-light">
                    Kelola skema penelitian dan PkM yang tersedia.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
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

                {access.create && (
                    <Button onClick={handleAdd} icon={faPlus}>
                        Tambah Skema
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 p-12">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-gray-400" />
                    <span className="text-gray-500">Memuat data skema...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-2 p-12">
                    <FontAwesomeIcon icon={faCircleExclamation} className="text-4xl text-red-400" />
                    <span className="text-gray-500">Gagal memuat data skema</span>
                    <button
                        onClick={fetchSkema}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Coba lagi
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-12">
                    <span className="text-gray-500">
                        {search ? "Tidak ditemukan skema yang cocok" : "Tidak ada data skema"}
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((skema, i) => (
                        <motion.div
                            key={skema.skema_id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.04 }}
                            className="
                                bg-white rounded-lg border border-gray-200 shadow-sm
                                p-5 flex flex-col gap-3 text-left
                                hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30
                                transition-all duration-200 cursor-pointer
                                group
                            "
                            onClick={() => onSelectSkema(skema)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-base font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {skema.nama_skema}
                                </h3>
                                <Badge color={SKEMA_STATUS_COLORS[skema.status]?.color || 'gray'} size="sm" className="whitespace-nowrap">
                                    {skema.status}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{skema.tahun_ajaran}</span>
                                <span className="text-gray-300">|</span>
                                <span>{skema.kegiatan?.length ?? 0} Kegiatan</span>
                            </div>

                            {(access.update || access.delete) && (
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
                                    {access.update && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleEdit(skema)
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 hover:text-blue-600 text-xs font-medium transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                            <span>Edit</span>
                                        </button>
                                    )}
                                    {access.delete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(skema)
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-red-50 hover:border-red-300 text-gray-600 hover:text-red-600 text-xs font-medium transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faTrashCan} />
                                            <span>Hapus</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {
                    addSkemaModal &&
                    <FormSkema
                        refresh={refreshTable}
                        close={() => setAddSkemaModal(false)}
                        isEdit={false}
                        data={{}}
                    />
                }
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {
                    editSkemaModal &&
                    <FormSkema
                        refresh={refreshTable}
                        close={() => setEditSkemaModal(false)}
                        isEdit={true}
                        data={tempRowData}
                    />
                }
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {
                    removeSkemaModal &&
                    <Alert
                        alertType="warning"
                        title="Hapus Skema"
                        msg="Apakah anda yakin ingin menghapus skema ini?"
                        onCancel={() => setRemoveSkemaModal(false)}
                        onAccept={removeSkema}
                        acceptText="Hapus"
                        isConfirmation={true}
                        withBackground={true}
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
