"use client"

import { useEffect, useState } from "react"

import Button from "@/app/component/Inputs/Button"
import SelectInput from "@/app/component/Inputs/SelectInput"
import TextInput from "@/app/component/Inputs/TextInput"

import {
    fetchKetuaLppm,
    fetchSettings,
    updateSettings,
    updateRektor
} from "@/app/component/Libraries/api/settings"

import {
    faFlask,
    faSchool,
    faUserTie,
    faSave
} from "@fortawesome/free-solid-svg-icons"

export default function PengaturanUmum(){
    const defaultForm = {
        kepala_lppm: "",
        nama_kampus: "",
    }

    const defaultRektorForm = {
        rektor_nama: "",
        rektor_nidn: "",
        rektor_nuptk: ""
    }

    const [form, setForm] = useState(defaultForm)
    const [initialForm, setInitialForm] = useState(defaultForm)

    const [rektorForm, setRektorForm] = useState(defaultRektorForm)
    const [initialRektorForm, setInitialRektorForm] = useState(defaultRektorForm)

    const [loading, setLoading] = useState(false)
    const [rektorLoading, setRektorLoading] = useState(false)

    useEffect(() => {
        async function loadSettings(){
            const data = await fetchSettings()

            const mapped = {
                kepala_lppm: data.kepala_lppm || "",
                nama_kampus: data.nama_kampus || "",
            }

            setForm(mapped)
            setInitialForm(mapped)

            const rektorData = {
                rektor_nama: data.rektor_nama || "",
                rektor_nidn: data.rektor_nidn || "",
                rektor_nuptk: data.rektor_nuptk || ""
            }

            setRektorForm(rektorData)
            setInitialRektorForm(rektorData)
        }

        loadSettings()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleRektorChange = (e) => {
        const { name, value } = e.target

        setRektorForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const hasChanges = () => {
        return JSON.stringify(form) !== JSON.stringify(initialForm)
    }

    const hasRektorChanges = () => {
        return JSON.stringify(rektorForm) !== JSON.stringify(initialRektorForm)
    }

    async function submitData(){
        try{
            setLoading(true)
            const formData = new FormData()

            Object.entries(form).forEach(([key, value]) => {
                if(typeof value === "boolean"){
                    formData.append(key, value ? '1' : '0')
                }
                else if(
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== "-"
                ){
                    if(typeof value === "object"){
                        formData.append(
                            key,
                            JSON.stringify(value)
                        )
                    }
                    else{
                        formData.append(key, value)
                    }
                }
            })

            const res = await updateSettings(formData)

            if(res.data.status === "success"){
                setInitialForm(form)
            }
        }
        finally{
            setLoading(false)
        }
    }

    async function submitRektorData(){
        try{
            setRektorLoading(true)
            const res = await updateRektor(rektorForm)

            if(res.data.status === "success"){
                setInitialRektorForm(rektorForm)
            }
        }
        finally{
            setRektorLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">Pengaturan Umum</h1>
                <p className="text-lg text-gray-500 font-light">Konfigurasi pengaturan sistem LPPM.</p>
            </div>

            <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">
                <span className="text-gray-600 text-lg font-medium">
                    Pengesahan dan Tanggung Jawab
                </span>

                <div className="grid grid-cols-2 gap-3">

                    <SelectInput
                        name="kepala_lppm"
                        value={form.kepala_lppm}
                        onChange={handleChange}
                        dataSource={fetchKetuaLppm}
                        transform={(item) => ({
                            text: `${item.nama} (${item.nidn || '-'}/${item.nuptk || '-'})`,
                            value: item.id
                        })}
                        icon={faFlask}
                        placeholder="Kepala LPPM saat ini"
                    />

                    <TextInput
                        name="nama_kampus"
                        value={form.nama_kampus}
                        onChange={handleChange}
                        placeholder="Masukkan nama kampus"
                        icon={faSchool}
                    />

                </div>

            </div>

            <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">
                <span className="text-gray-600 text-lg font-medium">
                    Data Rektor (Untuk Pembuatan Dokumen)
                </span>
                <p className="text-sm text-gray-500 font-light">
                    Data ini digunakan sebagai template tanda tangan pada dokumen resmi.
                </p>

                <div className="grid grid-cols-2 gap-3">

                    <TextInput
                        name="rektor_nama"
                        value={rektorForm.rektor_nama}
                        onChange={handleRektorChange}
                        placeholder="Nama Rektor"
                        icon={faUserTie}
                    />

                    <TextInput
                        name="rektor_nidn"
                        value={rektorForm.rektor_nidn}
                        onChange={handleRektorChange}
                        placeholder="NIDN Rektor"
                        icon={faUserTie}
                    />

                    <TextInput
                        name="rektor_nuptk"
                        value={rektorForm.rektor_nuptk}
                        onChange={handleRektorChange}
                        placeholder="NUPTK Rektor"
                        icon={faUserTie}
                    />

                </div>

                <div className="mt-2">
                    <Button
                        onClick={submitRektorData}
                        disabled={!hasRektorChanges() || rektorLoading}
                        icon={faSave}
                    >
                        {rektorLoading ? "Menyimpan..." : "Simpan Data Rektor"}
                    </Button>
                </div>
            </div>

            <Button
                onClick={submitData}
                disabled={!hasChanges() || loading}
            >
                Simpan Perubahan
            </Button>

        </div>
    )
}
