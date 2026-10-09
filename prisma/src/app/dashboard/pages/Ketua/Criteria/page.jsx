"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"

import Button from "@/app/component/Inputs/Button"
import MultiKriteriaEditor from "@/app/component/Inputs/MultiKriteriaEditor"
import MultiQuestionEditor from "@/app/component/Inputs/MultiQuestionEditor"
import TextInput from "@/app/component/Inputs/TextInput"
import Alert from "@/app/component/Alert/Alert"
import ContextMenu from "@/app/component/Context/ContextMenu"
import CustomTable from "@/app/component/Table/CustomTable"
import LoadingBar from "@/app/component/AppLoader/LoadingBar"
import KategoriPublikasiForm from "@/app/dashboard/pages/Admin/Pengaturan/KategoriPublikasi/KategoriPublikasiForm"

import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { deletePublicationCategory, fetchPublicationCategory } from "@/app/component/Libraries/api/kategoripublikasi"
import { createKategoriPublikasiAdminMenus } from "@/app/component/Libraries/config/KategoriPublikasi/KategoriPublikasiAdminMenu"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"
import { useUserStore } from "@/app/stores/useUserStore"

import { api } from "@/app/component/Libraries/utils/api"

import {
    faSave,
    faClipboardList,
    faBook,
    faPlus,
    faEdit,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons"

export default function KetuaCriteria() {
    const tabs = [
        { label: "Kriteria Penilaian", value: "kriteria" },
        { label: "Kategori Publikasi", value: "kategori" }
    ]

    const [activeTab, setActiveTab] = useState("kriteria")

    // Kriteria state
    const [kriteria, setKriteria] = useState([])
    const [kesesuaianTema, setKesesuaianTema] = useState([])
    const [kriteriaValidation, setKriteriaValidation] = useState({
        valid: false,
        totalBobot: 0,
        hasEmptyFields: false
    })
    const [kriteriaLoading, setKriteriaLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const kriteriaOriginalRef = useRef([])
    const kesesuaianTemaOriginalRef = useRef([])
    const kriteriaDirty = JSON.stringify(kriteria) !== JSON.stringify(kriteriaOriginalRef.current)
    const kesesuaianTemaDirty = JSON.stringify(kesesuaianTema) !== JSON.stringify(kesesuaianTemaOriginalRef.current)

    // Kategori state
    const [refreshKey, setRefreshKey] = useState(0)
    const [addKategoriModal, setAddKategoriModal] = useState(false)
    const [editKategoriModal, setEditKategoriModal] = useState(false)
    const [removeKategoriModal, setRemoveKategoriModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})
    const [kategoriLoading, setKategoriLoading] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState("")
    const [alertStatus, setAlertStatus] = useState("success")

    const {
        contextMenu,
        openMenu,
        closeMenu
    } = useContextMenu()

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("ketuacriteria", user?.role)

    const menus = createKategoriPublikasiAdminMenus({
        access,
        handleAdd,
        handleEdit,
        handleRemove
    })

    // Kriteria functions
    async function fetchCriteria() {
        try {
            setKriteriaLoading(true)
            const response = await api.get("/criteria")
            const kriteriaData = Array.isArray(response.data.data.kriteria_penilaian) ? response.data.data.kriteria_penilaian : []
            const temaData = Array.isArray(response.data.data.list_kesesuaian_tema) ? response.data.data.list_kesesuaian_tema : []
            setKriteria(kriteriaData)
            setKesesuaianTema(temaData)
            kriteriaOriginalRef.current = JSON.parse(JSON.stringify(kriteriaData))
            kesesuaianTemaOriginalRef.current = JSON.parse(JSON.stringify(temaData))
        } catch (error) {
            setAlertStatus("danger")
            setAlertMsg("Gagal memuat kriteria penilaian.")
            setShowAlert(true)
        } finally {
            setKriteriaLoading(false)
        }
    }

    async function saveKriteria() {
        try {
            setSaving(true)
            await api.post("/criteria/kriteria-penilaian", {
                kriteria_penilaian: JSON.stringify(kriteria)
            })
            kriteriaOriginalRef.current = JSON.parse(JSON.stringify(kriteria))
            setAlertStatus("success")
            setAlertMsg("Kriteria penilaian berhasil disimpan.")
            setShowAlert(true)
        } catch (error) {
            setAlertStatus("danger")
            setAlertMsg("Gagal menyimpan kriteria penilaian.")
            setShowAlert(true)
        } finally {
            setSaving(false)
        }
    }

    async function saveKesesuaianTema() {
        try {
            setSaving(true)
            await api.post("/criteria/kesesuaian-tema", {
                list_kesesuaian_tema: JSON.stringify(kesesuaianTema)
            })
            kesesuaianTemaOriginalRef.current = JSON.parse(JSON.stringify(kesesuaianTema))
            setAlertStatus("success")
            setAlertMsg("Kriteria kesesuaian tema berhasil disimpan.")
            setShowAlert(true)
        } catch (error) {
            setAlertStatus("danger")
            setAlertMsg("Gagal menyimpan kriteria kesesuaian tema.")
            setShowAlert(true)
        } finally {
            setSaving(false)
        }
    }

    // Kategori functions
    function handleAdd() {
        setAddKategoriModal(true)
    }

    function handleEdit(r) {
        setEditKategoriModal(true)
        setTempRowData(r)
    }

    function handleRemove(r) {
        setRemoveKategoriModal(true)
        setTempRowData(r)
    }

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    async function removeKategori() {
        try {
            setKategoriLoading(true)
            const res = await deletePublicationCategory(tempRowData.id)

            if (res.data.status === "success") {
                setAlertStatus("success")
                setAlertMsg("Kategori publikasi berhasil dihapus.")
            } else {
                setAlertStatus("danger")
                setAlertMsg("Gagal menghapus kategori publikasi.")
            }
        } catch (err) {
            setAlertStatus("danger")
            setAlertMsg("Gagal menghapus kategori publikasi.")
        } finally {
            setKategoriLoading(false)
            setRemoveKategoriModal(false)
            refreshTable()
            setShowAlert(true)
        }
    }

    useEffect(() => {
        fetchCriteria()
    }, [])

    const hasEmptyTema = Array.isArray(kesesuaianTema) && kesesuaianTema.some(item => !item.question?.trim())

    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">Pengaturan Kriteria</h1>
                <p className="text-lg text-gray-500 font-light">
                    Kelola kriteria penilaian, kesesuaian tema, dan kategori publikasi.
                </p>
            </div>

            <div className="flex border-b border-gray-200 w-full overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={
                            "px-4 py-2 text-sm whitespace-nowrap transition-colors " +
                            (activeTab === tab.value
                                ? "border-b-2 border-primary text-primary font-medium"
                                : "text-gray-500 hover:text-gray-800")
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "kriteria" && (
                <div className="flex flex-col gap-5">
                    {kriteriaLoading ? (
                        <LoadingBar />
                    ) : (
                        <>
                            <div className="flex flex-col gap-y-2 w-full rounded-lg p-5 bg-white border border-gray-200">
                                <span className="text-gray-800 text-base font-medium">
                                    Kriteria Penilaian
                                </span>
                                <p className="text-sm text-gray-500">
                                    Tentukan kriteria, indikator, dan bobot penilaian proposal. Total bobot harus tepat 100.
                                </p>

                                <MultiKriteriaEditor
                                    className="pt-2"
                                    name="kriteria_penilaian"
                                    value={kriteria}
                                    onChange={(e) => setKriteria(e.target ? e.target.value : e)}
                                    onValidationChange={setKriteriaValidation}
                                    placeholder="Tentukan kriteria penilaian"
                                />

                                <div className="mt-1">
                                    <Button
                                        onClick={saveKriteria}
                                        disabled={!kriteriaDirty || !kriteriaValidation.valid || kriteriaValidation.hasEmptyFields || saving}
                                        icon={faSave}
                                        variant={kriteriaDirty ? "primary" : "ghost"}
                                    >
                                        {saving ? "Menyimpan..." : kriteriaDirty ? "Simpan Perubahan" : "Tersimpan"}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-2 w-full rounded-lg p-5 bg-white border border-gray-200">
                                <span className="text-gray-800 text-base font-medium">
                                    Kriteria Kesesuaian Tema
                                </span>
                                <p className="text-sm text-gray-500">
                                    Daftar pertanyaan untuk menilai kesesuaian tema proposal dengan kebutuhan lembaga.
                                </p>

                                <MultiQuestionEditor
                                    className="pt-2"
                                    name="list_kesesuaian_tema"
                                    value={kesesuaianTema}
                                    onChange={(e) => setKesesuaianTema(e.target ? e.target.value : e)}
                                    placeholder="Tentukan kriteria kesesuaian tema"
                                />

                                <div className="mt-1">
                                    <Button
                                        onClick={saveKesesuaianTema}
                                        disabled={!kesesuaianTemaDirty || hasEmptyTema || saving}
                                        icon={faSave}
                                        variant={kesesuaianTemaDirty ? "primary" : "ghost"}
                                    >
                                        {saving ? "Menyimpan..." : kesesuaianTemaDirty ? "Simpan Perubahan" : "Tersimpan"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === "kategori" && (
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
                        onRefresh={refreshTable}
                        rowActions={[
                            { icon: faEdit, text: "Edit", action: handleEdit, enabled: access.update },
                            { icon: faTrashCan, text: "Hapus", action: handleRemove, enabled: access.delete, danger: true }
                        ]}
                        headerRight={
                            <Button onClick={handleAdd} icon={faPlus}>
                                Tambah Kategori Publikasi
                            </Button>
                        }
                        columns={[
                            {
                                header: "Nama Kategori",
                                key: "nama"
                            },
                            {
                                header: "Peringkat",
                                key: "peringkat",
                                render: (value) => {
                                    const arr = Array.isArray(value) ? value : typeof value === 'string' ? (() => { try { return JSON.parse(value) } catch { return [] } })() : []
                                    return (
                                        <div className="flex flex-col gap-1">
                                            {arr.join(', ')}
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
                            kategoriLoading
                            ? (
                                <LoadingBar />
                            )
                            : (
                                <Alert
                                    alertType="warning"
                                    title="Hapus kategori publikasi"
                                    msg="Apakah Anda yakin ingin menghapus kategori publikasi ini?"
                                    onCancel={() => setRemoveKategoriModal(false)}
                                    onAccept={removeKategori}
                                    acceptText="Hapus"
                                    isConfirmation
                                />
                            )
                        )}
                    </AnimatePresence>
                </div>
            )}

            {showAlert && (
                <Alert
                    msg={alertMsg}
                    alertType={alertStatus}
                    onCancel={() => setShowAlert(false)}
                />
            )}

            <ContextMenu
                contextMenu={contextMenu}
                closeMenu={closeMenu}
                menus={menus}
            />
        </div>
    )
}
