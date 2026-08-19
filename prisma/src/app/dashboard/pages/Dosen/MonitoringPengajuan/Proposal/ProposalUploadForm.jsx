"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from "framer-motion"

import { getGeneratedTemplate, uploadProposal } from "@/app/component/Libraries/api/proposal"
import { generatePDFPreview, getPDFPageCount, getFileMeta, isValidPDF, isPDFExceedSizeLimit, estimateReadingTime, getPDFMetadata } from "@/app/component/Libraries/utils/pdfPreview"

import { useUserStore } from "@/app/stores/useUserStore";
import Button from "@/app/component/Inputs/Button"
import { showToast } from "@/app/component/Toast/Toast"
import Modal from "@/app/component/Modal/Modal"

export default function FormProposalUpload({ refresh, close, data }){
    const defaultForm = {
        generated_file_url: "", 
        local_file_url: "",
        
        uploaded_file: null,
    }

    const [form, setForm] = useState(defaultForm)
    const [preview, setPreview] = useState(null)
    const [fileMeta, setFileMeta] = useState(null)
    const [fileMetadata, setFileMetadata] = useState(null)
    const [estimateTime, setEstimateTime] = useState(null)
    const [pageCount, setPageCount] = useState(0)

    const [loadingFile, setLoadingFile] = useState(false)
    const [existingFile, setExistingFile] = useState(null)

    const user = useUserStore(state => state.user)
    const fileInputRef = useRef(null);
    const imageSrc = preview || null

    useEffect(() => {
        if (data) {
            setForm(prev => ({
                ...prev,
                ...data,
            }))
        } else {
            setForm(defaultForm)
        }
    }, [data])

    const fetchData = async () => {
        const formData = new FormData()
        formData.append('proposal_id', data.proposal_id)
    
        const res = await getGeneratedTemplate(formData)

        if (res.data.status == 'success'){ 
            setForm(prev => ({
                ...prev,
                generated_file_url: res.data.data
            }))
        }
        else {
            showToast("Gagal mengambil dokumen.", "error")
            refresh()
            close()
        }
    }

    const uploadData = async() => {
        try{
            const formData = new FormData()

            formData.append('proposal_id', data.proposal_id)
            formData.append('uploaded_file', form.uploaded_file)

            const res = await uploadProposal(formData)

            if (res.data.status == 'success'){ 
                showToast("Proposal berhasil diajukan.", "success")
                refresh()
                close()
            }
            else {
                showToast(err.message || "Gagal mengajukan proposal.", "error")
            }
        }
        catch(err){
            showToast(err.message || "Gagal mengajukan proposal.", "error")
            console.error(err)
        }
    }

    const handleFileInput = async (e) => {
        setLoadingFile(true)

        const file = e.target.files[0]
        if (!file) return

        if (e.target.files.length > 1) {
            showToast("Hanya 1 file yang diperbolehkan!", "error");
            return;
        }

        if (!isValidPDF(file)) {
            showToast("Hanya file PDF yang diperbolehkan!", "error");
            return;
        }

        if (isPDFExceedSizeLimit(file)) {
            showToast("File terlalu besar (maks 10MB).", "error");
            return;
        }

        setForm((prev) => ({
            ...prev,
            uploaded_file: file,
        }))
        setExistingFile(null)

        const meta = getFileMeta(file)
        setFileMeta(meta)

        const preview = await generatePDFPreview(file)
        setPreview(preview)

        const pages = await getPDFPageCount(file)
        setPageCount(pages)

        const estimate = await estimateReadingTime(file, pages)
        setEstimateTime(estimate)

        setLoadingFile(false)
    }

    useEffect(() => {
        fetchData()
    }, [data])

    const footer = (
        <>
            <Button onClick={close} variant="secondary">
                Kembali
            </Button>

            <Button onClick={() => uploadData()}>
                Ajukan Proposal
            </Button>
        </>
    )

    return (
        <Modal isOpen={true} onClose={() => close('this')} title="Cek Proposal" maxWidth="max-w-2xl" closeOnBackdrop={false} footer={footer}>
            <div
                key="form_proposal"
                className="flex flex-col gap-3"
            >
                <div className="flex flex-col gap-3">
                    <div className="w-full grid grid-cols-2 gap-3 h-fit">
                        <a href={form.generated_file_url} download className="bg-white hover:bg-foreground text-foreground/90 hover:text-white text-lg px-5 py-2 rounded-lg font-medium transition-colors duration-300 ease-in-out cursor-pointer border-2 border-foreground/80 flex items-center justify-center col-span-2">
                            Download dokumen pengesahan dan uraian luaran publikasi
                        </a> 
                    </div>

                    <div className="w-full flex items-center justify-center gap-2 border-2 border-gray-400 rounded-md p-4 border-dashed min-h-60 relative overflow-hidden">
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileInput}
                            className="hidden"
                        />

                        { (form.uploaded_file || existingFile) &&
                            <div
                                className="w-full h-full z-10 absolute inset-0 opacity-0 hover:opacity-100 bg-black/40 flex items-center justify-center hover:cursor-pointer transition-opacity duration-200 ease-in-out" 
                                onClick={() => fileInputRef.current.click()}
                            >
                                <FontAwesomeIcon icon={faEdit} className="text-white text-2xl" />
                            </div>
                        }
                        { (form.uploaded_file || existingFile) && 
                            <div className="flex w-full">
                                <AnimatePresence mode="wait">
                                    {loadingFile ? 
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex w-full items-center justify-center gap-3"
                                        >
                                            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-gray-600 animate-spin" />
                                        </motion.div>
                                    :
                                        <motion.div 
                                            key="file"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex w-full items-center justify-center gap-3"
                                        >
                                            <Image
                                                src={imageSrc}
                                                alt="avatar"
                                                width={200}
                                                height={200}
                                                className="relative object-cover object-center border border-gray-200"
                                                unoptimized
                                            />

                                            <div className="flex flex-col w-full">
                                                <p className="font-semibold text-2xl line-clamp-2 pb-1 w-90">{fileMeta.name}</p>
                                                <table border="0" className="w-fit">
                                                    <tbody>
                                                        <tr className="font-normal text-sm">
                                                            <td><p>Ukuran file</p></td>
                                                            <td><p className="px-2">:</p></td>
                                                            <td><p>{fileMeta.formattedSize}</p></td>
                                                        </tr>
                                                        <tr className="font-normal text-sm">
                                                            <td><p>Terakhir kali diedit</p></td>
                                                            <td><p className="px-2">:</p></td>
                                                            <td><p>{fileMeta.formattedDate}</p></td>
                                                        </tr>
                                                        <tr className="font-normal text-sm">
                                                            <td><p>Jumlah halaman</p></td>
                                                            <td><p className="px-2">:</p></td>
                                                            <td><p>{pageCount} halaman</p></td>
                                                        </tr>
                                                        <tr className="font-normal text-sm">
                                                            <td><p>Perkiraan lama baca</p></td>
                                                            <td><p className="px-2">:</p></td>
                                                            <td><p>{estimateTime?.label || "Menghitung..."}</p></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    }
                                </AnimatePresence>
                            </div>
                        }
                        { !(form.uploaded_file || existingFile) ? 
                            <span 
                                className="underline decoration-dotted underline-offset-3 hover:cursor-pointer hover:text-primary text-center"
                                onClick={() => fileInputRef.current.click()}
                            >
                                Upload dokumen proposal anda disini<br />
                                Maks. 10MB
                            </span>
                        :
                            <>
                            </>
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}
