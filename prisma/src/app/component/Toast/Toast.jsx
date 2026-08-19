"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faExclamation, faInfo, faX } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect, useCallback } from "react"

const TOAST_ICONS = {
    success: faCheck,
    error: faX,
    warning: faExclamation,
    info: faInfo,
}

const TOAST_COLORS = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
}

let toastId = 0
let listeners = []

export function showToast(message, type = "info", duration = 3000) {
    const id = ++toastId
    const toast = { id, message, type, duration }
    listeners.forEach((fn) => fn(toast))
    return id
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toast) => {
        setToasts((prev) => [...prev, toast])
        if (toast.duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }, toast.duration)
        }
    }, [])

    useEffect(() => {
        listeners.push(addToast)
        return () => {
            listeners = listeners.filter((fn) => fn !== addToast)
        }
    }, [addToast])

    const dismiss = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[400px]"
                    >
                        <div className={`${TOAST_COLORS[toast.type]} p-1.5 rounded-full`}>
                            <FontAwesomeIcon
                                className="text-xs text-white"
                                icon={TOAST_ICONS[toast.type]}
                            />
                        </div>
                        <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faX} className="text-xs" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
