"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX } from "@fortawesome/free-solid-svg-icons"

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = "max-w-lg",
    maxHeight = "max-h-[90vh]",
    zIndex = "z-50",
    closeOnBackdrop = true,
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 bg-black/40 flex items-center justify-center ${zIndex} will-change-auto`}
                    onClick={closeOnBackdrop ? onClose : undefined}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                        className={`bg-white rounded-xl w-full ${maxWidth} ${maxHeight} flex flex-col drop-shadow-lg will-change-auto`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between p-6 pb-0">
                            <div>
                                <h3 className="text-xl font-medium">{title}</h3>
                                {subtitle && (
                                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faX} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

                        {footer && (
                            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">{footer}</div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
