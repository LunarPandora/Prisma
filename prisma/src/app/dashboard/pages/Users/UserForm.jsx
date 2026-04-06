"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faUser, faEnvelope, faLock, faMarsAndVenus, faUserGear, faUserCheck, faSpinner, faGraduationCap, faIdCard } from '@fortawesome/free-solid-svg-icons'

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import LoadingBar from "@/app/component/LoadingBar"

import { fetchProdi } from "@/app/lib/api/prodi"
import { addUsers, updateUsers } from "@/app/lib/api/users"
import { accStatusOptions, genderOptions, roleOptions } from "@/app/lib/options/selections"

export default function FormUser({ refresh, close, data, isEdit, alertMsg, alertStatus, alertTrigger }){
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
    }

    const [form, setForm] = useState(defaultForm)
    const [prodiOptions, setProdiOptions] = useState([])
    const [loadingForm, setLoadingForm] = useState(true)
    const MotionLoadingBar = motion.create(LoadingBar);

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
            setLoadingForm(false)
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
                ? await updateUsers(formData)
                : await addUsers(formData)

            if (res.data.status == 'success'){ 
                alertMsg(`Sistem berhasil ${isEdit ? 'mengupdate' : 'menambahkan'} user!`)
                alertStatus('success')
            }
            else {
                alertMsg(`Sistem gagal ${isEdit ? 'mengupdate' : 'menambahkan'} user!`)
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
                            className="w-1/2 bg-white p-5 rounded-xl flex flex-col gap-5"
                        >
                            <div class="flex w-full justify-between items-center">
                                <p className="font-medium text-xl">{ isEdit ? 'Update Pengguna' : 'Tambah Pengguna Baru' }</p>
                                <FontAwesomeIcon onClick={close} icon={faX} className="text-sm" />
                            </div>
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-x-2 gap-y-4"
                            >
                                <TextInput
                                    name="nama" 
                                    type="text"
                                    placeholder="Masukkan nama pengguna"
                                    icon={faUser}
                                    value={form.nama}
                                    onChange={handleChange}
                                />

                                <TextInput 
                                    name="email" 
                                    type="email" 
                                    placeholder="Masukkan email pengguna" 
                                    icon={faEnvelope}
                                    value={form.email}
                                    onChange={handleChange}
                                />

                                <TextInput
                                    name="password" 
                                    type="password" 
                                    placeholder="Masukkan password pengguna"
                                    icon={faLock}
                                    value={form.password}
                                    disabled={isEdit ? true : false}
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

                                <AnimatePresence>
                                    { (form.role == 'Dosen') && 
                                        <>
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
                                            <motion.div
                                                key="dosenNIDN"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <TextInput 
                                                    name="nidn" 
                                                    type="text" 
                                                    placeholder="Masukkan NIDN" 
                                                    icon={faIdCard}
                                                    value={form.nidn}
                                                    onChange={handleChange}
                                                />
                                            </motion.div>
                                        </>
                                    }
                                </AnimatePresence>

                                <button onClick={sendData} className="bg-foreground/90 hover:bg-foreground text-white text-lg px-5 py-2 rounded-lg font-medium mt-1 transition-colors duration-300 ease-in-out cursor-pointer col-span-2">
                                    { 
                                        isEdit ? 'Update' : 'Tambahkan'
                                    }
                                </button>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </motion.div>
    )
}