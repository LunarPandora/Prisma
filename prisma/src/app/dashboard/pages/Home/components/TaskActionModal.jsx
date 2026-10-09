"use client"

import { useState, useEffect, useRef, useReducer, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faRotateRight, faInbox } from "@fortawesome/free-solid-svg-icons"
import Modal from "@/app/component/Modal/Modal"
import Badge from "@/app/component/Display/Badge"

const STATUS_COLORS = {
    "menunggu review staff lppm": "yellow",
    "menunggu review admin": "blue",
    "menunggu penugasan reviewer": "orange",
    "menunggu bukti terima": "yellow",
    "menunggu konfirmasi admin": "blue",
    "menunggu pengembalian dana": "yellow",
    "menunggu konfirmasi penerimaan dana": "blue",
}

function getStatusColor(status) {
    if (!status) return "gray"
    return STATUS_COLORS[status.toLowerCase()] || "gray"
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Memuat data...</p>
        </div>
    )
}

function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-red-500">{message || "Gagal memuat data."}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                >
                    <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
                    Coba lagi
                </button>
            )}
        </div>
    )
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <FontAwesomeIcon icon={faInbox} className="text-3xl text-gray-300" />
            <p className="text-sm text-gray-400 text-center">
                {message || "Tidak ada data yang memerlukan tindakan saat ini."}
            </p>
        </div>
    )
}

export default function TaskActionModal({
    isOpen,
    onClose,
    title,
    subtitle,
    fetchRecords,
    columns,
    onRecordClick,
    emptyMessage,
    viewAllUrl,
    viewAllLabel = "Lihat Semua",
    items: staticItems,
}) {
    const router = useRouter()
    const perPage = 10

    const isStatic = Array.isArray(staticItems)

    const modalReducer = useCallback((state, action) => {
        switch (action.type) {
            case "OPEN_STATIC":
                return { ...state, records: action.items, loading: false, error: null, page: 1, hasMore: false }
            case "OPEN_FETCH":
                return { ...state, records: [], loading: true, error: null, page: 1, hasMore: false }
            case "CLOSE":
                return { records: [], loading: false, error: null, page: 1, hasMore: false }
            case "LOAD_SUCCESS":
                return {
                    ...state,
                    records: action.append ? [...state.records, ...action.items] : action.items,
                    loading: false,
                    hasMore: action.hasMore,
                }
            case "LOAD_ERROR":
                return { ...state, loading: false, error: action.error }
            case "LOAD_MORE":
                return { ...state, page: action.page }
            default:
                return state
        }
    }, [])

    const [modalState, dispatch] = useReducer(modalReducer, {
        records: [],
        loading: false,
        error: null,
        page: 1,
        hasMore: false,
    })

    const load = useCallback(async (pageNum = 1, append = false) => {
        if (isStatic) return
        dispatch({ type: append ? "LOAD_MORE" : "OPEN_FETCH", page: pageNum })
        try {
            const data = await fetchRecords(pageNum, perPage)
            const items = data?.data || data || []
            const total = data?.total ?? items.length
            dispatch({ type: "LOAD_SUCCESS", items, append, hasMore: pageNum * perPage < total })
        } catch (e) {
            dispatch({ type: "LOAD_ERROR", error: e?.message || "Gagal memuat data." })
        }
    }, [isStatic, fetchRecords, perPage])

    const prevIsOpenRef = useRef(isOpen)

    useEffect(() => {
        const prevIsOpen = prevIsOpenRef.current
        if (isOpen && !prevIsOpen) {
            if (isStatic) {
                dispatch({ type: "OPEN_STATIC", items: staticItems || [] })
            } else {
                load(1, false)
            }
        } else if (!isOpen && prevIsOpen) {
            dispatch({ type: "CLOSE" })
        }
        prevIsOpenRef.current = isOpen
    }, [isOpen, isStatic, staticItems, load])

    const handleLoadMore = () => {
        const next = modalState.page + 1
        load(next, true)
    }

    const handleViewAll = () => {
        onClose()
        router.push(viewAllUrl)
    }

    const handleRecordClick = (record) => {
        onClose()
        if (onRecordClick) onRecordClick(record)
    }

    const displayRecords = isStatic ? staticItems : modalState.records

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            maxWidth="max-w-2xl"
        >
            <div className="flex flex-col -mx-6 -my-4">
                {modalState.loading && displayRecords.length === 0 ? (
                    <LoadingState />
                ) : modalState.error && displayRecords.length === 0 ? (
                    <ErrorState message={modalState.error} onRetry={() => load(1, false)} />
                ) : displayRecords.length === 0 ? (
                    <EmptyState message={emptyMessage} />
                ) : (
                    <>
                        <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                            {displayRecords.map((record, i) => (
                                <div
                                    key={`${record.type || "item"}-${record.id || record.proposal_id || record.laporan_id || i}-${i}`}
                                    className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        {columns.map((col, ci) => (
                                            <div key={ci} className={ci === 0 ? "mb-0.5" : ""}>
                                                {ci === 0 ? (
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {col.render ? col.render(record) : record[col.key]}
                                                    </p>
                                                ) : ci === columns.length - 1 ? (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {col.render ? col.render(record) : (
                                                            <Badge color={getStatusColor(record.status)} size="xs">
                                                                {record.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500">
                                                        {col.render ? col.render(record) : record[col.key]}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleRecordClick(record)}
                                        className="flex-none text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                                    >
                                        Buka
                                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {modalState.hasMore && (
                            <div className="px-6 py-3 border-t border-gray-100">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={modalState.loading}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                                >
                                    {modalState.loading ? (
                                        <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    ) : null}
                                    Muat lebih banyak
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-400">
                                Menampilkan {displayRecords.length} data
                            </p>
                            {viewAllUrl && (
                                <button
                                    onClick={handleViewAll}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    {viewAllLabel}
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    )
}
