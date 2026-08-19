"use client"

import { useState, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faCloudArrowUp, faFile } from "@fortawesome/free-solid-svg-icons"

import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import { uploadDokumenLaporan } from "@/app/component/Libraries/api/laporan"
import { showToast } from "@/app/component/Toast/Toast"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function LaporanUploadForm({
    close,
    refresh,
    laporan,
}) {
    const [file, setFile] = useState(null)
    const fileInputRef = useRef(null)

    const { loading, submit } = useFormSubmission({
        onSuccess: () => { refresh(); close() }
    })

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0]
        if (selected) setFile(selected)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const dropped = e.dataTransfer.files?.[0]
        if (dropped) setFile(dropped)
    }

    const handleDragOver = (e) => e.preventDefault()

    const handleSubmit = async () => {
        const formData = new FormData()
        formData.append("laporan_id", laporan.laporan_id)
        formData.append("uploaded_file", file)

        await submit(() => uploadDokumenLaporan(formData), {
            successMessage: "Dokumen laporan berhasil diupload.",
            errorMessage: "Gagal mengupload dokumen laporan."
        })
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title="Upload Revisi Dokumen Laporan"
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="secondary" onClick={close}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !file}>
                        Upload
                    </Button>
                </>
            }
        >
            {/* FILE DROP ZONE */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-foreground/50 hover:bg-gray-50/50 transition-colors"
            >
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-gray-400 text-2xl" />
                {file ? (
                    <div className="flex items-center gap-2 text-sm">
                        <FontAwesomeIcon icon={faFile} className="text-foreground" />
                        <span className="font-medium">{file.name}</span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        Seret file ke sini atau klik untuk memilih
                    </p>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </Modal>
    )
}
