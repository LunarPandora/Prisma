"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

export function Field({ label, value, className = "" }) {
    if (!value || value === "" || value === "-") {
        return (
            <div className={`flex flex-col gap-1 ${className}`}>
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm text-gray-400 italic">—</span>
            </div>
        )
    }
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-sm text-gray-800 leading-relaxed">{value}</span>
        </div>
    )
}

export function Section({ title, children, defaultOpen = true, className = "" }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${open ? 'bg-gray-800' : 'hover:bg-gray-50'}`}
            >
                <span className={`font-medium text-sm ${open ? 'text-white' : 'text-gray-700'}`}>{title}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`text-xs ${open ? 'text-gray-400' : 'text-gray-400'}`}
                >
                    ▼
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 flex flex-col gap-3 border-t border-gray-100">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
