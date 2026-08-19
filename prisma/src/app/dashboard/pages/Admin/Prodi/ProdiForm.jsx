"use client"

import { useState, useEffect } from "react"
import { faTable, faGraduationCap } from '@fortawesome/free-solid-svg-icons'

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"

import { addProdi, updateProdi } from "@/app/component/Libraries/api/prodi"
import { fetchUsers } from "@/app/component/Libraries/api/users"
import { useValidation } from "@/app/component/Libraries/hooks/useValidation"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function FormProdi({ refresh, close, data, isEdit }){
    const defaultForm = {
        prodi_id: "",
        nama_prodi: "",
        kaprodi_id: "",
    }

    const [form, setForm] = useState(defaultForm)
    const { errors, validate, setFieldError, clearFieldError, clearAllErrors } = useValidation()
    const { loading, submit } = useFormSubmission({
        onSuccess: () => {
            refresh()
            close()
        },
        onError: (err, fieldErrors) => {
            if (fieldErrors) {
                Object.entries(fieldErrors).forEach(([field, msg]) => {
                    setFieldError(field, msg)
                })
            }
        }
    })

    useEffect(() => {
        if (isEdit && data) {
            setForm(prev => ({
                ...prev,
                ...data,
            }))
        } else {
            setForm(defaultForm)
        }
        clearAllErrors()
    }, [isEdit, data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
        clearFieldError(name)
    }

    async function sendData(){
        const { valid } = validate({
            nama_prodi: ["required"],
            kaprodi_id: ["required"],
        }, form)

        if (!valid) return

        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "" && value !== "-") {
                if (typeof value === "object") {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, value)
                }
            }
        })

        await submit(
            () => isEdit ? updateProdi(formData) : addProdi(formData),
            {
                successMessage: `Data prodi berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`,
                errorMessage: `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} data prodi.`,
            }
        )
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={isEdit ? 'Update Prodi' : 'Tambah Prodi Baru'}
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <Button onClick={sendData} disabled={loading}>
                    {loading ? "Menyimpan..." : isEdit ? 'Update' : 'Tambahkan'}
                </Button>
            }
        >
            <div className="grid grid-cols-2 gap-2">
                <TextInput
                    name="nama_prodi" 
                    type="text"
                    placeholder="Masukkan nama prodi"
                    tag="Nama Prodi"
                    icon={faTable}
                    value={form.nama_prodi}
                    onChange={handleChange}
                    className="col-span-2"
                    required
                    error={errors.nama_prodi}
                />

                <SelectInput
                    name="kaprodi_id"
                    value={form.kaprodi_id}
                    onChange={handleChange}
                    dataSource={fetchUsers}
                    transform={(item) => ({
                        text: `${item.nama} (${item.nidn || '-'}/${item.nuptk || '-'})`,
                        value: item.id
                    })}
                    icon={faGraduationCap}
                    tag="Kepala Prodi"
                    placeholder="Pilih kepala prodi"
                    classSpan="col-span-2"
                    required
                    error={errors.kaprodi_id}
                />
            </div>
        </Modal>
    )
}
