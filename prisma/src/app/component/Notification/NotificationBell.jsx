import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell } from "@fortawesome/free-solid-svg-icons"
import { useNotificationStore } from "@/app/stores/useNotificationStore"
import { getUnreadCount } from "@/app/component/Libraries/api/notifications"
import NotificationDropdown from "./NotificationDropdown"

export default function NotificationBell({ expanded }) {
    const { count, setCount, isOpen, setIsOpen } = useNotificationStore()
    const bellRef = useRef(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const poll = async () => {
            try {
                const res = await getUnreadCount()
                setCount(res.data.data.count)
            } catch (e) {
                // silent
            }
        }

        poll()
        const interval = setInterval(poll, 30000)
        return () => clearInterval(interval)
    }, [setCount])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isOpen &&
                bellRef.current &&
                !bellRef.current.contains(e.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, setIsOpen])

    return (
        <div className="relative flex-shrink-0" ref={bellRef}>
            <div className="relative cursor-pointer flex items-center justify-center">
                <FontAwesomeIcon
                    icon={faBell}
                    className={`${expanded ? "text-lg" : "text-base"} text-gray-500`}
                />
                {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 leading-none">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </div>

            {isOpen && createPortal(
                <div ref={dropdownRef}>
                    <NotificationDropdown onClose={() => setIsOpen(false)} />
                </div>,
                document.body
            )}
        </div>
    )
}
