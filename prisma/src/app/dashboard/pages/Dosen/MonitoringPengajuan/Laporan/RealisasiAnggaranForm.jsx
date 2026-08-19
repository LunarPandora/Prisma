"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faTrash,
    faX,
    faSpinner,
    faSave,
} from "@fortawesome/free-solid-svg-icons"

import Button from "@/app/component/Inputs/Button"
import TextInput from "@/app/component/Inputs/TextInput"
import Modal from "@/app/component/Modal/Modal"
import ConfirmModal from "@/app/component/Modal/ConfirmModal"
import { showToast } from "@/app/component/Toast/Toast"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

import {
    getRealisasiAnggaran,
    createRealisasiAnggaran,
    updateRealisasiAnggaran,
    deleteRealisasiAnggaran,
} from "@/app/component/Libraries/api/laporan"

export default function RealisasiAnggaranForm({
    close,
    refresh,
    laporan,
}) {
    const [items, setItems] = useState([])
    const [totalSemua, setTotalSemua] = useState(0)
    const [loading, setLoading] = useState(false)

    const { loading: saving, submit } = useFormSubmission({
        onSuccess: () => {
            resetForm()
            fetchItems()
            refresh()
        }
    })

    const [showAddForm, setShowAddForm] = useState(false)
    const [editIndex, setEditIndex] = useState(null)
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null)

    const [form, setForm] = useState({
        item_kebutuhan: "",
        satuan: "",
        jumlah_item: 1,
        harga_satuan: 0,
    })

    useEffect(() => {
        fetchItems()
    }, [laporan])

    async function fetchItems() {
        try {
            setLoading(true)
            const res = await getRealisasiAnggaran(laporan.laporan_id)
            if (res.data.status === "success") {
                setItems(res.data.data.items || [])
                setTotalSemua(res.data.data.total_semua || 0)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    function resetForm() {
        setForm({
            item_kebutuhan: "",
            satuan: "",
            jumlah_item: 1,
            harga_satuan: 0,
        })
        setEditIndex(null)
        setShowAddForm(false)
    }

    function handleEdit(index) {
        const item = items[index]
        setForm({
            item_kebutuhan: item.item_kebutuhan,
            satuan: item.satuan,
            jumlah_item: item.jumlah_item,
            harga_satuan: item.harga_satuan,
        })
        setEditIndex(index)
        setShowAddForm(true)
    }

    function calculateTotal(jumlah, harga) {
        return jumlah * harga
    }

    async function handleSave() {
        if (!form.item_kebutuhan || !form.satuan) {
            showToast("Item kebutuhan dan satuan wajib diisi.", "error")
            return
        }

        const formData = {
            laporan_id: laporan.laporan_id,
            item_kebutuhan: form.item_kebutuhan,
            satuan: form.satuan,
            jumlah_item: parseInt(form.jumlah_item),
            harga_satuan: parseFloat(form.harga_satuan),
        }

        const apiCall = editIndex !== null
            ? () => updateRealisasiAnggaran(items[editIndex].id, formData)
            : () => createRealisasiAnggaran(formData)

        await submit(apiCall, {
            successMessage: editIndex !== null ? "Item berhasil diperbarui." : "Item berhasil ditambahkan.",
            errorMessage: "Gagal menyimpan item."
        })
    }

    async function handleDelete(index) {
        try {
            const itemId = items[index].id
            await deleteRealisasiAnggaran(itemId)
            showToast("Item berhasil dihapus.", "success")
            fetchItems()
            refresh()
        } catch (err) {
            console.error(err)
            showToast("Gagal menghapus item.", "error")
        }
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("id-ID").format(value)
    }

    return (
        <>
            <Modal
                isOpen={true}
                onClose={close}
                title="Realisasi Anggaran"
                subtitle="Kelola item penggunaan anggaran untuk laporan akhir."
                maxWidth="max-w-3xl"
                closeOnBackdrop={false}
            >
                {/* ITEMS TABLE */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">No</th>
                                <th className="px-3 py-2 text-left">Item Kebutuhan</th>
                                <th className="px-3 py-2 text-left">Satuan</th>
                                <th className="px-3 py-2 text-right">Jumlah</th>
                                <th className="px-3 py-2 text-right">Harga Satuan</th>
                                <th className="px-3 py-2 text-right">Total</th>
                                <th className="px-3 py-2 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-3 py-8 text-center text-gray-400">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-3 py-8 text-center text-gray-400">
                                        Belum ada item realisasi anggaran.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-3 py-2">{index + 1}</td>
                                        <td className="px-3 py-2">{item.item_kebutuhan}</td>
                                        <td className="px-3 py-2">{item.satuan}</td>
                                        <td className="px-3 py-2 text-right">{item.jumlah_item}</td>
                                        <td className="px-3 py-2 text-right">Rp {formatCurrency(item.harga_satuan)}</td>
                                        <td className="px-3 py-2 text-right font-medium">Rp {formatCurrency(item.total)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                onClick={() => handleEdit(index)}
                                                className="text-blue-500 hover:underline text-xs mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmIndex(index)}
                                                className="text-red-500 hover:underline text-xs"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {items.length > 0 && (
                            <tfoot className="bg-gray-50 font-medium">
                                <tr>
                                    <td colSpan="5" className="px-3 py-2 text-right">Total</td>
                                    <td className="px-3 py-2 text-right">Rp {formatCurrency(totalSemua)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* ADD/EDIT FORM */}
                {showAddForm ? (
                    <div className="border rounded-lg p-4 flex flex-col gap-3">
                        <p className="font-medium text-sm">
                            {editIndex !== null ? "Edit Item" : "Tambah Item Baru"}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <TextInput
                                name="item_kebutuhan"
                                placeholder="Nama item kebutuhan"
                                tag="Item Kebutuhan"
                                value={form.item_kebutuhan}
                                onChange={(e) => setForm({ ...form, item_kebutuhan: e.target.value })}
                            />

                            <TextInput
                                name="satuan"
                                placeholder="Contoh: pcs, liter, dll"
                                tag="Satuan"
                                value={form.satuan}
                                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                            />

                            <TextInput
                                name="jumlah_item"
                                type="number"
                                placeholder="Jumlah"
                                tag="Jumlah Item"
                                value={form.jumlah_item}
                                onChange={(e) => setForm({ ...form, jumlah_item: e.target.value })}
                            />

                            <TextInput
                                name="harga_satuan"
                                type="number"
                                placeholder="Harga per satuan"
                                tag="Harga Satuan"
                                value={form.harga_satuan}
                                onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })}
                            />
                        </div>

                        <div className="text-sm text-gray-500">
                            Total: <span className="font-medium text-gray-700">
                                Rp {formatCurrency(calculateTotal(form.jumlah_item, form.harga_satuan))}
                            </span>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={resetForm}
                                className="bg-gray-100 text-gray-600"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <Button onClick={() => setShowAddForm(true)}>
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Tambah Item
                        </Button>
                    </div>
                )}

            </Modal>

            <ConfirmModal
                isOpen={deleteConfirmIndex !== null}
                onClose={() => setDeleteConfirmIndex(null)}
                onConfirm={() => {
                    handleDelete(deleteConfirmIndex)
                    setDeleteConfirmIndex(null)
                }}
                title="Hapus Item"
                message="Apakah Anda yakin ingin menghapus item ini?"
                confirmText="Hapus"
                variant="danger"
            />
        </>
    )
}
