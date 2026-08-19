import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faCheckDouble, faBell, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useNotificationStore } from "@/app/stores/useNotificationStore"
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "@/app/component/Libraries/api/notifications"

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
    if (days < 7) return `${days} hari yang lalu`
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

export default function NotificationDropdown({ onClose }) {
    const router = useRouter()
    const {
        notifications,
        setNotifications,
        total,
        setTotal,
        isLoading,
        setIsLoading,
        markItemAsRead,
        markAllItemsAsRead,
        setCount,
    } = useNotificationStore()

    const [page, setPage] = useState(1)

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                const res = await getNotifications(`page=${page}&per_page=10`)
                setNotifications(res.data.data.notifications)
                setTotal(res.data.data.total)
            } catch (e) {
                // silent
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [page, setNotifications, setTotal, setIsLoading])

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead()
            markAllItemsAsRead()
        } catch (e) {
            // silent
        }
    }

    const handleClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await markAsRead(notification.notification_id)
                markItemAsRead(notification.notification_id)
            } catch (e) {
                // silent
            }
        }
        if (notification.action_url) {
            router.push(notification.action_url)
        }
        onClose()
    }

    const handleKeyDown = (e, notification) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick(notification)
        }
    }

    const handleLihatSemua = () => {
        router.push("/dashboard?module=notifications")
        onClose()
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length

    return (
        <div
            className="fixed top-16 right-4 w-96 max-h-[500px] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col z-[9998]"
            style={{ animation: "dropdownFadeIn 0.15s ease-in-out" }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">Notifikasi</span>
                    {unreadCount > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                        Tandai semua sudah dibaca
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-xs mt-2">Memuat...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <FontAwesomeIcon icon={faBell} className="text-3xl mb-2" />
                        <span className="text-sm">Tidak ada notifikasi</span>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <button
                            key={notification.notification_id}
                            onClick={() => handleClick(notification)}
                            onKeyDown={(e) => handleKeyDown(e, notification)}
                            className={`w-full text-left flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                                !notification.is_read
                                    ? "bg-blue-50/50 hover:bg-blue-50"
                                    : "hover:bg-gray-50"
                            }`}
                            aria-label={`${notification.title}. ${notification.message}. ${timeAgo(notification.created_at)}`}
                        >
                            {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            )}
                            <div className={`flex-1 min-w-0 ${notification.is_read ? "ml-4" : ""}`}>
                                <p className={`text-sm leading-snug ${!notification.is_read ? "font-medium text-gray-800" : "text-gray-600"}`}>
                                    {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {notification.message}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    {timeAgo(notification.created_at)}
                                </p>
                            </div>
                            {!notification.is_read && (
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-gray-300 text-xs mt-2 flex-shrink-0"
                                />
                            )}
                        </button>
                    ))
                )}
            </div>

            {/* Footer: pagination + lihat semua */}
            <div className="border-t border-gray-100">
                {total > 10 && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="text-xs text-gray-500 hover:text-gray-700 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Sebelumnya
                        </button>
                        <span className="text-xs text-gray-400">
                            {page} / {Math.ceil(total / 10)}
                        </span>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= Math.ceil(total / 10)}
                            className="text-xs text-gray-500 hover:text-gray-700 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Selanjutnya
                        </button>
                    </div>
                )}
                <button
                    onClick={handleLihatSemua}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-t border-gray-100"
                >
                    Lihat Semua Notifikasi
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
            </div>

            <style>{`
                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
