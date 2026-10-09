"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"

import Alert from "@/app/component/Alert/Alert"
import ContextMenu from "@/app/component/Context/ContextMenu"
import CustomTable from "@/app/component/Table/CustomTable"
import LoadingBar from "@/app/component/AppLoader/LoadingBar"

import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { deletePublicationCategory, fetchPublicationCategory} from "@/app/component/Libraries/api/kategoripublikasi"
import { createKategoriPublikasiAdminMenus } from "@/app/component/Libraries/config/KategoriPublikasi/KategoriPublikasiAdminMenu"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"
import { useUserStore } from "@/app/stores/useUserStore"
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import KategoriPublikasiForm from "./KategoriPublikasiForm"

export default function KategoriPublikasi(){
    const [refreshKey, setRefreshKey] = useState(0)

    const [addKategoriModal, setAddKategoriModal] = useState(false)
    const [editKategoriModal, setEditKategoriModal] = useState(false)
    const [removeKategoriModal, setRemoveKategoriModal] = useState(false)

    const [tempRowData, setTempRowData] = useState({})
    const [loadingForm, setLoadingForm] = useState(false)

    const [loading, setLoading] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("pengaturan", user?.role)

    const {
        contextMenu,
        openMenu,
        closeMenu
    } = useContextMenu()

    const menus = createKategoriPublikasiAdminMenus({
        access,
        handleAdd,
        handleEdit,
        handleRemove
    })

    function handleAdd(){
        setAddKategoriModal(true)
    }

    function handleEdit(r){
        setEditKategoriModal(true)
        setTempRowData(r)
    }

    function handleRemove(r){
        setRemoveKategoriModal(true)
        setTempRowData(r)
    }

    function refreshTable(){
        setRefreshKey(prev => prev + 1)
    }

    async function removeKategori(){
        try{
            setLoading(true)

            await deletePublicationCategory(
                tempRowData.id
            )
        }
        catch(err){
            console.error(err)
        }
        finally{
            setLoading(false)
            setRemoveKategoriModal(false)
            refreshTable()
        }
    }

    return (
        <div
            className="flex flex-col gap-5"
            onContextMenu={(e) => openMenu(e)}
        >
            <CustomTable
                fetchMethod={fetchPublicationCategory}
                refreshKey={refreshKey}
                onContextRequest={(e, type, data, source) =>
                    openMenu(e, type, data, source)
                }
                rowActions={[
                    { icon: faEdit, text: "Edit kategori publikasi", action: handleEdit, enabled: access?.update },
                    { icon: faTrashCan, text: "Hapus kategori publikasi", action: handleRemove, enabled: access?.delete, danger: true }
                ]}
                onRefresh={refreshTable}
                columns={[
                    {
                        header: "Nama Kategori",
                        key: "nama"
                    },
                    {
                        header: "Peringkat",
                        key: "peringkat",
                        render: (value, row) => {
                            const arr = Array.isArray(value) ? value : typeof value === 'string' ? (() => { try { return JSON.parse(value) } catch { return [] } })() : []
                            return (
                                <div className="flex flex-col gap-1">
                                    { arr.join(', ') }
                                </div>
                            )
                        }
                    },
                ]}
            />

            <AnimatePresence>
                {addKategoriModal && (
                    <KategoriPublikasiForm
                        close={() => setAddKategoriModal(false)}
                        refresh={refreshTable}
                        isEdit={false}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editKategoriModal && (
                    <KategoriPublikasiForm
                        close={() => setEditKategoriModal(false)}
                        refresh={refreshTable}
                        isEdit
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {removeKategoriModal && (
                    loading
                    ? (
                        <LoadingBar />
                    )
                    : (
                        <Alert
                            alertType="warning"
                            title="Hapus kategori publikasi"
                            msg="Apakah Anda yakin ingin menghapus kategori publikasi ini?"
                            onCancel={() =>
                                setRemoveKategoriModal(false)
                            }
                            onAccept={removeKategori}
                            acceptText="Hapus"
                            isConfirmation
                        />
                    )
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