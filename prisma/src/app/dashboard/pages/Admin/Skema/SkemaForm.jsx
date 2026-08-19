"use client"

import { useState, useEffect } from "react"
import {
    faBookOpen,
    faCalendar,
    faTag
} from "@fortawesome/free-solid-svg-icons"

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"

import { addSkema, updateSkema } from "@/app/component/Libraries/api/skema"
import { formatToPHPDate } from "@/app/component/Libraries/utils/date"
import { useValidation } from "@/app/component/Libraries/hooks/useValidation"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function FormSkema({ refresh, close, data, isEdit }){
    const defaultForm = {
        nama_skema: "",
        tahun_ajaran: "",
        status: "Draft",
    }

    const [form, setForm] = useState(defaultForm)
    const { errors, validate, clearFieldError, clearAllErrors } = useValidation()
    const { loading, submit } = useFormSubmission({
        onSuccess: () => {
            refresh()
            close()
        }
    })

    const statusOptions = [
        { text: "Draft", value: "Draft" },
        { text: "Aktif", value: "Aktif" },
        { text: "Selesai", value: "Selesai" },
    ]

    useEffect(() => {
        if(isEdit && data){
            setForm(prev => ({ ...prev, ...data }))
        } else {
            setForm(defaultForm)
        }
        clearAllErrors()
    }, [isEdit, data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        clearFieldError(name)
    }

    async function sendData(){
        const { valid } = validate({
            nama_skema: ["required"],
            tahun_ajaran: ["required"],
        }, form)

        if (!valid) return

        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => {
            if(key === "tgl_mulai" || key === "tgl_selesai"){
                value = value ? formatToPHPDate(value) : ""
            }
            formData.append(key, value)
        })

        if(isEdit){
            formData.append('skema_id', data.skema_id)
        }

        await submit(
            () => isEdit ? updateSkema(formData) : addSkema(formData),
            {
                successMessage: `Data skema berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`,
                errorMessage: `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} data skema.`,
            }
        )
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={isEdit ? "Update Skema" : "Tambah Skema Baru"}
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <Button onClick={sendData} disabled={loading}>
                    {loading ? "Menyimpan..." : isEdit ? "Update" : "Tambahkan"}
                </Button>
            }
        >
            <div className="grid grid-cols-2 gap-2">
                <TextInput
                    name="nama_skema"
                    type="text"
                    placeholder="Masukkan nama skema"
                    tag="Nama Skema"
                    icon={faBookOpen}
                    value={form.nama_skema}
                    onChange={handleChange}
                    className="col-span-2"
                    required
                    error={errors.nama_skema}
                />

                <TextInput
                    name="tahun_ajaran"
                    type="text"
                    placeholder="Cth: 2026/2027"
                    tag="Tahun Ajaran"
                    icon={faCalendar}
                    value={form.tahun_ajaran}
                    onChange={handleChange}
                    required
                    error={errors.tahun_ajaran}
                />

                <SelectInput
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={statusOptions}
                    icon={faTag}
                    tag="Status"
                    placeholder="Pilih status skema"
                />
            </div>
        </Modal>
    )
}
