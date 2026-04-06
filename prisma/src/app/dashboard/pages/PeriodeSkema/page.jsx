"use client"

import { useState } from "react"
import { faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons"
import { motion, AnimatePresence } from "framer-motion"

import Alert from "@/app/component/Alert"
import ContextWindow from "@/app/component/Context/ContextWindow"
import ContextMenu from "@/app/component/Context/ContextMenu"
import Button from "@/app/component/Inputs/Button"

import Periode from "./Periode/periode"
import Skema from "./Skema/skema"

import FormPeriode from "./Periode/PeriodeForm"
import FormSkema from "./Skema/SkemaForm"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/lib/menu"

import { deleteSkema } from "@/app/lib/api/skema"
import { deletePeriode } from "@/app/lib/api/periode"

export default function PeriodeSkema(){
    const [active, setActive] = useState("periode")
    const [refreshKey, setRefreshKey] = useState(0)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')
    const [alertStatus, setAlertStatus] = useState('success')

    const [skemaModal, setSkemaModal] = useState(false)
    const [periodeModal, setPeriodeModal] = useState(false)

    const [modalType, setModalType] = useState('add')
    const [tempRowData, setTempRowData] = useState({})
    const [loadingForm, setLoadingForm] = useState(false)

    const [contextMenu, setContextMenu] = useState(null);
    const [tableContextMenu, setTableContextMenu] = useState(null);

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
            "text": active == 'periode' ? 'Tambahkan Periode Pengajuan Baru' : 'Tambahkan Skema Baru',
            "textColor": "text-gray-700",
            "action": () => active == 'periode' ? handlePeriodeEvent([], 'add') : handleSkemaEvent([], 'add'),
        },
    ]
    
    const user = useUserStore(state => state.user)
    const access = getModuleAccess("periodeskema", user?.role)

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    function handleSkemaEvent(r, type){
        setModalType(type)
        setSkemaModal(true)
        setTempRowData(r)
    }

    function handlePeriodeEvent(r, type){
        setModalType(type)
        setPeriodeModal(true)
        setTempRowData(r)
    }

    async function removeSkema(){
        try{
            setLoadingForm(true)
            const res = await deleteSkema(tempRowData.skema_id)
            setLoadingForm(false)

            if (res.data == 'Success!'){ 
                setAlertMsg('Sistem berhasil menghapus data skema!')
            }
            else {
                setAlertMsg('Sistem gagal menghapus data skema!')
            }
        }
        catch(err){
            setAlertMsg('Sistem gagal menghapus data skema dikarenakan error di sistem!')

            console.error(err)
        }
        finally{
            refreshTable()
            setSkemaModal(false)
            setShowAlert(true)
        }
    }

    async function removePeriode(){
        try{
            setLoadingForm(true)
            const res = await deletePeriode(tempRowData.periode_id)
            setLoadingForm(false)

            if (res.data == 'Success!'){ 
                setAlertMsg('Sistem berhasil menghapus data periode!')
            }
            else {
                setAlertMsg('Sistem gagal menghapus data periode!')
            }
        }
        catch(err){
            setAlertMsg('Sistem gagal menghapus data periode dikarenakan error di sistem!')

            console.error(err)
        }
        finally{
            refreshTable()
            setPeriodeModal(false)
            setShowAlert(true)
        }
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
                    <h1 className="text-4xl font-medium">Periode dan Skema Pengajuan</h1>
                    <p className="text-lg text-gray-500 font-light">Berikut jadwal pengajuan dan data mengenai periode dan skema yang ada.</p>
                </div>
            </div>

            <div className="flex flex-col w-full h-full">
                <div className="flex items-center rounded-t-lg overflow-hidden w-fit drop-shadow-lg">
                    <div onClick={() => setActive('periode')} className={`px-4 py-2 not-first:border-l border-l-gray-300 transition-colors duration-300 ease-in-out ${active == 'periode' ? 'bg-foreground text-background' : 'bg-white text-foreground hover:bg-gray-200'}`}>
                        Periode
                    </div>
                    <div onClick={() => setActive('skema')} className={`px-4 py-2 not-first:border-l border-l-gray-300 transition-colors duration-300 ease-in-out ${active == 'skema' ? 'bg-foreground text-background' : 'bg-white text-foreground hover:bg-gray-200'}`}>
                        Skema
                    </div>
                </div>
                
                { (active == 'periode' && access.create) && 
                    <Periode 
                        refreshKey={refreshKey}
                        onEdit={(r) => handlePeriodeEvent(r, 'edit')} 
                        onRemove={(r) => handlePeriodeEvent(r, 'delete')}
                        onRefresh={refreshTable}
                        contextListener={(ctx, ctxm) => {
                            setContextMenu(ctx)
                            setTableContextMenu(ctxm)
                        }}
                        rowContextListener={(e, row) => {
                            e.preventDefault();
                            e.stopPropagation();

                            setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                type: "row",
                                data: row,
                            });
                        }}
                    />
                }
                { (active == 'skema' && access.create) &&
                    <Skema
                        refreshKey={refreshKey}  
                        onEdit={(r) => handleSkemaEvent(r, 'edit')} 
                        onRemove={(r) => handleSkemaEvent(r, 'delete')}
                        onRefresh={refreshTable}
                        contextListener={(ctx, ctxm) => {
                            setContextMenu(ctx)
                            setTableContextMenu(ctxm)
                        }}
                        rowContextListener={(e, row) => {
                            e.preventDefault();
                            e.stopPropagation();

                            setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                type: "row",
                                data: row,
                            });
                        }}
                    />
                }
            </div>

            <AnimatePresence mode="wait">
                {skemaModal && (
                    modalType != 'delete' ? 
                        (
                            <FormSkema
                                refresh={() => refreshTable()}
                                close={() => setSkemaModal(false)}
                                isEdit={modalType == 'edit' ? true : false}
                                data={modalType == 'edit' ? tempRowData : null}
                                alertMsg={(msg) => setAlertMsg(msg)}
                                alertStatus={(stt) => setAlertStatus(stt)}
                                alertTrigger={() => setShowAlert(true)}
                            />
                        ) 
                        : 
                    loadingForm ? 
                        (
                            <LoadingBar />
                        )
                        :
                        (
                            <Alert 
                                title="Hapus skema"
                                msg="Apakah anda yakin ingin menghapus skema ini?" 
                                onCancel={() => setSkemaModal(false)} 
                                onAccept={() => removeSkema()}
                                acceptText="Hapus"
                                isConfirmation={true}
                            /> 
                        )        
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {periodeModal && (
                    modalType != 'delete' ? 
                        (
                            <FormPeriode
                                refresh={() => refreshTable()}
                                close={() => setPeriodeModal(false)}
                                isEdit={modalType == 'edit' ? true : false}
                                data={modalType == 'edit' ? tempRowData : null}
                                alertMsg={(msg) => setAlertMsg(msg)}
                                alertStatus={(stt) => setAlertStatus(stt)}
                                alertTrigger={() => setShowAlert(true)}
                            />
                        ) 
                        : 
                    loadingForm ? 
                        (
                            <LoadingBar />
                        )
                        :
                        (
                            <Alert 
                                title="Hapus periode pengajuan"
                                msg="Apakah anda yakin ingin menghapus periode pengajuan ini?" 
                                onCancel={() => setPeriodeModal(false)} 
                                onAccept={() => removePeriode()}
                                acceptText="Hapus"
                                isConfirmation={true}
                            /> 
                        )
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
                            ? tableContextMenu
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