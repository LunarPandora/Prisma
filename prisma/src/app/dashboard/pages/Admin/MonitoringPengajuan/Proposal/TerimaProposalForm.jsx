"use client"

import { useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from '@fortawesome/free-solid-svg-icons'

import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import Alert from "@/app/component/Alert/Alert"

import { acceptProposalSuratTugas } from "@/app/component/Libraries/api/proposal"
import { showToast } from "@/app/component/Toast/Toast"
import {
    isValidPDF,
    isPDFExceedSizeLimit,
} from "@/app/component/Libraries/utils/pdfPreview"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function TerimaProposalForm({ refresh, close, data }){
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInputRef = useRef(null)
    const [showConfirm, setShowConfirm] = useState(false)

    const { loading, submit } = useFormSubmission({
        onSuccess: () => {
            refresh()
            close('all')
        }
    })

    function handleFileChange(e) {
        const file = e.target.files[0]
        if (!file) return

        if (!isValidPDF(file)) {
            showToast("Hanya file PDF yang diperbolehkan!", "error")
            return
        }

        if (isPDFExceedSizeLimit(file)) {
            showToast("Ukuran file melebihi batas 10MB!", "error")
            return
        }

        setSelectedFile(file)
    }

    async function handleAccept(){
        const formData = new FormData()
        formData.append('proposal_id', data.proposal_id)
        formData.append('uploaded_file', selectedFile)

        await submit(
            () => acceptProposalSuratTugas(formData),
            {
                successMessage: "Proposal berhasil diterima!",
                errorMessage: "Gagal menerima proposal.",
            }
        )
    }

    return (
        <>
        <Modal
            isOpen={true}
            onClose={() => close('this')}
            title="Terima Proposal"
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="secondary" onClick={() => close('this')}>
                        Kembali
                    </Button>
                    <Button onClick={() => setShowConfirm(true)} disabled={!selectedFile || loading}>
                        {loading ? "Menyimpan..." : "Terima Proposal"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">
                    Upload SK Pengumuman (PDF) untuk menerima proposal ini. Status proposal akan berubah menjadi "Proposal Diterima".
                </p>

                <div className="flex flex-col gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center">
                    <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {selectedFile ? (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedFile(null)
                                    if (fileInputRef.current) fileInputRef.current.value = ""
                                }}
                                className="text-sm text-red-500 hover:underline"
                            >
                                Hapus file
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faUpload} className="text-2xl" />
                            <p className="text-sm">Klik untuk memilih file PDF</p>
                        </button>
                    )}
                </div>
            </div>
        </Modal>

        {showConfirm && (
            <Alert
                alertType="warning"
                title="Terima Proposal"
                msg="Apakah Anda yakin ingin menerima proposal ini? Status proposal akan berubah menjadi 'Proposal Diterima'."
                onCancel={() => setShowConfirm(false)}
                onAccept={() => {
                    handleAccept()
                }}
                acceptText="Terima"
                isConfirmation={true}
                withBackground={true}
                loading={loading}
            />
        )}
        </>
    )
}
