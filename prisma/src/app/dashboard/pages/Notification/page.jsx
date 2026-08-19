"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBell,
    faCheck,
    faCheckDouble,
    faCircleExclamation,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons"

import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "@/app/component/Libraries/api/notifications"
import { useNotificationStore } from "@/app/stores/useNotificationStore"

function timeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return "Baru saja"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} menit yang lalu`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} jam yang lalu`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Kemarin"
    if (days < 7) return `${days} hari yang lalu`
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateGroup(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((today - target) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hari ini"
    if (diffDays === 1) return "Kemarin"
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function groupNotifications(notifications) {
    const groups = []
    let currentGroup = null

    for (const n of notifications) {
        const label = formatDateGroup(n.created_at)
        if (!currentGroup || currentGroup.label !== label) {
            currentGroup = { label, items: [] }
            groups.push(currentGroup)
        }
        currentGroup.items.push(n)
    }

    return groups
}

const PER_PAGE = 20

export default function NotificationHistory() {
    const router = useRouter()
    const {
        markItemAsRead,
        markAllItemsAsRead,
        setCount,
    } = useNotificationStore()

    const [notifications, setNotifications] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [filter, setFilter] = useState("all")

    const fetchNotifications = useCallback(async (pageNum, append = false) => {
        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }
        try {
            const query = `page=${pageNum}&per_page=${PER_PAGE}${filter !== "all" ? `&filter=${filter}` : ""}`
            const res = await getNotifications(query)
            const items = res.data.data.notifications
            const totalCount = res.data.data.total

            if (append) {
                setNotifications(prev => [...prev, ...items])
            } else {
                setNotifications(items)
            }
            setTotal(totalCount)
        } catch (e) {
            // silent
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [filter])

    useEffect(() => {
        setPage(1)
        fetchNotifications(1)
    }, [fetchNotifications])

    const handleLoadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchNotifications(nextPage, true)
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead()
            markAllItemsAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setCount(0)
        } catch (e) {
            // silent
        }
    }

    const handleClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await markAsRead(notification.notification_id)
                markItemAsRead(notification.notification_id)
                setNotifications(prev =>
                    prev.map(n =>
                        n.notification_id === notification.notification_id
                            ? { ...n, is_read: true }
                            : n
                    )
                )
            } catch (e) {
                // silent
            }
        }
        if (notification.action_url) {
            router.push(notification.action_url)
        }
    }

    const handleKeyDown = (e, notification) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick(notification)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length
    const groups = groupNotifications(notifications)
    const hasMore = notifications.length < total

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-gray-900">Notifikasi</h1>
                <p className="text-gray-500 mt-1">
                    Lihat semua pembaruan dan aktivitas yang berkaitan dengan akun Anda.
                </p>
            </div>

            {/* Filters + Mark All Read */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            filter === "all"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            filter === "unread"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Belum Dibaca
                        {unreadCount > 0 && (
                            <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
                        Tandai semua sudah dibaca
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <FontAwesomeIcon icon={faSpinner} className="text-3xl mb-3 animate-spin" />
                    <span className="text-sm">Memuat notifikasi...</span>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <FontAwesomeIcon icon={faBell} className="text-4xl mb-3" />
                    <span className="text-sm">
                        {filter === "unread"
                            ? "Tidak ada notifikasi yang belum dibaca."
                            : "Belum ada notifikasi."}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {groups.map((group) => (
                        <div key={group.label}>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                {group.label}
                            </h3>
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                {group.items.map((notification) => (
                                    <button
                                        key={notification.notification_id}
                                        onClick={() => handleClick(notification)}
                                        onKeyDown={(e) => handleKeyDown(e, notification)}
                                        className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                                            !notification.is_read
                                                ? "bg-blue-50/60 hover:bg-blue-50"
                                                : "hover:bg-gray-50"
                                        }`}
                                        aria-label={`${notification.title}. ${notification.message}. ${timeAgo(notification.created_at)}`}
                                    >
                                        {/* Unread dot */}
                                        <div className="mt-1.5 flex-shrink-0 w-2 h-2">
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug ${
                                                !notification.is_read
                                                    ? "font-semibold text-gray-900"
                                                    : "text-gray-600"
                                            }`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1.5">
                                                {timeAgo(notification.created_at)}
                                            </p>
                                        </div>

                                        {/* Read indicator */}
                                        <div className="mt-1 flex-shrink-0">
                                            {!notification.is_read ? (
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                    className="text-gray-300 text-xs"
                                                />
                                            ) : (
                                                <FontAwesomeIcon
                                                    icon={faCheckDouble}
                                                    className="text-blue-400 text-xs"
                                                />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center py-4">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        Memuat...
                                    </span>
                                ) : (
                                    "Muat lebih banyak"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
