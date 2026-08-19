"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faGraduationCap, faIdCard, faEdit, faSchool, faEnvelope, faPhone, faCreditCard } from '@fortawesome/free-solid-svg-icons'

import TextInput from "@/app/component/Inputs/TextInput"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"

import { addKolaborator, updateKolaborator } from "@/app/component/Libraries/api/kolaborator"
import { useValidation } from "@/app/component/Libraries/hooks/useValidation"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function FormKolaborator({ refresh, close, data, isEdit }){
    const defaultForm = {
        kolab_id: "",
        nama: "",
        nidn: "",
        nuptk: "",
        email: "",
        no_hp: "",
        prodi: "",
        institusi: "",
        avatar: "",
        uploaded_file: null
    }

    const [form, setForm] = useState(defaultForm)
    const [preview, setPreview] = useState(null)

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

    const fileInputRef = useRef(null)
    const imageSrc = preview || form.avatar || "/img/user_placeholder.webp"

    useEffect(() => {
        if (isEdit && data) {
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

    const handleFileInput = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (e.target.files.length > 1) {
            showToast("Hanya satu file yang diperbolehkan!", "error")
            return
        }

        if (!file.type.startsWith("image/")) {
            showToast("Hanya file gambar yang diperbolehkan.", "error")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast("File terlalu besar (maks 5MB).", "error")
            return
        }

        setForm((prev) => ({ ...prev, uploaded_file: file }))
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
    }

    async function sendData(){
        const { valid } = validate({
            nama: ["required"],
            email: ["required", "email"],
        }, form)

        if (!valid) return

        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => {
            if (key === "uploaded_file") return
            if (value !== null && value !== undefined && value !== "" && value !== "-") {
                formData.append(key, value)
            }
        })

        if (form.uploaded_file instanceof File) {
            formData.append("uploaded_file", form.uploaded_file)
        }

        await submit(
            () => isEdit ? updateKolaborator(formData) : addKolaborator(formData),
            {
                successMessage: `Data kolaborator berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`,
                errorMessage: `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} data kolaborator.`,
            }
        )
    }

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview)
        }
    }, [preview])

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={isEdit ? 'Update Kolaborator' : 'Tambah Kolaborator Baru'}
            maxWidth="max-w-3xl"
            closeOnBackdrop={false}
            footer={
                <Button onClick={sendData} disabled={loading}>
                    {loading ? "Menyimpan..." : isEdit ? 'Update' : 'Tambahkan'}
                </Button>
            }
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-1/5 flex flex-col items-center justify-center gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileInput}
                            className="hidden"
                        />

                        <div className="relative rounded-full overflow-hidden">
                            <Image
                                src={imageSrc}
                                alt="avatar"
                                width={150}
                                height={150}
                                className="relative aspect-square object-cover object-center"
                                unoptimized
                            />
                            <div
                                className="w-full h-full z-10 absolute inset-0 opacity-0 hover:opacity-100 bg-black/60 flex items-center justify-center hover:cursor-pointer transition-opacity duration-200 ease-in-out" 
                                onClick={() => fileInputRef.current.click()}
                            >
                                <FontAwesomeIcon icon={faEdit} className="text-white text-2xl" />
                            </div>
                        </div>

                        <span 
                            className="text-xs underline decoration-dotted underline-offset-3 hover:cursor-pointer hover:text-primary text-center"
                            onClick={() => fileInputRef.current.click()}
                        >
                            Ubah foto profil<br />
                            Maks. 5MB
                        </span>
                    </div>

                    <div className="w-4/5 h-fit grid grid-cols-2 gap-3">
                        <TextInput
                            name="nama" 
                            type="text"
                            placeholder="Masukkan nama kolaborator"
                            tag="Nama"
                            icon={faUser}
                            value={form.nama}
                            onChange={handleChange}
                            className="col-span-2"
                            required
                            error={errors.nama}
                        />

                        <TextInput
                            name="nidn"
                            type="text"
                            placeholder="Masukkan NIDN kolaborator"
                            icon={faIdCard}
                            value={form.nidn}
                            onChange={handleChange}
                            error={errors.nidn}
                        />

                        <TextInput
                            name="nuptk"
                            type="text"
                            placeholder="Masukkan NUPTK kolaborator"
                            icon={faCreditCard}
                            value={form.nuptk}
                            onChange={handleChange}
                            error={errors.nuptk}
                        />

                        <TextInput
                            name="email"
                            type="email"
                            placeholder="Masukkan email kolaborator"
                            tag="Email"
                            icon={faEnvelope}
                            value={form.email}
                            onChange={handleChange}
                            required
                            error={errors.email}
                        />

                        <TextInput
                            name="no_hp"
                            type="text"
                            placeholder="Masukkan no. HP kolaborator"
                            icon={faPhone}
                            value={form.no_hp}
                            onChange={handleChange}
                        />

                        <TextInput
                            name="prodi"
                            type="text"
                            placeholder="Masukkan program studi kolaborator"
                            icon={faGraduationCap}
                            value={form.prodi}
                            onChange={handleChange}
                        />

                        <TextInput
                            name="institusi"
                            type="text"
                            placeholder="Masukkan institusi asal kolaborator"
                            icon={faSchool}
                            value={form.institusi}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}
