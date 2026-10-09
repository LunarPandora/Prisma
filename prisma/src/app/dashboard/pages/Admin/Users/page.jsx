"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import Alert from "@/app/component/Alert/Alert"
import CustomTable from "@/app/component/Table/CustomTable"
import LoadingBar from "@/app/component/AppLoader/LoadingBar"
import ContextMenu from "@/app/component/Context/ContextMenu"
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons"

import FormUser from "./UserForm"
import { deleteUsers, getUsers } from "@/app/component/Libraries/api/users"
import { createUserAdminMenus } from "@/app/component/Libraries/config/Users/UserAdminMenu"
import Badge from "@/app/component/Display/Badge"
import { USER_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"
import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"
import { useUserStore } from "@/app/stores/useUserStore"

export default function Users(){
    const [refreshKey, setRefreshKey] = useState(0)
    const [addUserModal, setAddUserModal] = useState(false)
    const [editUserModal, setEditUserModal] = useState(false)
    const [removeUserModal, setRemoveUserModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})

    const [loadingForm, setLoadingForm] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("users", user?.role)

    const { contextMenu, openMenu, closeMenu } = useContextMenu()
    const menus = createUserAdminMenus({
        user,
        access,
        handleAdd,
        handleEdit,
        handleRemove
    })

    function handleAdd(){
        setAddUserModal(true)
    }

    function handleEdit(r){
        setEditUserModal(true)
        setTempRowData(r)
    }

    function handleRemove(r){
        setRemoveUserModal(true)
        setTempRowData(r)
    }

    async function removeUser(){
        try{
            setLoadingForm(true)
            await deleteUsers(tempRowData.id)
            setLoadingForm(false)
        }
        catch(err){
            console.error(err)
        }
        finally{
            refreshTable()
            setRemoveUserModal(false)
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
                    <h1 className="text-4xl font-medium">Daftar Pengguna</h1>
                    <p className="text-lg text-gray-500 font-light">Berikut daftar pengguna yang terdaftar dalam sistem.</p>
                </div>
            </div>

            <CustomTable
                fetchMethod={getUsers}
                refreshKey={refreshKey}
                onContextRequest={(e, type, data, source) => openMenu(e, type, data, source)}
                onRefresh={refreshTable}
                    rowActions={[
                        { icon: faEdit, text: "Edit user", action: handleEdit, enabled: access.update },
                        { icon: faTrashCan, text: "Hapus user", action: handleRemove, enabled: access.delete, danger: true }
                    ]}
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
                    { header: "Email", key: "email" },
                    { header: "No. HP", key: "no_hp" },
                    { header: "Role", key: "role" },
                    { 
                        header: "Status", 
                        key: "status",
                        render: (value, row) => {
                            const isActive = value?.toLowerCase() === "aktif"

                            return (
                                <Badge color={isActive ? USER_STATUS_COLORS.aktif?.color : USER_STATUS_COLORS.default?.color} size="md" className="w-fit">
                                    {value}
                                </Badge>
                            )
                        }
                    }, 
                ]}
            />

            <AnimatePresence>
                {addUserModal && (
                    <FormUser
                        refresh={() => refreshTable()}
                        close={() => setAddUserModal(false)}
                        isEdit={false}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editUserModal && (
                    <FormUser
                        refresh={() => refreshTable()}
                        close={() => setEditUserModal(false)}
                        isEdit={true}
                        data={tempRowData}
                    />
                )}
            </AnimatePresence>            

            <AnimatePresence mode="wait">
                {removeUserModal && (
                    loadingForm ? 
                    (
                        <LoadingBar />
                    )
                    :
                    (
                        <Alert 
                            alertType="warning"
                            title="Hapus akun pengguna"
                            msg="Apakah anda yakin ingin menghapus data pengguna ini?" 
                            onCancel={() => setRemoveUserModal(false)} 
                            onAccept={() => removeUser()} 
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