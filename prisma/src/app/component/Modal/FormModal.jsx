"use client"

import Modal from "./Modal"

export default function FormModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = "max-w-lg",
    closeOnBackdrop = false,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            maxWidth={maxWidth}
            closeOnBackdrop={closeOnBackdrop}
            footer={footer}
        >
            {children}
        </Modal>
    )
}
