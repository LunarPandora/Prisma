"use client"

import { useState } from "react"

import Button from "@/app/component/Inputs/Button"
import CustomTable from "@/app/component/Table/CustomTable"
import Modal from "@/app/component/Modal/Modal"
import { showToast } from "@/app/component/Toast/Toast"

import { api } from "@/app/component/Libraries/utils/api"
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date"

import { faCheck, faX } from "@fortawesome/free-solid-svg-icons"
import Badge from "@/app/component/Display/Badge"
import { KEGIATAN_EDIT_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"

const fetchKegiatanEditRequests = (query = '') => {
    const params = new URLSearchParams(query)
    params.set('status', 'Menunggu Otorisasi')
    return api.get(`/kegiatan-edit-request?${params.toString()}`)
}

export default function KetuaKegiatanEdit() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [processing, setProcessing] = useState(null)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [reviewNote, setReviewNote] = useState("")

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    async function handleAuthorize(action) {
        try {
            setProcessing(selectedRequest.id)
            const res = await api.post("/kegiatan-edit-request/authorize", {
                kegiatan_edit_request_id: selectedRequest.id,
                action: action,
                review_note: reviewNote || null
            })

            if (res.data.status === "success") {
                showToast(
                    action === "approve"
                        ? "Permintaan edit kegiatan berhasil disetujui."
                        : "Permintaan edit kegiatan berhasil ditolak.",
                    "success"
                )
            } else {
                showToast("Gagal memproses permintaan.", "error")
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Gagal memproses permintaan.", "error")
        } finally {
            setProcessing(null)
            setSelectedRequest(null)
            setReviewNote("")
            refreshTable()
        }
    }

    const columns = [
        {
            header: "Kode Kegiatan",
            key: "kegiatan",
            render: (value) => value?.kode || "-"
        },
        {
            header: "Judul",
            key: "kegiatan",
            render: (value) => (
                <div className="max-w-xs truncate">{value?.judul || "-"}</div>
            )
        },
        {
            header: "Diajukan Oleh",
            key: "requester",
            render: (value) => value?.nama || "-"
        },
        {
            header: "Tanggal Mulai Saat Ini",
            key: "current_tanggal_mulai",
            render: (value) => formatIndonesianDate(value)
        },
        {
            header: "Tanggal Mulai Baru",
            key: "proposed_tanggal_mulai",
            render: (value) => formatIndonesianDate(value)
        },
        {
            header: "Tanggal Berakhir Saat Ini",
            key: "current_tanggal_berakhir",
            render: (value) => formatIndonesianDate(value)
        },
        {
            header: "Tanggal Berakhir Baru",
            key: "proposed_tanggal_berakhir",
            render: (value) => formatIndonesianDate(value)
        },
        {
            header: "Alasan",
            key: "reason",
            render: (value) => (
                <div className="max-w-xs truncate">{value}</div>
            )
        },
        {
            header: "Status",
            key: "status",
            render: (value) => (
                <Badge
                    color={KEGIATAN_EDIT_STATUS_COLORS[value?.toLowerCase()]?.color || KEGIATAN_EDIT_STATUS_COLORS.default?.color || 'gray'}
                    size="sm"
                    className="w-fit"
                >
                    {value}
                </Badge>
            )
        }
    ]

    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">
                    Otorisasi Edit Kegiatan
                </h1>

                <p className="text-lg text-gray-500 font-light">
                    Setujui atau tolak permintaan edit kegiatan dari Staff.
                </p>
            </div>

            <CustomTable
                fetchMethod={(query) => fetchKegiatanEditRequests(query).then(res => res.data)}
                refreshKey={refreshKey}
                onRefresh={refreshTable}
                rowActions={[
                    {
                        icon: faCheck,
                        text: "Setujui",
                        action: (row) => setSelectedRequest({ ...row, action: "approve" }),
                        enabled: true
                    },
                    {
                        icon: faX,
                        text: "Tolak",
                        action: (row) => setSelectedRequest({ ...row, action: "reject" }),
                        enabled: true,
                        danger: true
                    }
                ]}
                columns={columns}
            />

            <Modal
                isOpen={!!selectedRequest}
                onClose={() => {
                    setSelectedRequest(null)
                    setReviewNote("")
                }}
                title={selectedRequest ? `${selectedRequest.action === "approve" ? "Setujui" : "Tolak"} Edit Kegiatan` : ""}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSelectedRequest(null)
                                setReviewNote("")
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={selectedRequest?.action === "approve" ? "primary" : "danger"}
                            onClick={() => handleAuthorize(selectedRequest?.action)}
                            disabled={processing === selectedRequest?.id}
                            icon={selectedRequest?.action === "approve" ? faCheck : faX}
                        >
                            {processing === selectedRequest?.id
                                ? "Memproses..."
                                : selectedRequest?.action === "approve" ? "Setujui" : "Tolak"}
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 mb-2">
                    Kode: {selectedRequest?.kegiatan?.kode}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    Alasan: {selectedRequest?.reason}
                </p>
                <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Catatan (opsional)..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                    rows={3}
                />
            </Modal>
        </div>
    )
}
