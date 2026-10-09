"use client"

import { useState, useEffect } from "react"

import TextInput from "@/app/component/Inputs/TextInput"
import DatePicker from "@/app/component/Inputs/DatePicker"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"
import { addLogbook, updateLogbook } from "@/app/component/Libraries/api/logbook"
import { useUserStore } from "@/app/stores/useUserStore"
import { formatToPHPDate } from "@/app/component/Libraries/utils/date"
import { faCalendar } from "@fortawesome/free-solid-svg-icons"

export default function LogbookFormDosen({
    close,
    refresh,
    laporan,
    editData = null
}) {
    const user = useUserStore(state => state.user)
    const isEdit = !!editData

    const defaultForm = {
        laporan_id: laporan.laporan_id,
        judul: "",
        deskripsi: "",
        tgl_kegiatan: "",
        tgl_kegiatan_end: "",
        lampiran_drive_url: "",
    }

    const [form, setForm] = useState(defaultForm)
    const [urlError, setUrlError] = useState("")

    const { loading, submit } = useFormSubmission({
        onSuccess: () => { refresh(); close() }
    })

    useEffect(() => {
        if (editData) {
            setForm({
                laporan_id: laporan.laporan_id,
                judul: editData.judul || "",
                deskripsi: editData.deskripsi || "",
                tgl_kegiatan: editData.tgl_kegiatan || "",
                tgl_kegiatan_end: editData.tgl_kegiatan_end || "",
                lampiran_drive_url: editData.lampiran_drive_url || "",
            })
        }
    }, [editData, laporan])

    const isValidDriveUrl = (url) => {
        if (!url) return true
        try {
            const parsed = new URL(url)
            return parsed.hostname === "drive.google.com"
        } catch {
            return false
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))

        if (name === "lampiran_drive_url") {
            if (value && !isValidDriveUrl(value)) {
                setUrlError("URL harus berupa link Google Drive yang valid")
            } else {
                setUrlError("")
            }
        }
    }

    const handleSubmit = async () => {
        if (form.lampiran_drive_url && !isValidDriveUrl(form.lampiran_drive_url)) {
            setUrlError("URL harus berupa link Google Drive yang valid")
            return
        }

        const formData = new FormData()
        Object.keys(form).forEach(k => formData.append(k, form[k]))
        formData.append('user_id', user?.id)

        await submit(
            () => isEdit ? updateLogbook(editData.logbook_id, formData) : addLogbook(formData),
            { successMessage: "Logbook berhasil disimpan.", errorMessage: "Gagal menyimpan logbook." }
        )
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={isEdit ? "Edit Logbook" : "Tambah Logbook"}
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="secondary" onClick={close}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || (form.lampiran_drive_url && !isValidDriveUrl(form.lampiran_drive_url))}>
                        Simpan
                    </Button>
                </>
            }
        >
            {/* FORM */}
            <div className="grid grid-cols-2 gap-2">
                <TextInput
                    name="judul"
                    placeholder="Judul kegiatan"
                    tag="Judul"
                    value={form.judul}
                    onChange={handleChange}
                />

                <DatePicker
                    date={form.tgl_kegiatan ? { from: new Date(form.tgl_kegiatan), to: form.tgl_kegiatan_end ? new Date(form.tgl_kegiatan_end) : new Date(form.tgl_kegiatan) } : null}
                    tag="Tanggal Kegiatan"
                    placeholder="Pilih tanggal"
                    icon={faCalendar}
                    mode="range"
                    dateUpdate={(date) => setForm(prev => ({
                        ...prev,
                        tgl_kegiatan: date?.from ? formatToPHPDate(date.from) : "",
                        tgl_kegiatan_end: date?.to && date.to !== date.from ? formatToPHPDate(date.to) : "",
                    }))}
                />

                <div className="col-span-2">
                    <TextInput
                        name="deskripsi"
                        placeholder="Deskripsi kegiatan"
                        tag="Deskripsi Kegiatan"
                        value={form.deskripsi}
                        onChange={handleChange}
                        isTextArea
                    />
                </div>

                <div className="col-span-2">
                    <TextInput
                        name="lampiran_drive_url"
                        placeholder="Dokumen pendukung (link Google Drive, opsional)"
                        tag="Dokumen Pendukung"
                        value={form.lampiran_drive_url}
                        onChange={handleChange}
                    />
                    {urlError && (
                        <p className="text-red-500 text-sm mt-1">{urlError}</p>
                    )}
                </div>
            </div>
        </Modal>
    )
}