"use client"

import { useState, useRef, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faDownload,
    faFileWord,
    faFilePdf,
    faSpinner,
    faX,
    faCheck,
    faCloudArrowUp,
    faFolderOpen,
    faCalendar,
} from "@fortawesome/free-solid-svg-icons"

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import Button from "@/app/component/Inputs/Button"
import DatePicker from "@/app/component/Inputs/DatePicker"
import Modal from "@/app/component/Modal/Modal"
import Alert from "@/app/component/Alert/Alert"
import { showToast } from "@/app/component/Toast/Toast"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

import {
    updateLaporan,
    generateLaporanAkhir,
    submitPublikasi,
    getLaporanMembers,
    addLaporanMember,
    updateLaporanMember,
    removeLaporanMember,
    reorderLaporanMembers,
    seedLaporanMembers,
} from "@/app/component/Libraries/api/laporan"
import { getLaporanDocuments } from "@/app/component/Libraries/api/logbook"
import { fetchListPublicationCategory } from "@/app/component/Libraries/api/kategoripublikasi"
import { formatToPHPDate } from "@/app/component/Libraries/utils/date"

import ResearcherManager from "@/app/component/Research/ResearchManager"
import RealisasiAnggaranForm from "./RealisasiAnggaranForm"

async function fetchKategoriPublikasiOptions() {
    const categories = await fetchListPublicationCategory()
    const options = []
    for (const cat of categories) {
        if (!cat.is_active) continue
        const ranks = Array.isArray(cat.peringkat) ? cat.peringkat : []
        for (const rank of ranks) {
            const label = `${cat.nama} ${rank}`
            options.push({ text: label, value: label })
        }
    }
    return options
}

export default function PublikasiForm({
    close,
    refresh,
    laporan,
}) {
    const detail = laporan.detail || {}

    const isPenelitian =
        laporan.jenis_penelitian !== "PkM"

    const isGanjil = laporan.semester === "Ganjil"
    const proposal = laporan.proposal || {}

    const defaultInfo = {
        judul_penelitian: detail.judul_penelitian || "",
        target_publikasi: detail.target_publikasi || (isGanjil ? proposal.target_publikasi_gan : proposal.target_publikasi_gen) || "",
        nama_jurnal: detail.nama_jurnal || (isGanjil ? proposal.rencana_judul_publikasi_gan : proposal.rencana_judul_publikasi_gen) || "",
        link_jurnal: detail.link_jurnal || "",

        realisasi_biaya_penelitian: detail.realisasi_biaya_penelitian || (isGanjil ? proposal.ra_biaya_penelitian_gan : proposal.ra_biaya_penelitian_gen) || 0,
        realisasi_biaya_publikasi: detail.realisasi_biaya_publikasi || (isGanjil ? proposal.ra_biaya_publikasi_gan : proposal.ra_biaya_publikasi_gen) || 0,
        realisasi_insentif: detail.realisasi_insentif || (isGanjil ? proposal.ra_insentif_gan : proposal.ra_insentif_gen) || 0,

        tgl_mulai: detail.tgl_mulai ? String(detail.tgl_mulai).slice(0, 10) : "",
        tgl_selesai: detail.tgl_selesai ? String(detail.tgl_selesai).slice(0, 10) : "",
    }

    const [info, setInfo] = useState(defaultInfo)

    const [danaDikembalikan, setDanaDikembalikan] = useState(
        !!detail.dana_dikembalikan
    )

    const [generated, setGenerated] = useState(
        (laporan.dokumen || []).find(
            (d) => d.jenis_dokumen === "Laporan Akhir"
        ) || null
    )

    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const fileInputRef = useRef(null)

    const [loadingInfo, setLoadingInfo] = useState(false)
    const [loadingGenerate, setLoadingGenerate] = useState(false)

    const { loading: submitLoading, submit } = useFormSubmission({
        onSuccess: () => { refresh(); close() }
    })

    const [members, setMembers] = useState([])
    const [loadingMembers, setLoadingMembers] = useState(false)

    const [showRealisasiAnggaran, setShowRealisasiAnggaran] = useState(false)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

    const [step1Done, setStep1Done] = useState(
        !!detail.judul_penelitian
    )
    const [step2Done, setStep2Done] = useState(!!generated?.file_url)

    const [existingFiles, setExistingFiles] = useState([])
    const [selectedExistingFile, setSelectedExistingFile] = useState(null)
    const [useExistingFile, setUseExistingFile] = useState(false)

    const [linkLuaranDrive, setLinkLuaranDrive] = useState(
        detail.link_luaran_drive_url || ""
    )

    useEffect(() => {
        const fetchExistingDocs = async () => {
            try {
                const res = await getLaporanDocuments(laporan.laporan_id)
                const data = res.data?.data
                if (data) {
                    const ganjil = laporan.semester === "Ganjil" ? data.laporan_ganjil : data.laporan_genap
                    if (ganjil?.generated_laporan_akhir) {
                        setExistingFiles([ganjil.generated_laporan_akhir])
                    }
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchExistingDocs()
    }, [laporan])

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoadingMembers(true)
                const res = await getLaporanMembers(laporan.laporan_id)
                if (res.data.status === "success") {
                    const apiMembers = res.data.data || []
                    if (apiMembers.length === 0) {
                        await seedLaporanMembers(laporan.laporan_id)
                        const seeded = await getLaporanMembers(laporan.laporan_id)
                        setMembers(mapApiMembersToLocal(seeded.data.data || []))
                    } else {
                        setMembers(mapApiMembersToLocal(apiMembers))
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoadingMembers(false)
            }
        }
        fetchMembers()
    }, [laporan])

    const handleInfoChange = (e) => {
        setInfo(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleDateRangeChange = (date) => {
        setInfo(prev => ({
            ...prev,
            tgl_mulai: date?.from ? formatToPHPDate(date.from) : "",
            tgl_selesai: date?.to ? formatToPHPDate(date.to) : "",
        }))
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.type !== "application/pdf") {
                showToast("Hanya file PDF yang diperbolehkan.", "error")
                return
            }
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
        e.target.value = ""
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            if (file.type !== "application/pdf") {
                showToast("Hanya file PDF yang diperbolehkan.", "error")
                return
            }
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Step 1: Save research info
    |--------------------------------------------------------------------------
    */

    async function saveInfo() {
        try {
            setLoadingInfo(true)

            const formData = new FormData()
            formData.append("laporan_id", laporan.laporan_id)
            Object.keys(info).forEach(k => formData.append(k, info[k]))

            const res = await updateLaporan(formData)

            if (res.data.status === "success") {
                setStep1Done(true)
                showToast("Informasi penelitian berhasil disimpan.", "success")
                refresh()
            } else {
                showToast(res.data.message || "Gagal menyimpan informasi.", "error")
            }
        }
        catch (err) {
            console.error(err)
            showToast("Gagal menyimpan informasi.", "error")
        }
        finally {
            setLoadingInfo(false)
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Step 2: Generate Laporan Akhir
    |--------------------------------------------------------------------------
    */

    async function handleGenerate() {
        try {
            setLoadingGenerate(true)

            const formData = new FormData()
            formData.append("laporan_id", laporan.laporan_id)

            const res = await generateLaporanAkhir(formData)

            if (res.data.status === "success") {
                setGenerated(res.data.data)
                setStep2Done(true)
                showToast("Laporan akhir berhasil digenerate.", "success")
                refresh()
            } else {
                showToast(res.data.message || "Gagal generate laporan akhir.", "error")
            }
        }
        catch (err) {
            console.error(err)
            showToast("Gagal generate laporan akhir.", "error")
        }
        finally {
            setLoadingGenerate(false)
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Step 3: Submit publikasi with file upload
    |--------------------------------------------------------------------------
    */

    async function handleSubmit() {
        if (!useExistingFile && !selectedFile) {
            showToast("Upload laporan final wajib diisi.", "error")
            return
        }

        const apiCall = () => {
            if (useExistingFile && selectedExistingFile) {
                const formData = new FormData()
                formData.append("laporan_id", laporan.laporan_id)
                formData.append("link_laporan_akhir", selectedExistingFile.file_url)
                formData.append("link_luaran_drive_url", linkLuaranDrive)
                formData.append("dana_dikembalikan", danaDikembalikan ? 1 : 0)
                return updateLaporan(formData)
            } else {
                const formData = new FormData()
                formData.append("laporan_id", laporan.laporan_id)
                formData.append("uploaded_file", selectedFile)
                formData.append("link_luaran_drive_url", linkLuaranDrive)
                formData.append("dana_dikembalikan", danaDikembalikan ? 1 : 0)
                return submitPublikasi(formData)
            }
        }

        await submit(apiCall, {
            successMessage: "Publikasi berhasil disubmit.",
            errorMessage: "Gagal submit publikasi."
        })
    }

    function mapApiMembersToLocal(apiMembers) {
        return apiMembers.map((m, idx) => {
            const isKetua = idx === 0
            let nama = ""
            let avatar = null
            let institusi = null
            let prodi = null

            if (m.role === "Dosen" && m.user) {
                nama = m.user.nama || ""
                avatar = m.user.avatar_url || m.user.avatar || null
            } else if (m.role === "Mahasiswa" && m.mahasiswa) {
                nama = m.mahasiswa.nama || ""
                avatar = m.mahasiswa.avatar_url || m.mahasiswa.avatar || null
            } else if (m.role === "Kolaborator" && m.kolaborator) {
                nama = m.kolaborator.nama || ""
                institusi = m.kolaborator.institusi || null
                avatar = m.kolaborator.avatar_url || m.kolaborator.avatar || null
            }

            return {
                id: m.member_id,
                type: m.role,
                nama,
                avatar,
                institusi,
                prodi,
                ttjp: m.ttjp || "",
                locked: isKetua,
                laporan_member_id: m.laporan_member_id,
            }
        })
    }

    async function handleMembersChange(newMembers) {
        setMembers(newMembers)

        const laporanId = laporan.laporan_id
        const currentIds = newMembers
            .filter(m => m.laporan_member_id)
            .map(m => m.laporan_member_id)

        for (let i = 0; i < newMembers.length; i++) {
            const m = newMembers[i]
            if (m.laporan_member_id) {
                const oldMember = members.find(
                    old => old.laporan_member_id === m.laporan_member_id
                )
                if (oldMember && oldMember.ttjp !== m.ttjp) {
                    try {
                        await updateLaporanMember(m.laporan_member_id, {
                            ttjp: m.ttjp,
                        })
                    } catch (err) {
                        console.error("Failed to update TTJP:", err)
                    }
                }
            } else {
                try {
                    const res = await addLaporanMember({
                        laporan_id: laporanId,
                        member_id: m.id,
                        role: m.type,
                        ttjp: m.ttjp,
                    })
                    if (res.data.status === "success") {
                        newMembers[i] = {
                            ...m,
                            laporan_member_id: res.data.data.laporan_member_id,
                        }
                        setMembers([...newMembers])
                    }
                } catch (err) {
                    console.error("Failed to add member:", err)
                }
            }
        }

        const removedIds = members
            .filter(
                old =>
                    old.laporan_member_id &&
                    !newMembers.some(
                        n => n.laporan_member_id === old.laporan_member_id
                    )
            )
            .map(m => m.laporan_member_id)

        for (const id of removedIds) {
            try {
                await removeLaporanMember(id)
            } catch (err) {
                console.error("Failed to remove member:", err)
            }
        }

        if (removedIds.length > 0 || currentIds.length !== newMembers.length) {
            try {
                const orderIds = newMembers
                    .filter(m => m.laporan_member_id)
                    .map(m => m.laporan_member_id)
                if (orderIds.length > 1) {
                    await reorderLaporanMembers({
                        laporan_id: laporanId,
                        member_ids: orderIds,
                    })
                }
            } catch (err) {
                console.error("Failed to reorder members:", err)
            }
        }
    }

    return (
        <>
            <Modal
                isOpen={true}
                onClose={close}
                title={`Publikasi — Semester ${laporan.semester}`}
                subtitle="Ikuti langkah berikut: simpan data, generate template, lalu upload laporan final."
                maxWidth="max-w-3xl"
                closeOnBackdrop={false}
                footer={
                    <>
                        <Button variant="secondary" onClick={close}>
                            Batal
                        </Button>
                    <Button onClick={() => setShowConfirmSubmit(true)} disabled={submitLoading || (!selectedFile && !selectedExistingFile)}>
                        {submitLoading ? "Mengirim..." : "Submit Publikasi"}
                    </Button>
                    </>
                }
            >
                {/* STEP INDICATORS */}
                <div className="flex items-center gap-2 text-sm pb-4">
                    <div className={`flex items-center gap-1 ${step1Done ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step1Done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            {step1Done ? <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> : "1"}
                        </span>
                        <span>Simpan Data</span>
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className="flex items-center gap-1 text-gray-400">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-gray-100 text-gray-400">
                            2
                        </span>
                        <span>Anggota</span>
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className="flex items-center gap-1 text-gray-400">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-gray-100 text-gray-400">
                            3
                        </span>
                        <span>Realisasi</span>
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className={`flex items-center gap-1 ${step2Done ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step2Done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            {step2Done ? <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> : "4"}
                        </span>
                        <span>Generate</span>
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className={`flex items-center gap-1 ${selectedFile ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${selectedFile ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            {selectedFile ? <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> : "5"}
                        </span>
                        <span>Upload</span>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                {/* STEP 1: INFORMASI PENELITIAN */}
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step1Done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                            {step1Done ? <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> : "1"}
                        </span>
                        <span className="text-gray-600 font-medium">
                            Informasi Penelitian
                        </span>
                    </div>

                    <TextInput
                        name="judul_penelitian"
                        placeholder="Judul Penelitian"
                        tag="Judul Penelitian"
                        value={info.judul_penelitian}
                        onChange={handleInfoChange}
                    />

                    <TextInput
                        name="nama_jurnal"
                        placeholder="Nama Jurnal"
                        tag="Nama Jurnal"
                        value={info.nama_jurnal}
                        onChange={handleInfoChange}
                    />

                    <TextInput
                        name="link_jurnal"
                        placeholder="https://..."
                        tag="Link Jurnal"
                        value={info.link_jurnal}
                        onChange={handleInfoChange}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <SelectInput
                            name="target_publikasi"
                            value={info.target_publikasi}
                            onChange={handleInfoChange}
                            dataSource={fetchKategoriPublikasiOptions}
                            placeholder="Pilih kategori publikasi"
                            tag="Kategori Publikasi"
                        />

                        <DatePicker
                            mode="range"
                            date={
                                info.tgl_mulai || info.tgl_selesai
                                    ? {
                                        from: info.tgl_mulai ? new Date(info.tgl_mulai + "T00:00:00") : undefined,
                                        to: info.tgl_selesai ? new Date(info.tgl_selesai + "T00:00:00") : undefined,
                                    }
                                    : null
                            }
                            dateUpdate={handleDateRangeChange}
                            icon={faCalendar}
                            tag="Masa Pelaksanaan"
                            placeholder="Pilih tanggal mulai dan selesai"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <TextInput
                            name="realisasi_biaya_penelitian"
                            type="number"
                            placeholder="Realisasi Biaya Penelitian"
                            tag="Realisasi Biaya Penelitian"
                            value={info.realisasi_biaya_penelitian}
                            onChange={handleInfoChange}
                        />

                        <TextInput
                            name="realisasi_biaya_publikasi"
                            type="number"
                            placeholder="Realisasi Biaya Publikasi"
                            tag="Realisasi Biaya Publikasi"
                            value={info.realisasi_biaya_publikasi}
                            onChange={handleInfoChange}
                        />

                        <TextInput
                            name="realisasi_insentif"
                            type="number"
                            placeholder="Realisasi Insentif"
                            tag="Realisasi Insentif"
                            value={info.realisasi_insentif}
                            onChange={handleInfoChange}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={saveInfo} disabled={loadingInfo}>
                            {loadingInfo ? "Menyimpan..." : "Simpan Informasi"}
                        </Button>
                    </div>
                </div>

                {/* STEP 2: ANGGOTA PENELITI (LAPORAN) */}
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gray-100 text-gray-500">
                            2
                        </span>
                        <span className="text-gray-600 font-medium">
                            Anggota Peneliti
                        </span>
                    </div>

                    <p className="text-sm text-gray-500">
                        Daftar anggota peneliti untuk laporan ini. Data disalin dari proposal saat pertama kali dibuka.
                        Ketua peneliti (posisi #1) terkunci dan tidak dapat dihapus.
                    </p>

                    {loadingMembers ? (
                        <div className="flex items-center justify-center py-4 text-gray-400">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                            Memuat anggota...
                        </div>
                    ) : (
                        <ResearcherManager
                            value={members}
                            onChange={handleMembersChange}
                            currentUser={
                                members.length > 0 ? members[0] : null
                            }
                        />
                    )}
                </div>

                {/* STEP 3: REALISASI ANGGARAN */}
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gray-100 text-gray-500">
                            3
                        </span>
                        <span className="text-gray-600 font-medium">
                            Realisasi Anggaran
                        </span>
                    </div>

                    <p className="text-sm text-gray-500">
                        Kelola item penggunaan anggaran untuk laporan akhir.
                    </p>

                    <div className="flex justify-end">
                        <Button
                            onClick={() => setShowRealisasiAnggaran(true)}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Kelola Realisasi Anggaran
                        </Button>
                    </div>
                </div>

                {/* STEP 4: GENERATE LAPORAN AKHIR */}
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step2Done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                            {step2Done ? <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> : "4"}
                        </span>
                        <span className="text-gray-600 font-medium">
                            Generate Template Laporan
                        </span>
                    </div>

                    <p className="text-sm text-gray-500">
                        Generate template laporan akhir, download, isi data,
                        lalu gabungkan dengan laporan Anda menjadi satu file PDF.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={handleGenerate}
                            disabled={loadingGenerate}
                        >
                            <FontAwesomeIcon
                                icon={loadingGenerate ? faSpinner : faFileWord}
                                className={`mr-2 ${loadingGenerate ? "animate-spin" : ""}`}
                            />
                            Generate Template
                        </Button>

                        {generated?.file_url &&
                            <a
                                href={generated.file_url}
                                download
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                                <FontAwesomeIcon icon={faDownload} />
                                {generated.nama_file}
                            </a>
                        }
                    </div>
                </div>

                {/* STEP 5: UPLOAD LAPORAN FINAL */}
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${(selectedFile || selectedExistingFile) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                            {(selectedFile || selectedExistingFile) ? <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> : "5"}
                        </span>
                        <span className="text-gray-600 font-medium">
                            Upload Laporan Final
                        </span>
                    </div>

                    <p className="text-sm text-gray-500">
                        Pilih file yang sudah diupload sebelumnya atau upload file baru.
                    </p>

                    {/* Option: Use existing file or upload new */}
                    <div className="flex flex-col gap-2">
                        {existingFiles.length > 0 && (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="fileSource"
                                    checked={useExistingFile}
                                    onChange={() => {
                                        setUseExistingFile(true)
                                        setSelectedFile(null)
                                        setPreviewUrl(null)
                                    }}
                                />
                                <FontAwesomeIcon icon={faFolderOpen} className="text-gray-400" />
                                Gunakan file yang sudah diupload
                            </label>
                        )}

                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="fileSource"
                                checked={!useExistingFile}
                                onChange={() => {
                                    setUseExistingFile(false)
                                    setSelectedExistingFile(null)
                                }}
                            />
                            <FontAwesomeIcon icon={faCloudArrowUp} className="text-gray-400" />
                            Upload file baru
                        </label>
                    </div>

                    {/* Existing file selection */}
                    {useExistingFile && existingFiles.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                            {existingFiles.map((file) => (
                                <div
                                    key={file.dokumen_id}
                                    onClick={() => setSelectedExistingFile(file)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                        ${selectedExistingFile?.dokumen_id === file.dokumen_id
                                            ? "border-green-400 bg-green-50"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <FontAwesomeIcon
                                        icon={faFilePdf}
                                        className={`text-lg ${selectedExistingFile?.dokumen_id === file.dokumen_id ? "text-green-500" : "text-gray-400"}`}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{file.nama_file}</p>
                                        <p className="text-xs text-gray-400">
                                            {file.file_url ? "Tersedia" : "Tidak tersedia"}
                                        </p>
                                    </div>
                                    {selectedExistingFile?.dokumen_id === file.dokumen_id && (
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New file upload */}
                    {!useExistingFile && (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed
                                transition-all duration-200 cursor-pointer
                                ${selectedFile
                                    ? "border-green-400 bg-green-50"
                                    : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                                }
                            `}
                        >
                            {selectedFile ? (
                                <>
                                    <FontAwesomeIcon icon={faFilePdf} className="text-green-500 text-2xl" />
                                    <span className="text-sm font-medium text-green-700">
                                        {selectedFile.name}
                                    </span>
                                    <span className="text-xs text-green-600">
                                        Klik untuk mengganti file
                                    </span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-gray-400 text-2xl" />
                                    <span className="text-sm text-gray-500">
                                        Klik atau seret file PDF ke sini
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {!isPenelitian && (
                        <label className="flex items-center gap-2 text-sm cursor-pointer mt-1">
                            <input
                                type="checkbox"
                                checked={danaDikembalikan}
                                onChange={(e) =>
                                    setDanaDikembalikan(e.target.checked)
                                }
                            />
                            Apakah ada dana yang harus dikembalikan?
                        </label>
                    )}
                </div>

                {/* STEP 6: LINK DOKUMEN TAMBAHAN */}
                <div className="flex flex-col gap-2 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gray-100 text-gray-500">
                            6
                        </span>
                        <span className="text-gray-600 font-medium">
                            Dokumen Tambahan (Opsional)
                        </span>
                    </div>

                    <p className="text-sm text-gray-500">
                        Upload dokumen tambahan (HKI, Buku, Poster, Video) ke Google Drive, 
                        lalu tempelkan link folder sharernya di bawah ini.
                    </p>

                    <TextInput
                        name="link_luaran_drive_url"
                        placeholder="https://drive.google.com/drive/folders/..."
                        tag="Link Google Drive Dokumen Tambahan"
                        value={linkLuaranDrive}
                        onChange={(e) => setLinkLuaranDrive(e.target.value)}
                    />
                </div>
                </div>
            </Modal>

            {/* REALISASI ANGGARAN MODAL */}
            {showRealisasiAnggaran && (
                <RealisasiAnggaranForm
                    close={() => setShowRealisasiAnggaran(false)}
                    refresh={refresh}
                    laporan={laporan}
                />
            )}

            {showConfirmSubmit && (
                <Alert
                    alertType="warning"
                    title="Submit Publikasi"
                    msg="Apakah Anda yakin ingin submit publikasi ini? Laporan akan masuk tahap review."
                    onCancel={() => setShowConfirmSubmit(false)}
                    onAccept={() => {
                        handleSubmit()
                    }}
                    acceptText="Submit"
                    isConfirmation={true}
                    withBackground={true}
                    loading={submitLoading}
                />
            )}
        </>
    )
}
