import { useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightFromBracket, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import NotificationBell from "@/app/component/Notification/NotificationBell"
import { useNotificationStore } from "@/app/stores/useNotificationStore"

export default function Navbar({ user, setActive, active, modules, onLogout, onExpandChange }){
    const [expanded, setExpanded] = useState(false)
    const [tooltip, setTooltip] = useState(null)
    const { isOpen, setIsOpen } = useNotificationStore()

    const sidebarWidth = expanded ? "w-60" : "w-16"

    const toggleExpand = () => {
        const next = !expanded
        setExpanded(next)
        onExpandChange?.(next)
    }

    const showTooltip = (e, label) => {
        if (expanded) return
        const rect = e.currentTarget.getBoundingClientRect()
        setTooltip({
            label,
            x: rect.right + 8,
            y: rect.top + rect.height / 2
        })
    }

    const hideTooltip = () => setTooltip(null)

    return (
        <>
            <div className={`${sidebarWidth} h-screen top-0 bottom-0 left-0 z-50 bg-white drop-shadow-lg flex flex-col fixed transition-all duration-300 ease-in-out`}>
                <div id="logo" className="flex items-center justify-center border-b border-gray-200 w-full px-3 py-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <Image
                            src="/img/icon.webp"
                            alt="Prisma Logo"
                            width={40}
                            height={40}
                            className="flex-shrink-0"
                        />
                        {expanded && (
                            <span className="text-lg font-semibold text-gray-800 whitespace-nowrap">Prisma</span>
                        )}
                    </div>
                </div>

                <div id="navbar-menu" className="flex flex-col items-start h-full w-full p-2.5 gap-1 overflow-y-auto">
                    {modules.map(module => (
                        <div
                            key={module.key}
                            onClick={() => setActive(module.key)}
                            onMouseEnter={(e) => !expanded && showTooltip(e, module.label)}
                            onMouseLeave={hideTooltip}
                            className={`relative w-full cursor-pointer rounded-md transition-colors duration-200 ${
                                active === module.key
                                    ? "bg-blue-100 text-blue-700"
                                    : "hover:bg-gray-100 text-gray-500"
                            }`}
                        >
                            <div className={`w-full flex items-center gap-3 px-3 py-2.5 ${expanded ? "justify-start" : "justify-center"}`}>
                                <FontAwesomeIcon
                                    icon={module.icon}
                                    className={`text-lg flex-shrink-0 ${
                                        active === module.key ? "text-blue-600" : "text-gray-500"
                                    }`}
                                />
                                {expanded && (
                                    <span className={`text-sm whitespace-nowrap overflow-hidden ${
                                        active === module.key ? "font-medium text-blue-700" : "text-gray-600"
                                    }`}>
                                        {module.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full px-2.5 py-1 border-t border-gray-100">
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        onMouseEnter={(e) => !expanded && showTooltip(e, "Notifikasi")}
                        onMouseLeave={hideTooltip}
                        className={`relative w-full cursor-pointer rounded-md transition-colors duration-200 hover:bg-gray-100`}
                    >
                        <div className={`w-full flex items-center gap-3 px-3 py-2.5 ${expanded ? "justify-start" : "justify-center"}`}>
                            <NotificationBell expanded={expanded} />
                            {expanded && (
                                <span className="text-sm text-gray-600 whitespace-nowrap">Notifikasi</span>
                            )}
                        </div>
                    </div>
                </div>

                <div id="logout-section" className="w-full p-2.5 border-t border-gray-200 flex flex-col gap-1">
                    {user && (
                        <div
                            className={`w-full flex items-center gap-3 px-3 py-2.5 ${expanded ? "justify-start" : "justify-center"}`}
                        >
                            <Image
                                src={user.avatar || "/img/user_placeholder.webp"}
                                alt={user.nama || "User"}
                                width={expanded ? 40 : 32}
                                height={expanded ? 40 : 32}
                                className="flex-shrink-0 rounded-full"
                                unoptimized
                            />
                            {expanded && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {user.nama}
                                    </span>
                                    <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {user.role}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {expanded && (
                        <div
                            onClick={() => onLogout()}
                        onMouseEnter={(e) => !expanded && showTooltip(e, "Logout")}
                        onMouseLeave={hideTooltip}
                            className="relative w-full cursor-pointer rounded-md hover:bg-gray-100 transition-colors duration-200"
                        >
                            <div className="w-full flex items-center gap-3 px-3 py-2.5 justify-start">
                                <FontAwesomeIcon
                                    icon={faArrowRightFromBracket}
                                    className="text-red-600 text-lg flex-shrink-0"
                                />
                                <span className="text-sm text-red-600 whitespace-nowrap">Logout</span>
                            </div>
                        </div>
                    )}

                    <div
                        onClick={toggleExpand}
                        onMouseEnter={(e) => !expanded && showTooltip(e, "Expand")}
                        onMouseLeave={hideTooltip}
                        className="relative w-full cursor-pointer rounded-md hover:bg-gray-100 transition-colors duration-200"
                    >
                        <div className={`w-full flex items-center gap-3 px-3 py-2.5 ${expanded ? "justify-start" : "justify-center"}`}>
                            <FontAwesomeIcon
                                icon={expanded ? faChevronLeft : faChevronRight}
                                className="text-gray-400 text-lg flex-shrink-0"
                            />
                            {expanded && (
                                <span className="text-sm text-gray-500 whitespace-nowrap">Minimize</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {tooltip && createPortal(
                <div
                    className="fixed z-[9999] bg-foreground/90 text-white text-sm rounded-md px-3 py-1.5 whitespace-nowrap pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y, transform: "translateY(-50%)", animation: "fadeIn 0.15s ease-in-out" }}
                >
                    {tooltip.label}
                </div>,
                document.body
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    )
}
