"use client"

import { useState } from "react"

import Button from "@/app/component/Inputs/Button"
import TextInput from "@/app/component/Inputs/TextInput"
import Modal from "@/app/component/Modal/Modal"
import { addPublicationCategory, updatePublicationCategory } from "@/app/component/Libraries/api/kategoripublikasi"
import { useValidation } from "@/app/component/Libraries/hooks/useValidation"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function KategoriPublikasiForm({ close, refresh, isEdit = false, data = {} }) {
    const defaultForm = {
        nama: data.nama || "",
        peringkat: Array.isArray(data.peringkat) ? data.peringkat : [],
    }

    const [newPeringkat, setNewPeringkat] = useState("")
    const [form, setForm] = useState(defaultForm)

    const { errors, validate, clearFieldError, clearAllErrors } = useValidation()
    const { loading, submit } = useFormSubmission({
        onSuccess: () => {
            refresh()
            close()
        }
    })

    function handleChange(e){
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        clearFieldError(name)
    }

    function addPeringkat() {
        const value = newPeringkat.trim()
        if (!value) return
        if (form.peringkat.includes(value)) {
            setNewPeringkat("")
            return
        }
        setForm(prev => ({
            ...prev,
            peringkat: [...prev.peringkat, value]
        }))
        setNewPeringkat("")
    }

    function removePeringkat(index){
        setForm(prev => ({
            ...prev,
            peringkat: prev.peringkat.filter((_, i) => i !== index)
        }))
    }

    async function submitData(){
        const { valid } = validate({
            nama: ["required"],
        }, form)

        if (!valid) return

        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => {
            if (key === "peringkat") return
            formData.append(key, value)
        })

        formData.append("pub_category_id", data.pub_category_id)
        formData.append("peringkat", JSON.stringify(form.peringkat))

        if(isEdit){
            formData.append("publication_category_id", data.publication_category_id)
        }

        await submit(
            () => isEdit ? updatePublicationCategory(formData) : addPublicationCategory(formData),
            {
                successMessage: isEdit
                    ? "Kategori publikasi berhasil diperbarui."
                    : "Kategori publikasi berhasil ditambahkan.",
                errorMessage: "Gagal menyimpan kategori publikasi.",
            }
        )
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={isEdit ? 'Update Kategori Publikasi' : 'Tambah Kategori Publikasi'}
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="secondary" onClick={close}>
                        Batal
                    </Button>
                    <Button onClick={submitData} disabled={loading}>
                        {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-2 gap-3">
                <TextInput
                    name="nama"
                    placeholder="Nama kategori publikasi"
                    tag="Nama"
                    value={form.nama}
                    onChange={handleChange}
                    required
                    error={errors.nama}
                    className="col-span-2"
                />

                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium">
                        Daftar Peringkat
                    </span>

                    <div className="flex items-end gap-2">
                        <TextInput
                            placeholder="Contoh: Q1"
                            value={newPeringkat}
                            onChange={(e) => setNewPeringkat(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    addPeringkat()
                                }
                            }}
                        />

                        <Button onClick={addPeringkat} className={"h-fit"}>
                            +
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {form.peringkat.map((item,index)=>(
                            <div
                                key={index}
                                className="px-3 py-1 rounded-full bg-gray-100 flex items-center gap-2"
                            >
                                <span>{item}</span>
                                <button
                                    type="button"
                                    onClick={()=>removePeringkat(index)}
                                    className="text-red-500"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
