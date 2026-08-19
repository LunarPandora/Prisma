"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faLock, faMarsAndVenus, faUserGear, faUserCheck, faGraduationCap, faIdCard, faEdit, faPhone } from '@fortawesome/free-solid-svg-icons'

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"

import { fetchProdi } from "@/app/component/Libraries/api/prodi"
import { addUsers, updateUsers } from "@/app/component/Libraries/api/users"
import { accStatusOptions, genderOptions, roleOptions } from "@/app/component/Libraries/options/selections"
import { useValidation } from "@/app/component/Libraries/hooks/useValidation"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function FormUser({ refresh, close, data, isEdit }){
    const defaultForm = {
        nama: "",
        email: "",
        password: "",
        gender: "-",
        status: "-",
        role: "-",
        dosen_id: "",
        prodi_id: "",
        nidn: "",
        nuptk: "",
        no_hp: "",
        avatar: "",
        uploaded_file: null
    }

    const [form, setForm] = useState(defaultForm)
    const [prodiOptions, setProdiOptions] = useState([])
    const [loadingProdi, setLoadingProdi] = useState(true)
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
        fetchProdi().then(data => {
            let temp_data = []
            data.map((val) => {
                temp_data.push({
                    text: val.nama_prodi,
                    value: val.prodi_id
                })
            })
            setProdiOptions(temp_data)
            setLoadingProdi(false)
        })
    }, [])

    useEffect(() => {
        if (isEdit && data) {
            setForm(prev => ({
                ...prev,
                ...data,
                password: "12345678",
            }))
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
            () => isEdit ? updateUsers(formData) : addUsers(formData),
            {
                successMessage: `Data user berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`,
                errorMessage: `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} data user.`,
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
            title={isEdit ? 'Update Pengguna' : 'Tambah Pengguna Baru'}
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <Button onClick={sendData} disabled={loading || loadingProdi}>
                    {loading ? "Menyimpan..." : isEdit ? 'Update' : 'Tambahkan'}
                </Button>
            }
        >
            {loadingProdi ? (
                <div className="flex items-center justify-center py-8">
                    <span className="text-gray-500">Memuat data...</span>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
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

                        <div className="w-4/5 grid grid-cols-2 gap-2">
                            <TextInput
                                name="nama" 
                                type="text"
                                placeholder="Masukkan nama pengguna"
                                tag="Nama"
                                icon={faUser}
                                value={form.nama}
                                onChange={handleChange}
                                required
                                error={errors.nama}
                            />

                            <TextInput 
                                name="email" 
                                type="email" 
                                placeholder="Masukkan email pengguna" 
                                tag="Email"
                                icon={faEnvelope}
                                value={form.email}
                                onChange={handleChange}
                                required
                                error={errors.email}
                            />

                            <TextInput
                                name="password" 
                                type="password" 
                                placeholder="Masukkan password pengguna"
                                tag="Password"
                                icon={faLock}
                                value={form.password}
                                disabled={isEdit}
                                onChange={handleChange}
                            />

                            <SelectInput
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                options={genderOptions}
                                icon={faMarsAndVenus}
                                placeholder="Pilih gender pengguna"
                            />

                            <SelectInput
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                options={roleOptions}
                                icon={faUserGear}
                                placeholder="Pilih role pengguna"
                            />

                            <SelectInput
                                name="status" 
                                value={form.status}
                                onChange={handleChange}
                                options={accStatusOptions}
                                icon={faUserCheck}
                                placeholder="Pilih status pengguna"
                            />
                            
                            <TextInput 
                                name="nidn" 
                                type="text" 
                                placeholder="Masukkan NIDN" 
                                icon={faIdCard}
                                value={form.nidn}
                                onChange={handleChange}
                                error={errors.nidn}
                            />

                            <TextInput 
                                name="nuptk" 
                                type="text" 
                                placeholder="Masukkan NUPTK" 
                                icon={faIdCard}
                                value={form.nuptk}
                                onChange={handleChange}
                                error={errors.nuptk}
                            />

                            <TextInput 
                                name="no_hp" 
                                type="text" 
                                placeholder="Masukkan No. HP" 
                                icon={faPhone}
                                value={form.no_hp}
                                onChange={handleChange}
                            />

                            <AnimatePresence> 
                                {form.role === 'Dosen' && (
                                    <motion.div
                                        key="dosenProdi"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <SelectInput
                                            name="prodi_id" 
                                            value={form.prodi_id}
                                            onChange={handleChange}
                                            options={prodiOptions}
                                            icon={faGraduationCap}
                                            placeholder="Pilih prodi"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    )
}
