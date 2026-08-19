"use client"

import { useRef, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"

export default function ContextWindow({ position, onClose, children }) {
    const menuRef = useRef(null)

    const adjustPosition = useCallback(() => {
        if (!menuRef.current) return

        const menuRect = menuRef.current.getBoundingClientRect()
        const { clientX: x, clientY: y } = position
        const { innerWidth: vw, innerHeight: vh } = window

        let left = x
        let top = y

        if (x + menuRect.width > vw) left = vw - menuRect.width - 8
        if (y + menuRect.height > vh) top = vh - menuRect.height - 8
        if (left < 0) left = 8
        if (top < 0) top = 8

        menuRef.current.style.left = `${left}px`
        menuRef.current.style.top = `${top}px`
    }, [position])

    useEffect(() => {
        adjustPosition()

        const handleResize = () => adjustPosition()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [adjustPosition])

    useEffect(() => {
        if (!menuRef.current) return
        menuRef.current.focus()
    }, [])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="fixed inset-0 z-[9999]"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose()
                }}
            >
                <div
                    ref={menuRef}
                    tabIndex={-1}
                    role="menu"
                    aria-label="Context menu"
                    className="
                        absolute bg-white border border-gray-200 rounded-lg
                        shadow-lg overflow-hidden
                        min-w-[180px] max-h-[320px] overflow-y-auto
                        outline-none
                    "
                    style={{
                        left: position.clientX,
                        top: position.clientY,
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault()
                            e.stopPropagation()
                            onClose()
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose()
                    }}
                >
                    {children}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
