"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { createPortal } from "react-dom"
import { useState } from "react"

export default function ActionButton({ icon, label, onClick, disabled, danger }) {
    const [tooltip, setTooltip] = useState(null)

    const showTooltip = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 8
        })
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    if (!disabled) onClick?.(e)
                }}
                onMouseEnter={showTooltip}
                onMouseLeave={() => setTooltip(null)}
                disabled={disabled}
                className={`inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded-md border transition-all duration-150 ${
                    disabled
                        ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
                        : danger
                            ? "text-red-600 bg-white border-red-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
                            : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                }`}
            >
                <FontAwesomeIcon icon={icon} className="text-xs" />
            </button>

            {tooltip && createPortal(
                <div
                    className="fixed z-[9999] bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)", animation: "fadeIn 0.15s ease-in-out" }}
                >
                    {label}
                </div>,
                document.body
            )}
        </>
    )
}
