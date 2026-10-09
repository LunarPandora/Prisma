"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faTag, faEye, faPencil, faBook, faRupiahSign, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from "framer-motion"

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"

import { generatePDFPreview, getPDFPageCount, getFileMeta, estimateReadingTime } from "@/app/component/Libraries/utils/pdfPreview"

import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import UserTag from "@/app/component/Tags/UserTag"
import { useUserStore } from "@/app/stores/useUserStore"

export default function FormHasilReview({ refresh, close, data, triggerTolak, triggerTerima }){
    const user = useUserStore(state => state.user)

    const ketuaAlreadyDecided = data.ketua_seleksi_approved === true || data.status === "Ditolak"
    const isFinished = data.status === "Proposal Diterima" || data.status === "Dalam pengerjaan"
    const defaultForm = {
        penugasan_id: "",
        proposal_id: "",
        keputusan: "",
        kriteria_kesesuaian_tema: [],
        kriteria_penilaian: [],
        catatan: "",
        member_dosen_proposal: [],
        member_mhswa_proposal: [],
        member_kolab_proposal: [],
        rencana_judul_publikasi_gan: "",
        rencana_judul_publikasi_gen: "",
        ra_biaya_penelitian_gan: "",
        ra_biaya_publikasi_gan: "",
        ra_insentif_gan: "",
        ra_biaya_penelitian_gen: "",
        ra_biaya_publikasi_gen: "",
        ra_insentif_gen: "",
        target_publikasi_gan: "",
        target_publikasi_gen: "",
        kegiatan_id: "",
        local_file_url: "",
    }

    const [form, setForm] = useState(defaultForm)
    const [preview, setPreview] = useState(null)
    const [fileMeta, setFileMeta] = useState(null)
    const [pageCount, setPageCount] = useState(0)
    const [estimateTime, setEstimateTime] = useState(null)
    const [loadingFile, setLoadingFile] = useState(false)
    const [existingFile, setExistingFile] = useState(null)
    const [selectedReviewerIndex, setSelectedReviewerIndex] = useState(0)

    const [reviewForm, setReviewForm] = useState({
        keputusan: "",
        catatan: "",
        kriteria_kesesuaian_tema: [],
        kriteria_penilaian: []
    })

    const imageSrc = preview || null

    useEffect(() => {
        if (data) {
            setForm(prev => ({ ...prev, ...data }))
        } else {
            setForm(defaultForm)
        }
    }, [data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const fetchFileFromUrl = async (url) => {
        const res = await fetch(url)
        const blob = await res.blob()
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

    function formatNumber(number) {
        return new Intl.NumberFormat('id-ID').format(number)
    }

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview)
        }
    }, [preview])

    useEffect(() => {        
        if (data?.dokumen) {
            let doc = data.dokumen.find((d) => d.jenis_dokumen == 'Dokumen Proposal')
            if (!doc) return
            loadExistingFile(doc.file_url, doc.current_version.nama_file)
            setForm(prev => ({ ...prev, 'local_file_url': doc.file_url }))
        }
    }, [data])

    const reviewers = data?.penugasan || []
    const selectedPenugasan = reviewers[selectedReviewerIndex] || null
    const selectedReviewer = selectedPenugasan?.reviewer || null
    const selectedReview = selectedPenugasan?.review || null
    const hasReview = !!selectedReview

    useEffect(() => {
        if (!selectedReview) {
            setReviewForm({
                keputusan: "",
                catatan: "",
                kriteria_kesesuaian_tema: [],
                kriteria_penilaian: []
            })
            return
        }

        setReviewForm({
            keputusan: selectedReview.keputusan ?? "",
            catatan: selectedReview.catatan ?? "",
            kriteria_penilaian: selectedReview.kriteria_penilaian ?? [],
            kriteria_kesesuaian_tema: selectedReview.kriteria_kesesuaian_tema ?? []
        })
    }, [selectedReview])

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
            members.map((item) => [`${item.role}-${item.unique_id}`, item])
        ).values()
    )

    const totalNilai = reviewForm.kriteria_penilaian.reduce(
        (sum, item) => sum + (Number(item.nilai) || 0), 0
    )

    const isAllReviewed =
        reviewers.length > 0 &&
        reviewers.every(
            (item) => item.review && item.status_review === 'Telah direview'
        )

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title="Review Proposal"
            maxWidth="max-w-6xl"
            closeOnBackdrop={false}
        >
            <div className="flex flex-col gap-3 w-full">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-center gap-2 border-2 border-gray-400 rounded-md p-4 border-dashed h-62 relative overflow-hidden">
                        { existingFile && (
                            <div
                                className="w-full h-full z-10 absolute inset-0 opacity-0 hover:opacity-100 bg-black/40 flex items-center justify-center hover:cursor-pointer transition-opacity duration-200 ease-in-out" 
                                onClick={() => openDocument()}
                            >
                                <FontAwesomeIcon icon={faEye} className="text-white text-2xl" />
                            </div>
                        )}
                        { existingFile && (
                            <div className="flex w-full">
                                <AnimatePresence mode="wait">
                                    {loadingFile ? (
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
                                    ) : (
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
                                                width={160}
                                                height={160}
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
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 h-fit">
                        <TextInput
                            name="rencana_judul_publikasi_gan" 
                            type="text"
                            placeholder="Rencana Judul Publikasi (Ganjil)"
                            icon={faPencil}
                            value={form.rencana_judul_publikasi_gan}
                            disabled={true}
                            className={'col-span-2'}
                        />

                        <TextInput
                            name="rencana_judul_publikasi_gen" 
                            type="text"
                            placeholder="Rencana Judul Publikasi (Genap)"
                            icon={faPencil}
                            value={form.rencana_judul_publikasi_gen}
                            disabled={true}
                            className={'col-span-2'}
                        />

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">
                                <FontAwesomeIcon icon={faBook} className="mr-1" />
                                Target Publikasi (Ganjil)
                            </span>
                            <span className="text-sm text-gray-800">{form.target_publikasi_gan || "—"}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">
                                <FontAwesomeIcon icon={faBook} className="mr-1" />
                                Target Publikasi (Genap)
                            </span>
                            <span className="text-sm text-gray-800">{form.target_publikasi_gen || "—"}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                        <span className="text-gray-600 text-lg font-medium">
                            Rencana Anggaran
                        </span>

                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-y-2 border border-gray-200 rounded-md p-4 bg-gray-50">
                                <span className="text-gray-600 text-md font-medium">
                                    Semester Ganjil
                                </span>

                                <TextInput
                                    name="ra_biaya_penelitian_gan" 
                                    type="text"
                                    placeholder="Rencana anggaran Biaya Penelitian"
                                    icon={faRupiahSign}
                                    value={formatNumber(form.ra_biaya_penelitian_gan)}
                                    onChange={handleChange}
                                    disabled={true}
                                />

                                <TextInput
                                    name="ra_biaya_publikasi_gan" 
                                    type="text"
                                    placeholder="Rencana anggaran Biaya Publikasi"
                                    icon={faRupiahSign}
                                    value={formatNumber(form.ra_biaya_publikasi_gan)}
                                    onChange={handleChange}
                                    disabled={true}
                                />

                                <TextInput
                                    name="ra_insentif_gan" 
                                    type="text"
                                    placeholder="Rencana anggaran Insentif"
                                    icon={faRupiahSign}
                                    value={formatNumber(form.ra_insentif_gan)}
                                    onChange={handleChange}
                                    disabled={true}
                                />
                            </div>

                            <div className="flex flex-col gap-y-2 border border-gray-200 rounded-md p-4 bg-gray-50">
                                <span className="text-gray-600 text-md font-medium">
                                    Semester Genap
                                </span>

                                <TextInput
                                    name="ra_biaya_penelitian_gen" 
                                    type="text"
                                    placeholder="Rencana anggaran Biaya Penelitian"
                                    icon={faRupiahSign}
                                    value={formatNumber(form.ra_biaya_penelitian_gen)}
                                    onChange={handleChange}
                                    disabled={true}
                                />

                                <TextInput
                                    name="ra_biaya_publikasi_gen" 
                                    type="text"
                                    placeholder="Rencana anggaran Biaya Publikasi"
                                    icon={faRupiahSign}
                                    value={formatNumber(form.ra_biaya_publikasi_gen)}
                                    onChange={handleChange}
                                    disabled={true}
                                />

                                <TextInput
                                    name="ra_insentif_gen" 
                                    type="text"
                                    placeholder="Rencana anggaran Insentif"
                                    icon={faRupiahSign}
                                    value={formatNumber(form.ra_insentif_gen)}
                                    onChange={handleChange}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                        <span className="text-gray-600 text-lg font-medium">
                            Peneliti yang terlibat
                        </span>

                        <div className="w-full h-fit">
                            <div className="flex gap-1 w-full flex-wrap overflow-hidden">
                                { uniqueMembers.map((val, i) => (
                                    <UserTag 
                                        img={val.avatar_url}
                                        name={`${val.nama} (${val.unique_id})`}
                                        key={val.nama}
                                    />
                                )) }
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-y-3 border border-gray-300 rounded-lg p-4 bg-white col-span-2">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                type="button"
                                disabled={reviewers.length === 0 || selectedReviewerIndex === 0}
                                onClick={() => setSelectedReviewerIndex(prev => prev - 1)}
                                className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
                            </button>

                            <div className="flex flex-col items-center">
                                <p className="font-semibold">
                                    {selectedReviewer?.nama || '-'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Reviewer
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={reviewers.length === 0 || selectedReviewerIndex === reviewers.length - 1}
                                onClick={() => setSelectedReviewerIndex(prev => prev + 1)}
                                className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40"
                            >
                                <FontAwesomeIcon icon={faChevronRight} className="text-md" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-y-3 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                            <span className="text-gray-600 text-lg font-medium">
                                Kriteria Penilaian Reviewer
                            </span>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-2 text-sm w-14">No</th>
                                            <th className="border border-gray-300 p-2 text-sm">Kriteria</th>
                                            <th className="border border-gray-300 p-2 text-sm">Indikator Penilaian</th>
                                            <th className="border border-gray-300 p-2 text-sm w-24">Bobot</th>
                                            <th className="border border-gray-300 p-2 text-sm w-28">Skor</th>
                                            <th className="border border-gray-300 p-2 text-sm w-28">Nilai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!hasReview ? (
                                            <tr>
                                                <td colSpan={6} className="border border-gray-300 p-5 text-center text-gray-500">
                                                    Belum ada review
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {reviewForm.kriteria_penilaian.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="border border-gray-300 p-2 text-center text-sm">{index + 1}</td>
                                                        <td className="border border-gray-300 p-2 text-sm">{item.kriteria}</td>
                                                        <td className="border border-gray-300 p-2 text-sm">{item.indikator_penilaian}</td>
                                                        <td className="border border-gray-300 p-2 text-center text-sm">{item.bobot}</td>
                                                        <td className="border border-gray-300 p-2 text-center text-sm">{item.skor}</td>
                                                        <td className="border border-gray-300 p-2 text-center text-sm">{item.nilai}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50 font-semibold">
                                                    <td colSpan={5} className="border border-gray-300 p-2 text-right">Total Nilai</td>
                                                    <td className="border border-gray-300 p-2 text-center">{totalNilai}</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-3 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                            <span className="text-gray-600 text-lg font-medium">
                                Kesesuaian Tema
                            </span>

                            <div className="flex flex-col gap-3">
                                {!hasReview ? (
                                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                                        Belum ada review
                                    </div>
                                ) : (
                                    reviewForm.kriteria_kesesuaian_tema.map((item, index) => (
                                        <label
                                            key={index}
                                            className="flex items-start gap-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                disabled
                                                readOnly
                                                className="mt-1"
                                            />
                                            <span className="text-sm">{item.question}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-y-3 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                    <span className="text-gray-600 text-lg font-medium">
                        Keputusan Reviewer
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                        <SelectInput
                            name="keputusan"
                            value={reviewForm.keputusan}
                            options={[
                                { text: 'Diterima', value: 'Diterima' },
                                { text: 'Diterima dengan perbaikan', value: 'Diterima dengan perbaikan' },
                                { text: 'Ditolak', value: 'Ditolak' }
                            ]}
                            icon={faTag}
                            placeholder="Belum ada keputusan"
                            classSpan="col-span-2"
                            disabled={true}
                        />

                        <textarea
                            value={reviewForm.catatan}
                            disabled={true}
                            placeholder="Belum ada catatan reviewer..."
                            className="col-span-2 min-h-[140px] border border-gray-200 rounded-xl p-3 outline-none resize-none bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="w-full grid grid-cols-3 gap-2">
                    <Button variant="secondary" onClick={close}>
                        Kembali
                    </Button>

                    {user?.role === "Ketua LPPM" && !ketuaAlreadyDecided && !isFinished && (
                        <>
                            <Button
                                variant="danger"
                                fontSize="text-lg"
                                onClick={() => triggerTolak(data)}
                                disabled={!isAllReviewed}
                                title={isAllReviewed ? '' : 'Tidak dapat menolak proposal dikarenakan proses review belum lengkap'}
                            >
                                Tolak proposal
                            </Button>

                            <Button
                                fontSize="text-lg"
                                onClick={() => triggerTerima(data)}
                                disabled={!isAllReviewed}
                                title={isAllReviewed ? '' : 'Tidak dapat menerima proposal dikarenakan proses review belum lengkap'}
                            >
                                Terima proposal
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    )
}
