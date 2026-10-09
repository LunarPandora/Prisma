"use client"

import Image from "next/image"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"

import Alert from "@/app/component/Alert/Alert"
import CustomTable from "@/app/component/Table/CustomTable"
import LoadingBar from "@/app/component/AppLoader/LoadingBar"
import ContextMenu from "@/app/component/Context/ContextMenu"
import Button from "@/app/component/Inputs/Button"
import { faEdit, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { createKolaboratorAdminMenus } from "@/app/component/Libraries/config/Kolaborator/KolaboratorAdminMenu"
import { deleteKolaborator, fetchListKolaborator } from "@/app/component/Libraries/api/kolaborator"
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"
import { useUserStore } from "@/app/stores/useUserStore"

import FormKolaborator from "./KolaboratorForm"
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date"

export default function Kolaborator(){
    const [refreshKey, setRefreshKey] = useState(0)
    const [addKolaboratorModal, setAddKolaboratorModal] = useState(false)
    const [editKolaboratorModal, setEditKolaboratorModal] = useState(false)
    const [removeKolaboratorModal, setRemoveKolaboratorModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})

    const [loadingForm, setLoadingForm] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("kolaborator", user?.role)

    const { contextMenu, openMenu, closeMenu } = useContextMenu()
    const menus = createKolaboratorAdminMenus({
        user,
        access,
        handleAdd,
        handleEdit,
        handleRemove
    })

    function handleAdd(){
        setAddKolaboratorModal(true)
    }

    function handleEdit(r){
        setEditKolaboratorModal(true)
        setTempRowData(r)
    }

    function handleRemove(r){
        setRemoveKolaboratorModal(true)
        setTempRowData(r)
    }

    async function removeKolaborator(){
        try{
            setLoadingForm(true)
            await deleteKolaborator(tempRowData.kolab_id)
            setLoadingForm(false)
        }
        catch(err){
            console.error(err)
        }
        finally{
            refreshTable()
            setRemoveKolaboratorModal(false)
        }
    }

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div 
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => openMenu(e)}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Daftar Kolaborator</h1>
                    <p className="text-lg text-gray-500 font-light">Berikut daftar kolaborator yang terdaftar dalam sistem.</p>
                </div>
            </div>

            <CustomTable
                fetchMethod={fetchListKolaborator}
                refreshKey={refreshKey}
                onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                onRefresh={refreshTable}
                    rowActions={[
                        { icon: faEdit, text: "Edit kolaborator", action: handleEdit, enabled: access.update },
                        { icon: faTrashCan, text: "Hapus kolaborator", action: handleRemove, enabled: access.delete, danger: true }
                    ]}
                headerRight={
                    access.create && (
                        <Button onClick={handleAdd} icon={faPlus}>
                            Tambahkan Kolaborator Baru
                        </Button>
                    )
                }
                columns={[
                    {
                        header: "Nama", 
                        key: "nama",
                        render: (value, row) => {
                            return (
                                <span className="flex items-center gap-2">
                                    <Image
                                        src={row.avatar || "/img/user_placeholder.webp"}
                                        alt={value || ""}
                                        width={25}
                                        height={25}
                                        className="relative rounded-full"
                                        unoptimized
                                        onError={(e) => {
                                            e.currentTarget.src = "/img/user_placeholder.webp"
                                        }}
                                    />
                                    {value}
                                </span>
                            )
                        }
                    },
                    { header: "NIDN", key: "nidn" },
                    { header: "NUPTK", key: "nuptk" },
                    { header: "Prodi", key: "prodi" },
                    { header: "Asal Institusi", key: "institusi" },
                    { header: "Email", key: "email" },
                ]}
            />

            <AnimatePresence>
                {addKolaboratorModal && (
                    <FormKolaborator
                        refresh={() => refreshTable()}
                        close={() => setAddKolaboratorModal(false)}
                        isEdit={false}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editKolaboratorModal && (
                    <FormKolaborator
                        refresh={() => refreshTable()}
                        close={() => setEditKolaboratorModal(false)}
                        isEdit={true}
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>            

            <AnimatePresence mode="wait">
                {removeKolaboratorModal && (
                    loadingForm ? 
                    (
                        <LoadingBar />
                    )
                    :
                    (
                        <Alert 
                            alertType="warning"
                            title="Hapus data kolaborator"
                            msg="Apakah anda yakin ingin menghapus data kolaborator ini?" 
                            onCancel={() => setRemoveKolaboratorModal(false)} 
                            onAccept={() => removeKolaborator()} 
                            acceptText="Hapus"
                            isConfirmation={true}
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