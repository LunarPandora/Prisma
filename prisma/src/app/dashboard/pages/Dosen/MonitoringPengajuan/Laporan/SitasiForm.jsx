"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"

import TextInput from "@/app/component/Inputs/TextInput"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import { showToast } from "@/app/component/Toast/Toast"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

import {
    getSitasi,
    addSitasi,
    deleteSitasi,
} from "@/app/component/Libraries/api/dana"

export default function SitasiForm({
    close,
    refresh,
    laporan,
}) {
    const [items, setItems] = useState([])

    const { loading, submit } = useFormSubmission({
        onSuccess: async () => {
            setForm({ judul_sitasi: "", sumber: "", tahun: "", url: "" })
            await fetchItems()
            refresh()
        }
    })

    const [form, setForm] = useState({
        judul_sitasi: "",
        sumber: "",
        tahun: "",
        url: "",
    })

    async function fetchItems() {
        try {
            const res = await getSitasi(`laporan_id=${laporan.laporan_id}`)

            if (res.data?.status === "success") {
                setItems(res.data.data?.data || res.data.data || [])
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [])

    async function handleAdd() {
        if (!form.judul_sitasi) {
            showToast("Judul sitasi wajib diisi.", "error")
            return
        }

        const formData = new FormData()
        formData.append("laporan_id", laporan.laporan_id)
        Object.keys(form).forEach(k =>
            form[k] !== "" && formData.append(k, form[k])
        )

        await submit(() => addSitasi(formData), {
            successMessage: "Sitasi berhasil ditambahkan.",
            errorMessage: "Gagal menambah sitasi."
        })
    }

    async function handleDelete(id) {
        try {
            await deleteSitasi(id)
            await fetchItems()
            refresh()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={`Kelola Sitasi — ${laporan.judul || laporan.detail?.judul_penelitian}`}
            maxWidth="max-w-3xl"
            closeOnBackdrop={false}
        >
            {/* Add form */}
            <div className="border rounded-lg p-4 flex flex-col gap-2 mb-4">
                <span className="font-medium text-gray-600">Tambah Sitasi</span>

                <TextInput
                    name="judul_sitasi"
                    placeholder="Judul sitasi"
                    value={form.judul_sitasi}
                    onChange={(e) =>
                        setForm(f => ({ ...f, judul_sitasi: e.target.value }))
                    }
                />

                <div className="grid grid-cols-3 gap-2">
                    <TextInput
                        name="sumber"
                        placeholder="Sumber (jurnal, konferensi, dsb)"
                        value={form.sumber}
                        onChange={(e) =>
                            setForm(f => ({ ...f, sumber: e.target.value }))
                        }
                    />
                    <TextInput
                        name="tahun"
                        type="number"
                        placeholder="Tahun"
                        value={form.tahun}
                        onChange={(e) =>
                            setForm(f => ({ ...f, tahun: e.target.value }))
                        }
                    />
                    <TextInput
                        name="url"
                        placeholder="URL"
                        value={form.url}
                        onChange={(e) =>
                            setForm(f => ({ ...f, url: e.target.value }))
                        }
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleAdd} disabled={loading}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Tambah
                    </Button>
                </div>
            </div>

            {/* Items */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-2">Judul</th>
                            <th className="p-2">Sumber</th>
                            <th className="p-2">Tahun</th>
                            <th className="p-2">URL</th>
                            <th className="p-2">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-4 text-center text-gray-500"
                                >
                                    Belum ada sitasi
                                </td>
                            </tr>
                        ) : (
                            items.map((s) => (
                                <tr key={s.sitasi_id} className="border-t">
                                    <td className="p-2 font-medium">{s.judul_sitasi}</td>
                                    <td className="p-2">{s.sumber || "-"}</td>
                                    <td className="p-2">{s.tahun || "-"}</td>
                                    <td className="p-2">
                                        {s.url
                                            ? <a
                                                href={s.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Buka
                                            </a>
                                            : "-"
                                        }
                                    </td>
                                    <td className="p-2">
                                        <button
                                            className="text-red-500 text-sm"
                                            onClick={() => handleDelete(s.sitasi_id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Modal>
    )
}
