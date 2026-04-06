"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { faPlus, faEdit, faTrashCan, faRefresh } from '@fortawesome/free-solid-svg-icons'

import Alert from "@/app/component/Alert"
import CustomTable from "@/app/component/CustomTable"
import LoadingBar from "@/app/component/LoadingBar"
import ContextMenu from "@/app/component/Context/ContextMenu"
import ContextWindow from "@/app/component/Context/ContextWindow"

import FormUser from "./UserForm"
import { deleteUsers, getUsers } from "@/app/lib/api/users"

export default function Users(){
    const [refreshKey, setRefreshKey] = useState(0)
    const [addUserModal, setAddUserModal] = useState(false)
    const [editUserModal, setEditUserModal] = useState(false)
    const [removeUserModal, setRemoveUserModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})

    const [showAlert, setShowAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')
    const [alertStatus, setAlertStatus] = useState('success')
    const [loadingForm, setLoadingForm] = useState(false)

    const [contextMenu, setContextMenu] = useState(null);

    const mainContextMenu = [
        {
            "icon": faRefresh,
            "iconColor": "text-gray-700",
            "text": "Refresh Tabel",
            "textColor": "text-gray-700",
            "action": () => refreshTable()
        },
        {
            "icon": faPlus,
            "iconColor": "text-gray-700",
            "text": "Tambahkan pengguna baru",
            "textColor": "text-gray-700",
            "action": () => setAddUserModal(true)
        },
    ]

    const userContextMenu = [
        {
            "icon": faRefresh,
            "iconColor": "text-gray-700",
            "text": "Refresh Tabel",
            "textColor": "text-gray-700",
            "action": () => refreshTable()
        },
        {
            "icon": faEdit,
            "iconColor": "text-gray-700",
            "text": "Edit pengguna",
            "textColor": "text-gray-700",
            "action": (r) => handleEdit(r)
        },
        {
            "icon": faTrashCan,
            "iconColor": "text-red-500",
            "text": "Hapus pengguna",
            "textColor": "text-red-500",
            "action": (r) => handleRemove(r)
        },
    ]

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
            const res = await deleteUsers(tempRowData.id)
            setLoadingForm(false)

            if (res.data.status == 'success'){ 
                setAlertMsg('Sistem berhasil menonaktifkan data pengguna!')
                setAlertStatus('success')
            }
            else {
                setAlertMsg('Sistem gagal menonaktifkan data pengguna!')
                setAlertStatus('danger')
            }
        }
        catch(err){
            setAlertMsg('Sistem gagal menonaktifkan data pengguna dikarenakan error di sistem!')
            setAlertStatus('danger')

            console.error(err)
        }
        finally{
            refreshTable()
            setRemoveUserModal(false)
            setShowAlert(true)
        }
    }

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div 
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => {
                e.preventDefault();

                setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    type: "main",
                    data: null,
                });
            }}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Daftar Pengguna</h1>
                    <p className="text-lg text-gray-500 font-light">Berikut daftar pengguna yang terdaftar dalam sistem.</p>
                </div>
            </div>

            <CustomTable
                fetchMethod={getUsers}
                isEditable={true}
                isRemovable={true}
                refreshKey={refreshKey}
                context={userContextMenu}
                onContextRequest={(ctx) => setContextMenu(ctx)}
                onRowContext={(e, row) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        type: "row",
                        data: row,
                    });
                }}
                columns={[
                    { header: "Nama", key: "nama" },
                    { header: "Email", key: "email" },
                    { header: "Role", key: "role" },
                    { 
                        header: "Status", 
                        key: "status",
                        render: (value, row) => {
                            const isActive = value?.toLowerCase() === "aktif"

                            return (
                                <span
                                    className={`${
                                    isActive
                                        ? "text-green-600 bg-green-100 border-green-500"
                                        : "text-red-600 bg-red-100 border-red-500"
                                    } text-sm px-2 py-1 border rounded`}
                                >
                                    {value}
                                </span>
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
                        alertMsg={(msg) => setAlertMsg(msg)}
                        alertStatus={(stt) => setAlertStatus(stt)}
                        alertTrigger={() => setShowAlert(true)}
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
                        alertMsg={(msg) => setAlertMsg(msg)}
                        alertStatus={(stt) => setAlertStatus(stt)}
                        alertTrigger={() => setShowAlert(true)}
                    />
                )}
            </AnimatePresence>            

            <AnimatePresence mode="wait">
                {removeUserModal && (
                    <motion.div
                        key="removeModal"
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >
                        {loadingForm ? 
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
                        }
                    </motion.div>
                )}
            </AnimatePresence>

            { showAlert && 
                <Alert 
                    msg={alertMsg} 
                    onCancel={() => setShowAlert(false)} 
                    alertType={alertStatus}
                /> 
            }

            <AnimatePresence>
                {contextMenu && (
                    <ContextWindow
                        position={{ x: contextMenu.x, y: contextMenu.y }}
                        onClose={() => setContextMenu(null)}
                    >
                        {(contextMenu.type === "row"
                            ? userContextMenu
                            : mainContextMenu
                        ).map((menu, i) => (
                            <ContextMenu
                                key={i}
                                icon={menu.icon}
                                iconColor={menu.iconColor}
                                textColor={menu.textColor}
                                onClicked={() => {
                                    menu.action(contextMenu.data);
                                    setContextMenu(null);
                                }}
                            >
                                {menu.text}
                            </ContextMenu>
                        ))}
                    </ContextWindow>
                )}
            </AnimatePresence>
        </div>
    )
}