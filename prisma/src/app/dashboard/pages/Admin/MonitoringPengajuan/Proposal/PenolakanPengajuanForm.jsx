"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import "quill/dist/quill.snow.css"

import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import Alert from "@/app/component/Alert/Alert"

import { deleteProposal } from "@/app/component/Libraries/api/proposal"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

const QuillEditor = dynamic(() => import("react-quill-new"), { ssr: false })

export default function FormPenolakanPengajuan({ refresh, close, data }){
    const [catatan, setCatatan] = useState("")
    const [showConfirm, setShowConfirm] = useState(false)

    const { loading, submit } = useFormSubmission({
        onSuccess: () => {
            refresh()
            close('all')
        }
    })

    async function rejectPengajuan(){
        const formData = new FormData()
        formData.append('proposal_id', data.proposal_id)
        formData.append('catatan', catatan || 'Proposal ditolak oleh Ketua LPPM')

        await submit(
            () => deleteProposal(formData),
            {
                successMessage: "Pengajuan proposal berhasil ditolak.",
                errorMessage: "Gagal menolak pengajuan proposal.",
            }
        )
    }

    return (
        <>
        <Modal
            isOpen={true}
            onClose={() => close('this')}
            title="Penolakan Pengajuan"
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <div className="w-full grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => close('this')}>
                        Kembali
                    </Button>
                    <Button variant="danger" onClick={() => setShowConfirm(true)} disabled={loading}>
                        {loading ? "Menyimpan..." : "Tolak Pengajuan"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-3">
                <p className="text-gray-600">
                    Tolak pengajuan proposal ini. Berikan catatan agar peneliti tahu apa yang perlu diperbaiki.
                </p>
                <QuillEditor
                    theme="snow"
                    value={catatan}
                    onChange={setCatatan}
                    placeholder="Tulis catatan penolakan di sini..."
                    className="h-40"
                />
            </div>
        </Modal>

        {showConfirm && (
            <Alert
                alertType="danger"
                title="Tolak Pengajuan Proposal"
                msg="Apakah Anda yakin ingin menolak pengajuan proposal ini? Proposal akan dihapus."
                onCancel={() => setShowConfirm(false)}
                onAccept={() => {
                    rejectPengajuan()
                }}
                acceptText="Tolak"
                isConfirmation={true}
                withBackground={true}
                loading={loading}
            />
        )}
        </>
    )
}
