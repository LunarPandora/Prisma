"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved, faCheck, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { getAuthorizationRequests, authorizeRequest } from "@/app/component/Libraries/api/authorization"
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date"

export default function AuthorizationQueue({ user }) {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)

    const isKetua = user?.role === "Ketua LPPM"

    useEffect(() => {
        if (!isKetua) return
        fetchRequests()
    }, [isKetua])

    async function fetchRequests() {
        try {
            setLoading(true)
            const res = await getAuthorizationRequests("status=Menunggu Persetujuan&per_page=20")
            setRequests(res.data?.data?.data || [])
        } catch (err) {
            console.error("Failed to fetch authorization requests:", err)
        } finally {
            setLoading(false)
        }
    }

    async function handleAuthorize(requestId, action, reason = "") {
        try {
            setProcessingId(requestId)
            await authorizeRequest(requestId, action, reason)
            await fetchRequests()
        } catch (err) {
            console.error("Failed to authorize:", err)
        } finally {
            setProcessingId(null)
        }
    }

    if (!isKetua || loading || requests.length === 0) return null

    const actionLabels = {
        delete: "Hapus",
        return: "Kembalikan",
        reject: "Tolak",
        return_diseminasi: "Kembalikan dari Diseminasi",
        return_seleksi: "Kembalikan dari Seleksi",
        reject_proposal: "Tolak Proposal",
        return_proposal_for_revision: "Kembalikan Proposal untuk Revisi",
        return_laporan_for_revision: "Kembalikan Laporan untuk Revisi",
    }

    return (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-amber-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-amber-900">Permintaan Otorisasi</h3>
                    <p className="text-sm text-amber-700">{requests.length} permintaan menunggu persetujuan Anda</p>
                </div>
            </div>
            <div className="divide-y divide-gray-100">
                {requests.map((req) => (
                    <div key={req.id} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                    {req.requester?.nama || "Staff LPPM"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatIndonesianDate(req.created_at)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                {actionLabels[req.action] || req.action}
                                {req.requestable_type && (
                                    <span className="text-gray-400 ml-1">
                                        ({req.requestable_type.split("\\").pop()})
                                    </span>
                                )}
                            </p>
                            {req.reason && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    Alasan: {req.reason}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => handleAuthorize(req.id, "reject", "Ditolak oleh Ketua LPPM")}
                                disabled={processingId === req.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Tolak"
                            >
                                {processingId === req.id ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                    <FontAwesomeIcon icon={faTimes} />
                                )}
                            </button>
                            <button
                                onClick={() => handleAuthorize(req.id, "approve")}
                                disabled={processingId === req.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Setujui"
                            >
                                {processingId === req.id ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                    <FontAwesomeIcon icon={faCheck} />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
