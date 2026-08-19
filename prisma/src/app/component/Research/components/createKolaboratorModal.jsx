"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX } from "@fortawesome/free-solid-svg-icons"

import TextInput from "@/app/component/Inputs/TextInput"
import { addKolaborator } from "../../Libraries/api/kolaborator"
import { faBook, faCreditCard, faEnvelope, faPhone, faSchool, faUser } from "@fortawesome/free-solid-svg-icons"

export default function CreateKolaboratorModal({
    open,
    initialName = "",
    onClose,
    onSubmit,
}) {

    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        nidn: "",
        nuptk: "",
        nama: "",
        email: "",
        no_hp: "",
        prodi: "",
        institusi: "",
    })

    useEffect(() => {

        if(!open) return

        setForm({
            nidn: "",
            nuptk: "",
            nama: initialName,
            email: "",
            no_hp: "",
            prodi: "",
            institusi: "",
        })

    }, [open, initialName])

    if(!open) return null

    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async () => {

        try{

            setLoading(true)

            const response =
                await addKolaborator(form)

            onSubmit(response)

        }catch(error){

            console.error(error)

        }finally{

            setLoading(false)

        }
    }

    return (
        <motion.div
            key="formModal"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
        >
            <div
                className="
                    bg-white
                    rounded-xl
                    w-full
                    max-w-3xl
                    max-h-[90vh]
                    flex flex-col
                "
            >

                <div className="flex items-start justify-between p-6 pb-0">

                    <h3 className="text-xl font-medium">
                        Tambah Kolaborator Baru
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faX} />
                    </button>

                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-2 gap-3">

                    <TextInput
                        placeholder="NIDN"
                        value={form.nidn}
                        onChange={(e) =>
                            updateField("nidn", e.target.value)
                        }
                        icon={faCreditCard}
                    />

                    <TextInput
                        placeholder="NUPTK"
                        value={form.nuptk}
                        onChange={(e) =>
                            updateField("nuptk", e.target.value)
                        }
                        icon={faCreditCard}
                    />

                    <TextInput
                        placeholder="Nama"
                        value={form.nama}
                        onChange={(e) =>
                            updateField("nama", e.target.value)
                        }
                        icon={faUser}
                    />

                    <TextInput
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                            updateField("email", e.target.value)
                        }
                        icon={faEnvelope}
                    />

                    <TextInput
                        placeholder="No HP"
                        value={form.no_hp}
                        onChange={(e) =>
                            updateField("no_hp", e.target.value)
                        }
                        icon={faPhone}
                    />

                    <TextInput
                        placeholder="Program Studi"
                        value={form.prodi}
                        onChange={(e) =>
                            updateField("prodi", e.target.value)
                        }
                        icon={faBook}
                    />

                    <TextInput
                        placeholder="Institusi"
                        value={form.institusi}
                        onChange={(e) =>
                            updateField("institusi", e.target.value)
                        }
                        icon={faSchool}
                    />
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            px-4 py-2
                            border rounded-md
                        "
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="
                            px-4 py-2
                            rounded-md
                            bg-foreground
                            text-white
                        "
                    >
                        {loading
                            ? "Menyimpan..."
                            : "Simpan Kolaborator"}
                    </button>

                </div>

            </div>
        </motion.div>
    )
}