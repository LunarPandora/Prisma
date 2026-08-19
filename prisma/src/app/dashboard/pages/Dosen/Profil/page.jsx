"use client"

import Button from "@/app/component/Inputs/Button"
import TextInput from "@/app/component/Inputs/TextInput"

import {
    faBriefcase,
    faClipboard,
    faCreditCard,
    faGraduationCap,
    faPhone,
} from "@fortawesome/free-solid-svg-icons"

import { useEffect, useState } from "react"

import {
    fetchPenelitiDetail,
    updatePenelitiDetail,
} from "@/app/component/Libraries/api/profilpeneliti"
import PublicationEditor from "@/app/component/ProfilPeneliti/PublicationEditor"
import BookEditor from "@/app/component/ProfilPeneliti/BookEditor"
import HKIEditor from "@/app/component/ProfilPeneliti/HKIEditor"
import ResearchHistoryEditor from "@/app/component/ProfilPeneliti/ResearchHistoryEditor"

export default function ProfilDosen(){

    const defaultForm = {
        nidn: "",
        nuptk: "",
        jabatan: "",
        pangkat_golongan: "",
        no_hp: "",
        sinta_id: "",
        scopus_id: "",
        google_scholar_id: "",
        h_index: "",

        publications: [],
        books: [],
        hkis: [],
        research_histories: [],
    }

    const [form, setForm] = useState(defaultForm)
    const [initialForm, setInitialForm] = useState(defaultForm)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function loadData() {
            try{
                const data = await fetchPenelitiDetail()

                const mapped = {
                    nidn: data?.nidn || "",
                    nuptk: data?.nuptk || "",
                    jabatan: data?.jabatan || "",
                    pangkat_golongan: data?.pangkat_golongan || "",
                    no_hp: data?.no_hp || "",
                    sinta_id: data?.sinta_id || "",
                    scopus_id: data?.scopus_id || "",
                    google_scholar_id: data?.google_scholar_id || "",
                    h_index: data?.h_index || "",

                    publications: data?.publications || [],
                    books: data?.books || [],
                    hkis: data?.hkis || [],
                    research_histories: data?.researchHistories || [],
                }

                setForm(mapped)
                setInitialForm(mapped)
            }
            catch(err){
                console.error(err)
            }
        }

        loadData()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const hasChanges = () => {
        return JSON.stringify(form) !== JSON.stringify(initialForm)
    }

    async function submitData(){
        try{
            setLoading(true)

            const formData = new FormData()

            Object.entries(form).forEach(([key, value]) => {
                if (
                    Array.isArray(value) ||
                    typeof value === "object"
                ) {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, value)
                }
            })

            const res = await updatePenelitiDetail(formData)

            if(res.data.status === "success"){
                setInitialForm(form)
            }
        }
        catch(err){
            console.error(err)
        }
        finally{
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <div className="flex flex-col gap-5">

                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">
                        Profil Peneliti
                    </h1>

                    <p className="text-lg text-gray-500 font-light">
                        Lengkapi informasi profil penelitian Anda.
                        Data ini akan digunakan secara otomatis pada
                        proposal dan dokumen penelitian.
                    </p>
                </div>

                <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">

                    <span className="text-gray-600 text-lg font-medium">
                        Informasi Dasar
                    </span>

                    <div className="grid grid-cols-2 gap-3">

                        <TextInput
                            name="nidn"
                            placeholder="NIDN"
                            value={form.nidn}
                            onChange={handleChange}
                            icon={faCreditCard}
                        />

                        <TextInput
                            name="nuptk"
                            placeholder="NUPTK"
                            value={form.nuptk}
                            onChange={handleChange}
                            icon={faCreditCard}
                        />

                        <TextInput
                            name="jabatan"
                            placeholder="Pangkat / Jabatan"
                            value={form.jabatan}
                            onChange={handleChange}
                            icon={faBriefcase}
                        />

                        <TextInput
                            name="pangkat_golongan"
                            placeholder="Pangkat Golongan"
                            value={form.pangkat_golongan}
                            onChange={handleChange}
                            icon={faBriefcase}
                        />

                        <TextInput
                            name="no_hp"
                            placeholder="Nomor HP"
                            value={form.no_hp}
                            onChange={handleChange}
                            icon={faPhone}
                        />

                        <TextInput
                            name="sinta_id"
                            placeholder="ID SINTA"
                            value={form.sinta_id}
                            onChange={handleChange}
                            icon={faGraduationCap}
                        />

                        <TextInput
                            name="scopus_id"
                            placeholder="Scopus ID"
                            value={form.scopus_id}
                            onChange={handleChange}
                            icon={faGraduationCap}
                        />

                        <TextInput
                            name="google_scholar_id"
                            placeholder="Google Scholar ID"
                            value={form.google_scholar_id}
                            onChange={handleChange}
                            icon={faGraduationCap}
                        />

                        <TextInput
                            name="h_index"
                            type="number"
                            placeholder="h-Index"
                            value={form.h_index}
                            onChange={handleChange}
                            icon={faClipboard}
                        />

                    </div>

                </div>

                <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">
                    <span className="text-gray-600 text-lg font-medium">
                        Publikasi
                    </span>

                    <PublicationEditor
                        value={form.publications}
                        onChange={(value) =>
                            setForm(prev => ({
                                ...prev,
                                publications: value
                            }))
                        }
                    />
                </div>

                <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">
                    <span className="text-gray-600 text-lg font-medium">
                        Buku / Book Chapter
                    </span>

                    <BookEditor
                        value={form.books}
                        onChange={(value) =>
                            setForm(prev => ({
                                ...prev,
                                books: value
                            }))
                        }
                    />
                </div>

                <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">
                    <span className="text-gray-600 text-lg font-medium">
                        HKI
                    </span>

                    <HKIEditor
                        value={form.hkis}
                        onChange={(value) =>
                            setForm(prev => ({
                                ...prev,
                                hkis: value
                            }))
                        }
                    />
                </div>

                <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">
                    <span className="text-gray-600 text-lg font-medium">
                        Riwayat Penelitian
                    </span>

                    <ResearchHistoryEditor
                        value={form.research_histories}
                        onChange={(value) =>
                            setForm(prev => ({
                                ...prev,
                                research_histories: value
                            }))
                        }
                    />
                </div>

                <Button
                    onClick={submitData}
                    disabled={!hasChanges() || loading}
                >
                    Simpan Perubahan
                </Button>

            </div>
        </div>
    )
}