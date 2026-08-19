"use client"

import Modal from "./Modal"
import Button from "../Inputs/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faQuestion } from "@fortawesome/free-solid-svg-icons"

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Konfirmasi",
    message,
    confirmText = "Ya",
    cancelText = "Tidak",
    variant = "primary",
    loading = false,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            zIndex="z-[70]"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={onConfirm} disabled={loading}>
                        {loading ? "Memproses..." : confirmText}
                    </Button>
                </>
            }
        >
            <div className="flex items-start gap-3">
                <div className="bg-gray-800 p-2 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon className="text-sm text-white" icon={faQuestion} />
                </div>
                <p className="text-sm text-gray-600 pt-2">{message}</p>
            </div>
        </Modal>
    )
}
