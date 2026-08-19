"use client"

import { useRef, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function ContextMenuRoot({
    onClicked,
    icon = null,
    iconColor = "text-gray-500",
    textColor = "text-gray-700",
    enabled = true,
    danger = false,
    contextData = null,
    children,
    focused = false,
    onItemRef,
}) {
    const itemRef = useRef(null)

    const isEnabled =
        typeof enabled === "function"
            ? enabled(contextData)
            : enabled

    const finalIconColor = !isEnabled
        ? "text-gray-300"
        : danger
        ? "text-red-500"
        : iconColor

    const finalTextColor = !isEnabled
        ? "text-gray-400"
        : danger
        ? "text-red-600"
        : textColor

    useEffect(() => {
        if (focused && itemRef.current) {
            itemRef.current.focus()
        }
    }, [focused])

    return (
        <div
            ref={(el) => {
                itemRef.current = el
                onItemRef?.(el)
            }}
            role="menuitem"
            tabIndex={isEnabled ? 0 : -1}
            aria-disabled={!isEnabled}
            className={`
                w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md mx-1
                transition-colors duration-100 ease-in-out outline-none
                ${!isEnabled
                    ? "text-gray-300 cursor-not-allowed"
                    : danger
                        ? "text-red-600 hover:bg-red-50 focus-visible:bg-red-50 cursor-pointer"
                        : "text-gray-700 hover:bg-gray-100 focus-visible:bg-gray-100 cursor-pointer"
                }
            `}
            onClick={() => {
                if (!isEnabled) return
                onClicked?.()
            }}
        >
            {icon && typeof icon !== "string" && (
                <FontAwesomeIcon icon={icon} className={`text-xs w-4 text-center shrink-0 ${finalIconColor}`} />
            )}
            <span className={finalTextColor}>{children}</span>
        </div>
    )
}
