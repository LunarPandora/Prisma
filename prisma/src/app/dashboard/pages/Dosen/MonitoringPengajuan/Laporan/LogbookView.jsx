"use client"

import { useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faPlus, faCalendarDays, faStickyNote, faFileLines, faEdit, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"

import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import Alert from "@/app/component/Alert/Alert"
import FileManager from "@/app/component/FileManager/FileManager"
import { getLogbook, addLogbook, deleteLogbook, getLaporanDocuments, replaceDocument } from "@/app/component/Libraries/api/logbook"
import { formatIndonesianDate, formatIndonesianRange } from "@/app/component/Libraries/utils/date"
import LogbookFormDosen from "./LogbookForm"

export default function LogbookViewDosen({
    close,
    data,
    refresh,
    readOnly = false
}) {
    const [logbooks, setLogbooks] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [editData, setEditData] = useState(null)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [tempRowData, setTempRowData] = useState({})
    const [loadingForm, setLoadingForm] = useState(false)

    const [documents, setDocuments] = useState(null)
    const [loadingDocId, setLoadingDocId] = useState(null)

    const fetchLogbooks = async () => {
        try {
            setLoading(true)

            const res = await getLogbook(1, {
                laporan_id: data?.laporan_id,
            })

            setLogbooks(res.data?.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchDocuments = async () => {
        try {
            const laporanId = data?.laporan_id
            if (!laporanId) return

            const res = await getLaporanDocuments(laporanId)
            setDocuments(res.data?.data || null)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (data?.laporan_id) {
            fetchLogbooks()
        }
    }, [data, refreshKey])

    useEffect(() => {
        if (data?.laporan_id) {
            fetchDocuments()
        }
    }, [data])

    const handleReplaceDocument = async (dokumenId, file, meta = null) => {
        try {
            setLoadingDocId(dokumenId || 'new')

            const formData = new FormData()
            if (dokumenId) {
                formData.append("dokumen_id", dokumenId)
            } else if (meta) {
                formData.append("documentable_type", meta.documentable_type)
                formData.append("documentable_id", meta.documentable_id)
                formData.append("jenis_dokumen", meta.jenis_dokumen)
            }
            formData.append("uploaded_file", file)

            await replaceDocument(formData)

            await fetchDocuments()
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingDocId(null)
        }
    }

    function handleDelete(row) {
        setTempRowData(row)
        setShowDeleteModal(true)
    }

    function handleEdit(row) {
        setEditData(row)
        setShowForm(true)
    }

    async function confirmDelete() {
        try {
            setLoadingForm(true)
            await deleteLogbook(tempRowData.logbook_id)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingForm(false)
            setShowDeleteModal(false)
            setRefreshKey(prev => prev + 1)
        }
    }

    return (
        <>
            <Modal
                isOpen={true}
                onClose={close}
                title="Logbook Progress"
                subtitle={`${logbooks.length} entri · ${documents ? "Dokumen tersedia" : "Memuat dokumen..."}`}
                maxWidth="max-w-5xl"
                closeOnBackdrop={false}
                footer={
                !readOnly ? (
                    <Button icon={faPlus} onClick={() => setShowForm(true)} size="sm">
                        Tambah Logbook
                    </Button>
                ) : null
            }
        >
                {/* REVISION NOTE FROM ADMIN */}
                {data?.status === "Revisi" && data?.catatan && (
                    <div className="border border-orange-300 bg-orange-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 text-sm" />
                            <p className="font-medium text-sm text-orange-700">Catatan Revisi dari Admin</p>
                        </div>
                        <div
                            className="prose prose-sm prose-orange max-w-none"
                            dangerouslySetInnerHTML={{ __html: data.catatan }}
                        />
                    </div>
                )}

                {/* LOGBOOK LIST */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400 text-sm" />
                        <p className="font-medium text-sm text-gray-700">Logbook Pengerjaan</p>
                    </div>

                    {logbooks.length === 0 ? (
                        <div className="border rounded-xl p-8 text-center text-gray-400 text-sm">
                            Belum ada logbook
                        </div>
                    ) : (
                        <div className="border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Judul</th>
                                        <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Tanggal</th>
                                        <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Deskripsi</th>
                                        <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Dokumen</th>
                                        {!readOnly && <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-20"></th>}
                                    </tr>
                                </thead>

                                <tbody>
                                    {logbooks.map((item) => (
                                        <tr key={item.logbook_id} className="border-t hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <span className="font-medium text-sm">{item.judul}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500 text-sm">
                                                {item.tgl_kegiatan ? formatIndonesianRange({ from: item.tgl_kegiatan, to: item.tgl_kegiatan_end || item.tgl_kegiatan }) : "-"}
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500 text-sm max-w-[200px]">
                                                <span className="line-clamp-2">{item.deskripsi}</span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {item.lampiran_drive_url ? (
                                                    <a
                                                        href={item.lampiran_drive_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline text-xs inline-flex items-center gap-1"
                                                    >
                                                        <FontAwesomeIcon icon={faFileLines} className="text-[10px]" />
                                                        Lihat file
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>
                                            {!readOnly && (
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => handleEdit(item)}
                                                            icon={faEdit}
                                                            size="sm"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => handleDelete(item)}
                                                            icon={faExclamationTriangle}
                                                            size="sm"
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* FILE MANAGER */}
                {documents && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFileLines} className="text-gray-400 text-sm" />
                            <p className="font-medium text-sm text-gray-700">Dokumen</p>
                        </div>
                        <FileManager
                            documents={documents}
                            onReplace={handleReplaceDocument}
                            loadingDocId={loadingDocId}
                        />
                    </div>
                )}

                {/* STACKED MODAL */}
                <AnimatePresence>
                    {showForm && (
                        <LogbookFormDosen
                            laporan={data}
                            editData={editData}
                            refresh={() => {
                                setRefreshKey(prev => prev + 1)
                                setEditData(null)
                            }}
                            close={() => {
                                setShowForm(false)
                                setEditData(null)
                            }}
                        />
                    )}
                </AnimatePresence>

            </Modal>

            {/* DELETE CONFIRMATION */}
            {showDeleteModal && (
                <Alert
                    alertType="danger"
                    title="Hapus Logbook"
                    msg="Apakah Anda yakin ingin menghapus logbook ini?"
                    onCancel={() => setShowDeleteModal(false)}
                    onAccept={() => { setShowDeleteModal(false); confirmDelete() }}
                    acceptText="Hapus"
                    isConfirmation={true}
                    withBackground={true}
                    loading={loadingForm}
                />
            )}
        </>
    )
}
