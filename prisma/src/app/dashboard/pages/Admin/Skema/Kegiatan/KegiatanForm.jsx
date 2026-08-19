"use client"

import { useState, useEffect } from "react"
import { faCalendar, faTag } from '@fortawesome/free-solid-svg-icons'

import SelectInput from "@/app/component/Inputs/SelectInput"
import Button from "@/app/component/Inputs/Button"
import DatePicker from "@/app/component/Inputs/DatePicker"
import Modal from "@/app/component/Modal/Modal"

import { formatToPHPDate } from "@/app/component/Libraries/utils/date"
import { updateKegiatan } from "@/app/component/Libraries/api/kegiatan"
import { kegiatanStatusOptions } from "@/app/component/Libraries/options/selections"
import { useValidation } from "@/app/component/Libraries/hooks/useValidation"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function FormKegiatan({ refresh, close, data, isEdit }){
    const defaultForm = {
        tgl_mulai: new Date(),
        tgl_selesai: new Date(),
        status: "",
    }

    const [form, setForm] = useState(defaultForm)
    const { errors, validate, clearAllErrors } = useValidation()
    const { loading, submit } = useFormSubmission({
        onSuccess: () => {
            refresh()
            close()
        }
    })

    useEffect(() => {
        if (isEdit && data) {
            const displayStatusMap = {
                'Belum dibuka': 'Ditutup',
                'Terbuka': 'Dibuka',
                'Selesai': 'Ditutup'
            }
            setForm(prev => ({
                ...prev,
                ...data,
                status: displayStatusMap[data.status] || data.status
            }))
        } else {
            setForm(defaultForm)
        }
        clearAllErrors()
    }, [isEdit, data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleRangeChange = (range) => {
        setForm(prev => ({
            ...prev,
            tgl_mulai: range?.from ?? "",
            tgl_selesai: range?.to ?? ""
        }))
    }

    async function sendData(){
        const { valid } = validate({
            status: ["required"],
        }, form)

        if (!valid) return

        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => {
            if (key === 'status') {
                const statusMap = {
                    'Ditutup': 'Belum dibuka',
                    'Dibuka': 'Terbuka'
                }
                formData.append(key, statusMap[value] || value)
            } else {
                formData.append(key, value)
            }
        })

        await submit(
            () => updateKegiatan(formData),
            {
                successMessage: `Data kegiatan berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`,
                errorMessage: `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} data kegiatan.`,
            }
        )
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={isEdit ? 'Update Kegiatan' : 'Tambah Kegiatan Baru'}
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <Button onClick={sendData} disabled={loading}>
                    {loading ? "Menyimpan..." : isEdit ? 'Update' : 'Tambahkan'}
                </Button>
            }
        >
            <div className="grid grid-cols-2 gap-2">
                <DatePicker
                    mode="range"
                    date={{from: form.tgl_mulai, to: form.tgl_selesai}}
                    dateUpdate={handleRangeChange}
                    icon={faCalendar}
                    placeholder={"Tentukan tanggal mulai dan selesai"}
                    className="col-span-2"
                />

                <SelectInput
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={kegiatanStatusOptions}
                    icon={faTag}
                    tag="Status"
                    placeholder="Pilih status penelitian"
                    classSpan="col-span-2"
                    required
                    error={errors.status}
                />
            </div>
        </Modal>
    )
}
