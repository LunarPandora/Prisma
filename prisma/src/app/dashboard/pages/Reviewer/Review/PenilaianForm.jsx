"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faTag, faEye, faPencil, faBook, faRupiahSign } from '@fortawesome/free-solid-svg-icons'

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import Modal from "@/app/component/Modal/Modal"

import { generatePDFPreview, getPDFPageCount, getFileMeta, estimateReadingTime } from "@/app/component/Libraries/utils/pdfPreview"

import { useUserStore } from "@/app/stores/useUserStore";
import Button from "@/app/component/Inputs/Button"
import UserTag from "@/app/component/Tags/UserTag"
import { targetPublikasiOptions } from "@/app/component/Libraries/options/selections"
import { uploadReview } from "@/app/component/Libraries/api/review"
import { showToast } from "@/app/component/Toast/Toast"

export default function FormPenilaianReviewer({ refresh, close, data }){
    const isLaporan = !!data?.laporan_id

    const defaultForm = {
        penugasan_id: "",
        proposal_id: "",
        laporan_id: "",
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
    const [fileMetadata, setFileMetadata] = useState(null)
    const [estimateTime, setEstimateTime] = useState(null)
    const [pageCount, setPageCount] = useState(0)

    const [loadingFile, setLoadingFile] = useState(false)
    const [existingFile, setExistingFile] = useState(null)

    const [reviewLoading, setReviewLoading] = useState(false)

    const [reviewForm, setReviewForm] = useState({
        keputusan: "",
        catatan: "",
        kriteria_kesesuaian_tema: [],
        kriteria_penilaian: []
    })

    const user = useUserStore(state => state.user)
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

    function formatNumber(number) {
        return new Intl.NumberFormat('id-ID').format(number)
    }

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

useEffect(() => {        
    if (data?.dokumen) {
        const docType = isLaporan ? 'Dokumen Laporan Final' : 'Dokumen Proposal'
        let doc = data.dokumen.find((d) => d.jenis_dokumen == docType)
        if (!doc) return

        loadExistingFile(doc.file_url, doc.current_version?.nama_file || doc.nama_file)
        
        setForm(prev => ({
            ...prev,
            'local_file_url': doc.file_url,
        }))
    }
}, [data])

    useEffect(() => {
        if (!data) return

        /*
        |--------------------------------------------------------------------------
        | Load Kriteria Penilaian
        |--------------------------------------------------------------------------
        */

        const mappedPenilaian =
            (data?.kriteria_penilaian || []).map((item) => ({
                ...item,
                skor: 1,
                nilai: Number(item.bobot) * 1
            }))

        /*
        |--------------------------------------------------------------------------
        | Load Kesesuaian Tema
        |--------------------------------------------------------------------------
        */

        const mappedTema =
            (data?.kriteria_kesesuaian_tema || []).map((item) => ({
                question: item.question,
                checked: false
            }))

        setReviewForm(prev => ({
            ...prev,
            kriteria_penilaian: mappedPenilaian,
            kriteria_kesesuaian_tema: mappedTema
        }))

    }, [data])

    const members = isLaporan
        ? (data.members || []).map((item) => ({
            nama: item.nama,
            unique_id: item.unique_id,
            avatar_url: item.avatar,
            role: item.role,
        }))
        : [
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

    const updateSkor = (index, skor) => {
        const safeSkor =
            Math.min(
                5,
                Math.max(
                    1,
                    parseInt(skor) || 1
                )
            )

        const updated =
            reviewForm.kriteria_penilaian.map((item, i) => {

                if (i !== index) return item

                return {
                    ...item,
                    skor: safeSkor,
                    nilai:
                        Number(item.bobot) *
                        safeSkor
                }
            })

        setReviewForm(prev => ({
            ...prev,
            kriteria_penilaian: updated
        }))
    }

    const toggleTema = (index) => {
        const updated =
            reviewForm.kriteria_kesesuaian_tema.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        checked: !item.checked
                    }
                    : item
            )

        setReviewForm(prev => ({
            ...prev,
            kriteria_kesesuaian_tema: updated
        }))
    }

    const totalNilai =
        reviewForm.kriteria_penilaian.reduce(
            (sum, item) =>
                sum + (Number(item.nilai) || 0),
            0
        )

    async function submitReview(){
        try{
            setReviewLoading(true)
            const formData = new FormData()

            formData.append(
                'penugasan_id',
                data.penugasan_id
            )

            if (!isLaporan) {
                formData.append(
                    'proposal_id',
                    data.proposal_id
                )
            }

            formData.append(
                'keputusan',
                reviewForm.keputusan
            )

            formData.append(
                'catatan',
                reviewForm.catatan
            )

            formData.append(
                'kriteria_penilaian',
                JSON.stringify(
                    reviewForm.kriteria_penilaian
                )
            )

            formData.append(
                'kriteria_kesesuaian_tema',
                JSON.stringify(
                    reviewForm.kriteria_kesesuaian_tema
                )
            )

            const res = await uploadReview(formData)

            if (res.data.status == 'success'){ 
                showToast("Review berhasil disubmit.", "success")
                refresh()
                close()
            }
            else {
                showToast(err.message || "Gagal submit review.", "error")
            }
        }
        catch(err){
            showToast(err.message || "Gagal submit review.", "error")

            console.error(err)
        }
        finally{
            setReviewLoading(false)
        }
    }

    return (
        <Modal isOpen={true} onClose={close} title={isLaporan ? "Review Laporan" : "Review Proposal"} maxWidth="max-w-6xl" closeOnBackdrop={false}
            footer={
                <>
                    <Button
                        fontSize="text-lg"
                        variant="secondary"
                        onClick={close}
                    >
                        Kembali
                    </Button>

                    <Button
                        fontSize="text-lg"
                        onClick={submitReview}
                        disabled={reviewLoading}
                    >
                        Submit Review
                    </Button>
                </>
            }
        >
            <div
                key="form_proposal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 w-full"
            >
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-center gap-2 border-2 border-gray-400 rounded-md p-4 border-dashed h-62 relative overflow-hidden">
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
                                    {loadingFile ? 
                                        <div className="flex w-full items-center justify-center gap-3">
                                            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-gray-600 animate-spin" />
                                        </div>
                                    :
                                        <div className="flex w-full items-center justify-center gap-3">
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
                                        </div>
                                    }
                            </div>
                        }
                    </div>

                    <div className="grid grid-cols-2 gap-2 h-fit">
                        {!isLaporan ? (
                            <>
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

                                <SelectInput
                                    name="target_publikasi_gan"
                                    value={form.target_publikasi_gan}
                                    onChange={handleChange}
                                    options={targetPublikasiOptions}
                                    icon={faBook}
                                    disabled={true}
                                    placeholder="Target publikasi (ganjil)"
                                />

                                <SelectInput
                                    name="target_publikasi_gen"
                                    value={form.target_publikasi_gen}
                                    onChange={handleChange}
                                    options={targetPublikasiOptions}
                                    icon={faBook}
                                    disabled={true}
                                    placeholder="Target publikasi (genap)"
                                />
                            </>
                        ) : (
                            <>
                                <TextInput
                                    name="judul_penelitian"
                                    type="text"
                                    placeholder="Judul Penelitian"
                                    icon={faPencil}
                                    value={data?.detail?.judul_penelitian || ""}
                                    disabled={true}
                                    className={'col-span-2'}
                                />

                                <TextInput
                                    name="nama_jurnal"
                                    type="text"
                                    placeholder="Nama Jurnal"
                                    icon={faBook}
                                    value={data?.detail?.nama_jurnal || ""}
                                    disabled={true}
                                    className={'col-span-2'}
                                />

                                <div className="col-span-2 flex flex-col gap-1">
                                    <span className="text-sm text-gray-500">Link Jurnal</span>
                                    {data?.detail?.link_jurnal ? (
                                        <a
                                            href={data.detail.link_jurnal}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline break-all"
                                        >
                                            {data.detail.link_jurnal}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">-</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                        <span className="text-gray-600 text-md font-medium text-lg">
                            Anggaran
                        </span>

                        {isLaporan ? (
                            <div className="w-full overflow-x-auto">
                                {(() => {
                                    const isGanjil = data?.semester === 'Ganjil'
                                    return (
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 p-2 text-sm text-left">
                                                        Kategori
                                                    </th>
                                                    <th className="border border-gray-300 p-2 text-sm text-right">
                                                        Rencana
                                                    </th>
                                                    <th className="border border-gray-300 p-2 text-sm text-right">
                                                        Realisasi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-gray-300 p-2 text-sm">
                                                        Biaya Penelitian
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm text-right">
                                                        Rp {formatNumber(isGanjil ? (data?.proposal?.ra_biaya_penelitian_gan || 0) : (data?.proposal?.ra_biaya_penelitian_gen || 0))}
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm text-right">
                                                        Rp {formatNumber(data?.detail?.realisasi_biaya_penelitian || 0)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 p-2 text-sm">
                                                        Biaya Publikasi
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm text-right">
                                                        Rp {formatNumber(isGanjil ? (data?.proposal?.ra_biaya_publikasi_gan || 0) : (data?.proposal?.ra_biaya_publikasi_gen || 0))}
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm text-right">
                                                        Rp {formatNumber(data?.detail?.realisasi_biaya_publikasi || 0)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 p-2 text-sm">
                                                        Anggaran Insentif
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm text-right">
                                                        Rp {formatNumber(isGanjil ? (data?.proposal?.ra_insentif_gan || 0) : (data?.proposal?.ra_insentif_gen || 0))}
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm text-right">
                                                        Rp {formatNumber(data?.detail?.realisasi_insentif || 0)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )
                                })()}
                            </div>
                        ) : (
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
                        )}
                    </div>

                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                        <span className="text-gray-600 text-md font-medium text-lg">
                            Peneliti yang terlibat
                        </span>

                        <div className="w-full grid grid-cols-2 col-span-2 gap-2 h-fit">
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

                    <div className="flex flex-col gap-y-3 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                        <span className="text-gray-600 text-md font-medium text-lg">
                            Kriteria Penilaian Reviewer
                        </span>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-sm w-14">
                                            No
                                        </th>

                                        <th className="border border-gray-300 p-2 text-sm">
                                            Kriteria
                                        </th>

                                        <th className="border border-gray-300 p-2 text-sm">
                                            Indikator Penilaian
                                        </th>

                                        <th className="border border-gray-300 p-2 text-sm w-24">
                                            Bobot
                                        </th>

                                        <th className="border border-gray-300 p-2 text-sm w-28">
                                            Skor
                                        </th>

                                        <th className="border border-gray-300 p-2 text-sm w-28">
                                            Nilai
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        reviewForm.kriteria_penilaian.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 p-2 text-center text-sm">
                                                    {index + 1}
                                                </td>

                                                <td className="border border-gray-300 p-2 text-sm align-top">
                                                    {item.kriteria}
                                                </td>

                                                <td className="border border-gray-300 p-2 text-sm align-top">
                                                    {item.indikator_penilaian}
                                                </td>

                                                <td className="border border-gray-300 p-2 text-center text-sm">
                                                    {item.bobot}
                                                </td>

                                                <td className="border border-gray-300 p-2">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={item.skor}
                                                        onChange={(e) =>
                                                            updateSkor(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyDown={(e) => {

                                                            /*
                                                            |--------------------------------------------------------------------------
                                                            | Allow Control Keys
                                                            |--------------------------------------------------------------------------
                                                            */

                                                            const allowedKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'ArrowLeft',
                                                                'ArrowRight'
                                                            ]

                                                            if (allowedKeys.includes(e.key)) {
                                                                return
                                                            }

                                                            /*
                                                            |--------------------------------------------------------------------------
                                                            | Only Allow 1 - 5
                                                            |--------------------------------------------------------------------------
                                                            */

                                                            if (!['1', '2', '3', '4', '5'].includes(e.key)) {
                                                                e.preventDefault()
                                                            }
                                                        }}
                                                        onFocus={(e) => e.target.select()}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) {
                                                                updateSkor(index, 1)
                                                            }
                                                        }}
                                                        className="
                                                            w-full
                                                            border border-gray-200
                                                            rounded-md
                                                            px-2 py-1
                                                            text-sm
                                                            outline-none
                                                            text-center
                                                        "
                                                    />
                                                </td>

                                                <td className="border border-gray-300 p-2 text-center text-sm font-medium">
                                                    {item.nilai}
                                                </td>
                                            </tr>
                                        ))
                                    }

                                    <tr className="bg-gray-50 font-semibold">
                                        <td
                                            colSpan={5}
                                            className="border border-gray-300 p-2 text-right"
                                        >
                                            Total Nilai
                                        </td>

                                        <td className="border border-gray-300 p-2 text-center">
                                            {totalNilai}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-y-3 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                    <span className="text-gray-600 text-md font-medium text-lg">
                        Kesesuaian Tema
                    </span>

                    <div className="flex flex-col gap-3">
                        {
                            reviewForm.kriteria_kesesuaian_tema.map((item, index) => (
                                <label
                                    key={index}
                                    className="
                                        flex items-start gap-3
                                        border border-gray-200
                                        rounded-lg
                                        p-3
                                        hover:bg-gray-50
                                        cursor-pointer
                                    "
                                >
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={() => toggleTema(index)}
                                        className="mt-1"
                                    />

                                    <span className="text-sm">
                                        {item.question}
                                    </span>
                                </label>
                            ))
                        }
                    </div>
                </div>

                <div className="flex flex-col gap-y-3 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                    <span className="text-gray-600 text-md font-medium text-lg">
                        Keputusan Reviewer
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                        <SelectInput
                            name="keputusan"
                            value={reviewForm.keputusan}
                            onChange={(e) =>
                                setReviewForm(prev => ({
                                    ...prev,
                                    keputusan: e.target.value
                                }))
                            }
                            options={[
                                {
                                    text: 'Diterima',
                                    value: 'Diterima'
                                },
                                {
                                    text: 'Diterima dengan perbaikan',
                                    value: 'Diterima dengan perbaikan'
                                },
                                {
                                    text: 'Ditolak',
                                    value: 'Ditolak'
                                }
                            ]}
                            icon={faTag}
                            placeholder="Pilih keputusan reviewer"
                            classSpan="col-span-2"
                        />

                        <textarea
                            value={reviewForm.catatan}
                            onChange={(e) =>
                                setReviewForm(prev => ({
                                    ...prev,
                                    catatan: e.target.value
                                }))
                            }
                            placeholder="Catatan reviewer..."
                            className="
                                col-span-2
                                min-h-[140px]
                                border border-gray-200
                                rounded-xl
                                p-3
                                outline-none
                                resize-none
                                focus:outline-none focus:ring-2 focus:ring-black/20
                            "
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}
