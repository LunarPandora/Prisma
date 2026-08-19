"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faFlask, faFile, faEdit, faSpinner, faTag, faEye, faUsers, faPencil } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from "framer-motion"

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import LoadingBar from "@/app/component/AppLoader/LoadingBar"

import { fetchAllKegiatan, fetchKegiatan } from "@/app/component/Libraries/api/kegiatan"
import { addProposal, updateProposal } from "@/app/component/Libraries/api/proposal"
import { generatePDFPreview, getPDFPageCount, getFileMeta, isValidPDF, isPDFExceedSizeLimit, estimateReadingTime, getPDFMetadata } from "@/app/component/Libraries/utils/pdfPreview"

import { useUserStore } from "@/app/stores/useUserStore"
import Button from "@/app/component/Inputs/Button"
import UserTag from "@/app/component/Tags/UserTag"

export default function FormProposalViewDosen({ close, data }){
    const defaultForm = {
        proposal_id: "",
        rencana_judul_publikasi_gan: "",
        rencana_judul_publikasi_gen: "",

        member_dosen_proposal: [],
        member_mhswa_proposal: [],
        member_kolab_proposal: [],

        jenis_dokumen: "",
        kegiatan_id: "",
        local_file_url: "",
    }
    const [form, setForm] = useState(defaultForm)
    const [preview, setPreview] = useState(null)
    const [fileMeta, setFileMeta] = useState(null)
    const [fileMetadata, setFileMetadata] = useState(null)
    const [estimateTime, setEstimateTime] = useState(null)
    const [pageCount, setPageCount] = useState(0)

    const [loadingForm, setLoadingForm] = useState(false)
    const [loadingFile, setLoadingFile] = useState(false)
    const [existingFile, setExistingFile] = useState(null)

    const user = useUserStore(state => state.user)
    const MotionLoadingBar = motion.create(LoadingBar);
    const imageSrc = preview || null

    useEffect(() => {
        if (data) {
            console.log(data)
            setForm(prev => ({
                ...prev,
                ...data,
            }))
        } else {
            setForm(defaultForm)
        }
    }, [data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const fetchFileFromUrl = async (url) => {
        const res = await fetch(url)
        const blob = await res.blob()

        // Optional: extract filename from URL
        const filename = url.split("/").pop()

        return new File([blob], filename, { type: blob.type })
    }

    const openDocument = () => {
        window.open(form.local_file_url)
    }

    const loadExistingFile = async (url, name) => {
        setLoadingFile(true)

        const file = await fetchFileFromUrl(url)
        setExistingFile(file)

        const meta = getFileMeta(file)
        meta.name = name
        setFileMeta(meta)

        const preview = await generatePDFPreview(file)
        setPreview(preview)

        const pages = await getPDFPageCount(file)
        setPageCount(pages)

        const reading = estimateReadingTime(file, pages)
        setEstimateTime(reading)

        setLoadingFile(false)
    }

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

useEffect(() => {
    if (data?.dokumen) {
        let doc = data.dokumen.find((d) => d.jenis_dokumen == 'Dokumen Proposal')
        if (!doc) return

        loadExistingFile(doc.file_url, doc.current_version.nama_file)
        
        setForm(prev => ({
            ...prev,
            'local_file_url': doc.file_url,
            'jenis_dokumen': 'Dokumen Proposal',
        }))
    }
}, [data])

    const members = [
        ...data.member_dosen_proposal.map((item) => ({
            nama: item.nama,
            unique_id: item.unique_id,
            avatar_url: item.avatar,
            role: 'Dosen',
        })),

        ...data.member_mhswa_proposal.map((item) => ({
            nama: item.nama,
            unique_id: item.unique_id,
            avatar_url: item.avatar,
            role: 'Mahasiswa',
        })),

        ...data.member_kolab_proposal.map((item) => ({
            nama: item.nama,
            unique_id: item.unique_id,
            avatar_url: item.avatar,
            role: 'Kolaborator',
        })),
    ]

    const uniqueMembers = Array.from(
        new Map(
            members.map((item) => [
                `${item.role}-${item.unique_id}`,
                item
            ])
        ).values()
    )

    return (
        <motion.div
            key="formModal"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
        >
             <AnimatePresence mode="wait">
                { loadingForm ?
                    (
                        <MotionLoadingBar />
                    )
                    :
                    (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-4xl bg-white rounded-xl max-h-[90vh] flex flex-col drop-shadow-lg will-change-auto"
                        >
                            <div className="flex items-start justify-between p-6 pb-0">
                                <h3 className="text-xl font-medium">Cek Proposal</h3>
                                <button onClick={() => close('this')} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-3">
                                    <div className="w-full flex items-center justify-center gap-2 border-2 border-gray-400 rounded-md p-4 border-dashed min-h-60 relative overflow-hidden">
                                        { existingFile &&
                                            <div
                                                className="w-full h-full z-10 absolute inset-0 opacity-0 hover:opacity-100 bg-black/40 flex items-center justify-center hover:cursor-pointer transition-opacity duration-200 ease-in-out" 
                                                onClick={() => openDocument()}
                                            >
                                                <FontAwesomeIcon icon={faEye} className="text-white text-2xl" />
                                            </div>
                                        }
                                        { existingFile && 
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
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-2 h-fit">
                                        <TextInput
                                            name="judul"
                                            type="text"
                                            placeholder="Judul Proposal"
                                            icon={faPencil}
                                            value={form.judul}
                                            disabled={true}
                                        />

                                        <TextInput
                                            name="rencana_judul_publikasi_gan" 
                                            type="text"
                                            placeholder="Rencana Judul Publikasi (Ganjil)"
                                            icon={faPencil}
                                            value={form.rencana_judul_publikasi_gan}
                                            disabled={true}
                                        />

                                        <TextInput
                                            name="rencana_judul_publikasi_gen" 
                                            type="text"
                                            placeholder="Rencana Judul Publikasi (Genap)"
                                            icon={faPencil}
                                            value={form.rencana_judul_publikasi_gen}
                                            disabled={true}
                                        />

                                        <SelectInput
                                            name="kegiatan_id"
                                            value={form.kegiatan_id}
                                            onChange={handleChange}
                                            dataSource={fetchKegiatan}
                                            transform={(item) => ({
                                                text: item.nama_kegiatan,
                                                value: item.kegiatan_id
                                            })}
                                            disabled={true}
                                            icon={faFlask}
                                            placeholder={`Kegiatan Penelitian`}
                                        />

                                        <TextInput
                                            name="jenis_dokumen" 
                                            type="text"
                                            placeholder="Jenis dokumen"
                                            icon={faTag}
                                            value={form.jenis_dokumen}
                                            disabled={true}
                                        />

                                        <div className="col-span-2">
                                            <p className="pt-1 pb-2">Peneliti yang terlibat</p>
                                            <div className="flex gap-1 w-full flex-wrap overflow-hidden">
                                                { 
                                                    uniqueMembers.map((val, i) => (
                                                        <UserTag 
                                                            img={val.avatar_url}
                                                            name={`${val.nama} (${val.unique_id})`}
                                                            key={val.nama}
                                                        />
                                                    )) 
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-2">
                                    <Button onClick={close} variant="secondary">
                                        Kembali
                                    </Button>

                                    <a href={form.local_file_url} download className="bg-white hover:bg-foreground text-foreground/90 hover:text-white text-lg px-5 py-2 rounded-lg font-medium transition-colors duration-300 ease-in-out cursor-pointer border-2 border-foreground/80 flex items-center justify-center">
                                        Download dokumen
                                    </a> 
                                </div>
                            </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </motion.div>
    )
}