"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"

import Alert from "@/app/component/Alert/Alert"
import ContextMenu from "@/app/component/Context/ContextMenu"

import FormProdi from "./ProdiForm"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"

import { deleteProdi, getProdi } from "@/app/component/Libraries/api/prodi"
import { createProdiAdminMenus } from "@/app/component/Libraries/config/Prodi/ProdiAdminMenu"
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import CustomTable from "@/app/component/Table/CustomTable"
import Image from "next/image"
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons"

export default function Prodi(){
    const [refreshKey, setRefreshKey] = useState(0)

    const [addProdiModal, setAddProdiModal] = useState(false)
    const [editProdiModal, setEditProdiModal] = useState(false)
    const [removeProdiModal, setRemoveProdiModal] = useState(false)

    const [tempRowData, setTempRowData] = useState({})
    const [loadingForm, setLoadingForm] = useState(false)
    
    const user = useUserStore(state => state.user)
    const access = getModuleAccess("prodi", user?.role)

    const { contextMenu, openMenu, closeMenu } = useContextMenu()
    const menus = createProdiAdminMenus({
        access,
        handleAdd,
        handleEdit,
        handleDelete
    })

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    function handleAdd(r){
        setAddProdiModal(true)
    }

    function handleEdit(r){
        setEditProdiModal(true)
        setTempRowData(r)
    }

    function handleDelete(r){
        setRemoveProdiModal(true)
        setTempRowData(r)
    }

    async function removeProdi(){
        try{
            setLoadingForm(true)
            await deleteProdi(tempRowData.prodi_id)
            setLoadingForm(false)
        }
        catch(err){
            console.error(err)
        }
        finally{
            refreshTable()
            setRemoveProdiModal(false)
        }
    }

    return (
        <div 
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => openMenu(e)}
        >
            <div className="flex flex-col justify-between items-start gap-5">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Prodi</h1>
                    <p className="text-lg text-gray-500 font-light">Berikut data prodi yang tersedia.</p>
                </div>

                <CustomTable
                    fetchMethod={getProdi}
                    refreshKey={refreshKey}
                    className="w-full"
                    roundedStyle="rounded-lg rounded-tl-none"
                    onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                    onRefresh={refreshTable}
                    rowActions={[
                        { icon: faEdit, text: "Edit prodi", action: handleEdit, enabled: access.update },
                        { icon: faTrashCan, text: "Hapus prodi", action: handleDelete, enabled: access.delete, danger: true }
                    ]}
                    columns={[
                        { header: "Nama Prodi", key: "nama_prodi" },
                        { 
                            header: "Kaprodi", 
                            key: "kaprodi", 
                            render: (value, row) => {
                                if(value){
                                    return (
                                        <span className="flex items-center gap-2">
                                            <Image
                                                src={value.avatar_url}
                                                width={25}
                                                height={25}
                                                className="relative rounded-full"
                                                alt={value.nama || ""}
                                                unoptimized
                                            />

                                            {value.nama}
                                        </span>
                                    )
                                }
                                else{
                                    return (
                                        <p className="text-gray-400 italic text-xs">
                                            Belum ditentukan
                                        </p>
                                    )
                                }
                            }
                        },
                    ]}
                />
            </div>

            <AnimatePresence mode="wait">
                { addProdiModal &&  
                    <FormProdi
                        refresh={() => refreshTable()}
                        close={() => setAddProdiModal(false)}
                        isEdit={false}
                        data={tempRowData}
                    />
                }
            </AnimatePresence>

            <AnimatePresence mode="wait">
                { editProdiModal &&  
                    <FormProdi
                        refresh={() => refreshTable()}
                        close={() => setEditProdiModal(false)}
                        isEdit={true}
                        data={tempRowData}
                    />
                }
            </AnimatePresence>

            <AnimatePresence mode="wait">  
                { removeProdiModal &&       
                    <Alert 
                        alertType="warning"
                        title="Hapus prodi pengajuan"
                        msg="Apakah anda yakin ingin menghapus prodi ini?" 
                        onCancel={() => setRemoveProdiModal(false)} 
                        onAccept={() => removeProdi()}
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