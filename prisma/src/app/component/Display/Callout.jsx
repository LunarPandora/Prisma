"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faExclamation, faInfo, faX } from "@fortawesome/free-solid-svg-icons"

const CALLOUT_CONFIG = {
    info: {
        icon: faInfo,
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconColor: "text-blue-500",
    },
    success: {
        icon: faCheck,
        bg: "bg-green-50",
        border: "border-green-200",
        iconColor: "text-green-500",
    },
    warning: {
        icon: faExclamation,
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        iconColor: "text-yellow-500",
    },
    error: {
        icon: faX,
        bg: "bg-red-50",
        border: "border-red-200",
        iconColor: "text-red-500",
    },
}

export default function Callout({
    type = "info",
    title,
    children,
    className = "",
    onDismiss,
}) {
    const config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.info

    return (
        <div className={`${config.bg} border ${config.border} rounded-lg px-4 py-3 flex items-start gap-3 ${className}`}>
            <FontAwesomeIcon icon={config.icon} className={`${config.iconColor} mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
                {title && <p className="font-medium text-sm mb-1">{title}</p>}
                <div className="text-sm text-gray-600">{children}</div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                    <FontAwesomeIcon icon={faX} className="text-xs" />
                </button>
            )}
        </div>
    )
}
