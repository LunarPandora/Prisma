"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faSpinner, faTable, faFlask, faTag } from '@fortawesome/free-solid-svg-icons'
import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import { addSkema, updateSkema } from "@/app/lib/api/skema"
import { jenisOptions } from "@/app/lib/options/selections"
import { AnimatePresence, motion } from "framer-motion"
import LoadingBar from "@/app/component/LoadingBar"

export default function FormSkema({ refresh, close, data, isEdit, alertMsg, alertStatus, alertTrigger }){
    const defaultForm = {
        nama_skema: "",
        jenis: "-",
        keterangan: "",
    }

    const [form, setForm] = useState(defaultForm)
    const [loadingForm, setLoadingForm] = useState(true)
    const MotionLoadingBar = motion.create(LoadingBar);

    useEffect(() => {
        if (isEdit && data) {
            setForm(prev => ({
                ...prev,
                ...data,
            }))
        } else {
            setForm(defaultForm)
        }
        
        setLoadingForm(false)
    }, [isEdit, data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    async function sendData(){
        try{
            setLoadingForm(true)

            const formData = new FormData()
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value)
            })

            const res = isEdit
                ? await updateSkema(formData)
                : await addSkema(formData)

            if (res.data.status == 'success'){ 
                alertMsg(`Sistem berhasil ${isEdit ? 'mengupdate' : 'menambahkan'} data skema!`)
                alertStatus('success')
            }
            else {
                alertMsg(`Sistem gagal ${isEdit ? 'mengupdate' : 'menambahkan'} data skema!`)
                alertStatus('danger')
            }
        }
        catch(err){
            alertMsg(`Sistem gagal ${isEdit ? 'mengupdate' : 'menambahkan'} data skema dikarenakan error di sistem!`)
            alertStatus('danger')

            console.error(err)
        }
        finally{
            setTimeout(() => {
                setLoadingForm(false)
                refresh()
                close()
                alertTrigger()
            }, 300)
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
            <AnimatePresence mode="wait">
                { loadingForm ?
                    (
                        <MotionLoadingBar />
                    )
                    :
                    (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-1/2 bg-white p-5 rounded-xl flex flex-col gap-5">
                            <div class="flex w-full justify-between items-center">
                                <p className="font-medium text-xl">{ isEdit ? 'Update Skema' : 'Tambah Skema Baru' }</p>
                                <FontAwesomeIcon onClick={close} icon={faX} className="text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                                <TextInput
                                    name="nama_skema" 
                                    type="text"
                                    placeholder="Masukkan nama skema"
                                    icon={faTable}
                                    value={form.nama_skema}
                                    onChange={handleChange}
                                />

                                <SelectInput
                                    name="jenis"
                                    value={form.jenis}
                                    onChange={handleChange}
                                    options={jenisOptions}
                                    icon={faFlask}
                                    placeholder="Pilih jenis penelitian"
                                />

                                <TextInput
                                    className="col-span-2"
                                    name="keterangan" 
                                    type="text" 
                                    placeholder="Masukkan keterangan"
                                    icon={faTag}
                                    value={form.keterangan}
                                    onChange={handleChange}
                                />

                                <button onClick={sendData} className="bg-foreground/90 hover:bg-foreground text-white text-lg px-5 py-2 rounded-lg font-medium mt-1 transition-colors duration-300 ease-in-out cursor-pointer col-span-2">
                                    { 
                                        isEdit ? 'Update' : 'Tambahkan'
                                    }
                                </button>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </motion.div>
        
    )
}