"use client"

import { useEffect, useState } from "react"

import Button from "@/app/component/Inputs/Button"
import Toggle from "@/app/component/Inputs/Toggle"
import Alert from "@/app/component/Alert/Alert"

import {
    fetchSettings,
    updateIgnoreKegiatanDates
} from "@/app/component/Libraries/api/settings"

import { faSave } from "@fortawesome/free-solid-svg-icons"

export default function KetuaPengaturan(){
    const [ignoreKegiatanDates, setIgnoreKegiatanDates] = useState(false)
    const [initialValue, setInitialValue] = useState(false)
    const [loading, setLoading] = useState(false)

    const [showAlert, setShowAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState("")
    const [alertStatus, setAlertStatus] = useState("success")

    useEffect(() => {
        async function loadSettings(){
            try {
                const data = await fetchSettings()
                const val = data.ignore_kegiatan_dates ?? false
                setIgnoreKegiatanDates(val)
                setInitialValue(val)
            } catch (err) {
                console.error(err)
            }
        }

        loadSettings()
    }, [])

    const hasChanges = ignoreKegiatanDates !== initialValue

    async function handleSubmit(){
        try {
            setLoading(true)

            const res = await updateIgnoreKegiatanDates({
                ignore_kegiatan_dates: ignoreKegiatanDates
            })

            if(res.data.status === "success"){
                setInitialValue(ignoreKegiatanDates)
                setAlertMsg("Pengaturan berhasil disimpan.")
                setAlertStatus("success")
            } else {
                setAlertMsg(res.data.message || "Gagal menyimpan pengaturan.")
                setAlertStatus("error")
            }
        } catch (err) {
            console.error(err)
            setAlertMsg("Gagal menyimpan pengaturan.")
            setAlertStatus("error")
        } finally {
            setLoading(false)
            setShowAlert(true)
        }
    }

    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">Pengaturan</h1>
                <p className="text-lg text-gray-500 font-light">Kelola pengaturan kegiatan penelitian.</p>
            </div>

            <div className="flex flex-col gap-y-2 w-full border border-gray-300 rounded-md p-5 bg-white">
                <span className="text-gray-600 text-lg font-medium">
                    Pengaturan Kegiatan
                </span>
                <p className="text-sm text-gray-500 font-light">
                    Atur perilaku sistem untuk fase kegiatan penelitian.
                </p>

                <Toggle
                    label="Abaikan Tanggal Kegiatan"
                    description="Jika diaktifkan, semua fase dapat dilanjutkan tanpa memeriksa apakah tanggal saat ini berada dalam rentang tgl_mulai dan tgl_selesai"
                    checked={ignoreKegiatanDates}
                    onChange={(val) => setIgnoreKegiatanDates(val)}
                />
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!hasChanges || loading}
                icon={faSave}
            >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>

            { showAlert &&
                <Alert
                    msg={alertMsg}
                    onCancel={() => setShowAlert(false)}
                    alertType={alertStatus}
                />
            }
        </div>
    )
}
