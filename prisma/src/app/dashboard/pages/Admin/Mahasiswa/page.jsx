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

import { createMahasiswaAdminMenus } from "@/app/component/Libraries/config/Mahasiswa/MahasiswaAdminMenu"
import { deleteMahasiswa, fetchMahasiswa } from "@/app/component/Libraries/api/mahasiswa"
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"
import { useUserStore } from "@/app/stores/useUserStore"

import FormMahasiswa from "./MahasiswaForm"
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date"

export default function Mahasiswa(){
    const [refreshKey, setRefreshKey] = useState(0)
    const [addMahasiswaModal, setAddMahasiswaModal] = useState(false)
    const [editMahasiswaModal, setEditMahasiswaModal] = useState(false)
    const [removeMahasiswaModal, setRemoveMahasiswaModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})

    const [loadingForm, setLoadingForm] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("mahasiswa", user?.role)

    const { contextMenu, openMenu, closeMenu } = useContextMenu()
    const menus = createMahasiswaAdminMenus({
        user,
        access,
        handleAdd,
        handleEdit,
        handleRemove
    })

    function handleAdd(){
        setAddMahasiswaModal(true)
    }

    function handleEdit(r){
        setEditMahasiswaModal(true)
        setTempRowData(r)
    }

    function handleRemove(r){
        setRemoveMahasiswaModal(true)
        setTempRowData(r)
    }

    async function removeMahasiswa(){
        try{
            setLoadingForm(true)
            await deleteMahasiswa(tempRowData.mhswa_id)
            setLoadingForm(false)
        }
        catch(err){
            console.error(err)
        }
        finally{
            refreshTable()
            setRemoveMahasiswaModal(false)
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
                    <h1 className="text-4xl font-medium">Daftar Mahasiswa</h1>
                    <p className="text-lg text-gray-500 font-light">Berikut daftar mahasiswa yang terdaftar dalam sistem.</p>
                </div>
            </div>

            <CustomTable
                fetchMethod={fetchMahasiswa}
                refreshKey={refreshKey}
                onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                maxActions={2}
                onRefresh={refreshTable}
                rowActions={[
                    { icon: faEdit, text: "Edit", action: handleEdit, enabled: access.update },
                    { icon: faTrashCan, text: "Hapus", action: handleRemove, enabled: access.delete, danger: true }
                ]}
                headerRight={
                    access.create && (
                        <Button onClick={handleAdd} icon={faPlus}>
                            Tambahkan Mahasiswa Baru
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
                                        src={`${row.avatar}`}
                                        width={25}
                                        height={25}
                                        className="relative rounded-full"
                                        unoptimized
                                    />
                                    {value}
                                </span>
                            )
                        }
                    },
                    { header: "NIM", key: "nim" },
                    { header: "Email", key: "email" },
                    { header: "No. HP", key: "no_hp" },
                    { header: "Prodi", key: "nama_prodi" },
                ]}
            />

            <AnimatePresence>
                {addMahasiswaModal && (
                    <FormMahasiswa
                        refresh={() => refreshTable()}
                        close={() => setAddMahasiswaModal(false)}
                        isEdit={false}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editMahasiswaModal && (
                    <FormMahasiswa
                        refresh={() => refreshTable()}
                        close={() => setEditMahasiswaModal(false)}
                        isEdit={true}
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>            

            <AnimatePresence mode="wait">
                {removeMahasiswaModal && (
                    loadingForm ? 
                    (
                        <LoadingBar />
                    )
                    :
                    (
                        <Alert 
                            alertType="warning"
                            title="Hapus data mahasiswa"
                            msg="Apakah anda yakin ingin menghapus data mahasiswa ini?" 
                            onCancel={() => setRemoveMahasiswaModal(false)} 
                            onAccept={() => removeMahasiswa()} 
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