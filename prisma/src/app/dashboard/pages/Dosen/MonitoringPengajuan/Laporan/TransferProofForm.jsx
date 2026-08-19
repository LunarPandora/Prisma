"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudArrowUp, faSpinner } from "@fortawesome/free-solid-svg-icons"

import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import { showToast } from "@/app/component/Toast/Toast"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

import { uploadBuktiTerima, uploadPengembalianProof } from "@/app/component/Libraries/api/dana"

/**
 * mode: "claim" | "pengembalian"
 */
export default function TransferProofForm({
    close,
    refresh,
    laporan,
    mode = "claim",
}) {
    const [file, setFile] = useState(null)

    const { loading, submit } = useFormSubmission({
        onSuccess: () => { refresh(); close() }
    })

    const title = mode === "claim"
        ? "Upload Bukti Terima Claim Dana"
        : "Upload Bukti Transfer Pengembalian Dana"

    async function handleSubmit() {
        if (!file) return

        const formData = new FormData()
        formData.append("laporan_id", laporan.laporan_id)
        formData.append("uploaded_file", file)

        const apiCall = mode === "pengembalian"
            ? () => uploadPengembalianProof(formData)
            : () => uploadBuktiTerima(formData)

        await submit(apiCall, {
            successMessage: mode === "pengembalian"
                ? "Bukti pengembalian berhasil diupload."
                : "Bukti terima berhasil diupload.",
            errorMessage: mode === "pengembalian"
                ? "Gagal mengupload bukti pengembalian."
                : "Gagal mengupload bukti terima."
        })
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={title}
            maxWidth="max-w-md"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="secondary" onClick={close}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={!file || loading}>
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Mengupload...
                            </>
                        ) : "Upload"}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-gray-500 mb-4">
                Upload bukti bahwa transfer dana telah berhasil diterima.
                Format: PDF, JPG, atau PNG. Ukuran maksimal 5MB.
            </p>

            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault()
                    const f = e.dataTransfer.files[0]
                    if (f) setFile(f)
                }}
                onClick={() => document.getElementById("proof-file-input")?.click()}
                className={`
                    flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed
                    transition-all duration-200 cursor-pointer
                    ${file
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                    }
                `}
            >
                {file ? (
                    <>
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-green-500 text-2xl" />
                        <span className="text-sm font-medium text-green-700">{file.name}</span>
                        <span className="text-xs text-green-600">Klik untuk mengganti file</span>
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-gray-400 text-2xl" />
                        <span className="text-sm text-gray-500">Klik atau seret file ke sini</span>
                    </>
                )}
            </div>

            <input
                id="proof-file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
            />
        </Modal>
    )
}
