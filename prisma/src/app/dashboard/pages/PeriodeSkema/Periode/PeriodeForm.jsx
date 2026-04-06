"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faTable, faFlask, faCalendar, faTag } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from "framer-motion"

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import DatePicker from "@/app/component/Inputs/DatePicker"
import LoadingBar from "@/app/component/LoadingBar"

import { formatToPHPDate } from "@/app/lib/date"
import { fetchSkema } from "@/app/lib/api/skema"
import { addPeriode, updatePeriode } from "@/app/lib/api/periode"
import { statusOptions } from "@/app/lib/options/selections"

export default function FormPeriode({ refresh, close, data, isEdit, alertMsg, alertStatus, alertTrigger }){
    const defaultForm = {
        skema_id: "-",
        nama_periode: "",
        tgl_mulai: new Date(),
        tgl_selesai: new Date(),
        status: "-",
    }

    const [form, setForm] = useState(defaultForm)
    const [skemaOptions, setSkemaOptions] = useState([])

    const [loadingForm, setLoadingForm] = useState(true)
    const MotionLoadingBar = motion.create(LoadingBar);

    useEffect(() => {
        fetchSkema().then(data => {
            let temp_data = []
            data.map((val) => {
                temp_data.push({
                    text: val.nama_skema,
                    value: val.skema_id
                })
            })

            setSkemaOptions(temp_data)
            setLoadingForm(false)
        })
    }, [])

    useEffect(() => {
        if (isEdit && data) {
            setForm(prev => ({
                ...prev,
                ...data,
            }))
        } else {
            setForm(defaultForm)
        }
    }, [isEdit, data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }
    const handleRangeChange = (range) => {
        setForm(prev => ({
            ...prev,
            tgl_mulai: range?.from ?? "",
            tgl_selesai: range?.to ?? ""
        }))
    }

    async function sendData(){
        try{
            setLoadingForm(true)

            const formData = new FormData()
            Object.entries(form).forEach(([key, value]) => {
                console.log(key, value)
                if(key.includes('tgl_') && key.split('T').length == 2){
                    value = formatToPHPDate(value)
                }
                formData.append(key, value)
            })

            const res = isEdit
                ? await updatePeriode(formData)
                : await addPeriode(formData)

            if (res.data.status == 'success'){ 
                alertMsg(`Sistem berhasil ${isEdit ? 'mengupdate' : 'menambahkan'} data periode!`)
                alertStatus('success')
            }
            else {
                alertMsg(`Sistem gagal ${isEdit ? 'mengupdate' : 'menambahkan'} data periode!`)
                alertStatus('danger')
            }
        }
        catch(err){
            alertMsg(`Sistem gagal ${isEdit ? 'mengupdate' : 'menambahkan'} data periode dikarenakan error di sistem!`)
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
                            className="w-1/2 bg-white p-5 rounded-xl flex flex-col gap-5"
                        >
                            <div class="flex w-full justify-between items-center">
                                <p className="font-medium text-xl">{ isEdit ? 'Update Periode' : 'Tambah Periode Baru' }</p>
                                <FontAwesomeIcon onClick={close} icon={faX} className="text-sm" />
                            </div>

                            <div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-x-2 gap-y-4"
                            >
                                <TextInput
                                    name="nama_periode" 
                                    type="text"
                                    placeholder="Masukkan nama periode"
                                    icon={faTable}
                                    value={form.nama_periode}
                                    onChange={handleChange}
                                    className="col-span-2"
                                />

                                <SelectInput
                                    name="skema_id"
                                    value={form.skema_id}
                                    onChange={handleChange}
                                    options={skemaOptions}
                                    icon={faFlask}
                                    placeholder={`Pilih skema yang akan digunakan`}
                                />

                                <SelectInput
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    options={statusOptions}
                                    icon={faTag}
                                    placeholder="Pilih status penelitian"
                                />

                                <DatePicker
                                    mode="range"
                                    date={{from: form.tgl_mulai, to: form.tgl_selesai}}
                                    dateUpdate={handleRangeChange}
                                    icon={faCalendar}
                                    footerPlaceholder={"Tentukan tanggal mulai dan selesai dari periode ini"}
                                    className="col-span-2"
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