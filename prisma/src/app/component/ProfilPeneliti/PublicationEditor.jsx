"use client"

import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { useEffect, useState } from "react"

import Button from "@/app/component/Inputs/Button"
import SelectInput from "@/app/component/Inputs/SelectInput"
import TextInput from "@/app/component/Inputs/TextInput"
import { fetchListPublicationCategory } from "@/app/component/Libraries/api/kategoripublikasi"

const jenisJurnalOptions = [
    {
        text: "Jurnal Internal Terindeks",
        value: "jurnal_internal",
    },
    {
        text: "Jurnal Internasional Terindeks",
        value: "jurnal_internasional",
    },
    {
        text: "Jurnal Nasional Terakreditasi",
        value: "jurnal_nasional_terakreditasi",
    },
    {
        text: "Jurnal Nasional Tidak Terakreditasi",
        value: "jurnal_nasional_tidak_terakreditasi",
    },
    {
        text: "Prosiding Seminar/Conference Internasional",
        value: "prosiding",
    },
]

const authorRoles = [
    {
        text: "First Author",
        value: "first_author",
    },
    {
        text: "Corresponding Author",
        value: "corresponding_author",
    },
    {
        text: "Co Author",
        value: "co_author",
    },
]

export default function PublicationEditor({
    value = [],
    onChange,
}) {

    const [categories, setCategories] = useState([])

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await fetchListPublicationCategory()

                setCategories(data || [])
            }
            catch (err) {
                console.error(err)
            }
        }

        loadCategories()
    }, [])

    const categoryOptions = categories.map((category) => ({
        text: category.nama,
        value: category.pub_category_id,
    }))

    const getPeringkatOptions = (pubCategoryId) => {
        const category = categories.find(
            (item) => item.pub_category_id === pubCategoryId
        )

        if (!Array.isArray(category?.peringkat)) return []

        return category.peringkat.map((peringkat) => ({
            text: peringkat,
            value: peringkat,
        }))
    }

    const addPublication = () => {
        onChange([
            ...value,
            {
                jenis_jurnal: "",
                pub_category_id: "",
                peringkat: "",
                judul: "",
                peran: "",
                nama_jurnal: "",
                tahun: "",
                volume: "",
                issn: "",
                doi: "",
                url: "",
            },
        ])
    }

    const updatePublication = (index, field, fieldValue) => {
        const data = [...value]

        data[index] = {
            ...data[index],
            [field]: fieldValue,
        }

        onChange(data)
    }

    const changeCategory = (index, pubCategoryId) => {
        const data = [...value]

        data[index] = {
            ...data[index],
            pub_category_id: pubCategoryId,
            peringkat: "",
        }

        onChange(data)
    }

    const removePublication = (index) => {
        onChange(
            value.filter((_, i) => i !== index)
        )
    }

    return (
        <div className="flex flex-col gap-5">

            {value.map((item, index) => {

                const peringkatOptions = getPeringkatOptions(
                    item.pub_category_id
                )

                return (
                    <div
                        key={index}
                        className="border rounded-lg p-4 flex flex-col gap-3"
                    >

                        <div className="flex justify-between items-center">

                            <span className="font-medium">
                                Publikasi #{index + 1}
                            </span>

                            <button
                                type="button"
                                onClick={() => removePublication(index)}
                                className="text-red-500"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>

                        </div>

                        <SelectInput
                            value={item.jenis_jurnal}
                            onChange={(e) =>
                                updatePublication(
                                    index,
                                    "jenis_jurnal",
                                    e.target.value
                                )
                            }
                            options={jenisJurnalOptions}
                            placeholder="Jenis Jurnal"
                        />

                        <div className="grid grid-cols-2 gap-3">

                            <SelectInput
                                value={item.pub_category_id}
                                onChange={(e) =>
                                    changeCategory(
                                        index,
                                        e.target.value
                                    )
                                }
                                options={categoryOptions}
                                placeholder="Kategori Publikasi"
                            />

                            <SelectInput
                                value={item.peringkat}
                                onChange={(e) =>
                                    updatePublication(
                                        index,
                                        "peringkat",
                                        e.target.value
                                    )
                                }
                                options={peringkatOptions}
                                placeholder="Peringkat"
                                disabled={peringkatOptions.length === 0}
                            />

                        </div>

                        <TextInput
                            placeholder="Judul Artikel"
                            value={item.judul}
                            onChange={(e) =>
                                updatePublication(
                                    index,
                                    "judul",
                                    e.target.value
                                )
                            }
                        />

                        <SelectInput
                            value={item.peran}
                            onChange={(e) =>
                                updatePublication(
                                    index,
                                    "peran",
                                    e.target.value
                                )
                            }
                            options={authorRoles}
                            placeholder="Peran Penulis"
                        />

                        <TextInput
                            placeholder="Nama Jurnal"
                            value={item.nama_jurnal}
                            onChange={(e) =>
                                updatePublication(
                                    index,
                                    "nama_jurnal",
                                    e.target.value
                                )
                            }
                        />

                        <div className="grid grid-cols-3 gap-3">

                            <TextInput
                                placeholder="Tahun"
                                type="number"
                                value={item.tahun}
                                onChange={(e) =>
                                    updatePublication(
                                        index,
                                        "tahun",
                                        e.target.value
                                    )
                                }
                            />

                            <TextInput
                                placeholder="Volume"
                                value={item.volume}
                                onChange={(e) =>
                                    updatePublication(
                                        index,
                                        "volume",
                                        e.target.value
                                    )
                                }
                            />

                            <TextInput
                                placeholder="P-ISSN / E-ISSN"
                                value={item.issn}
                                onChange={(e) =>
                                    updatePublication(
                                        index,
                                        "issn",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <TextInput
                            placeholder="DOI"
                            value={item.doi}
                            onChange={(e) =>
                                updatePublication(
                                    index,
                                    "doi",
                                    e.target.value
                                )
                            }
                        />

                        <TextInput
                            placeholder="URL Artikel"
                            value={item.url}
                            onChange={(e) =>
                                updatePublication(
                                    index,
                                    "url",
                                    e.target.value
                                )
                            }
                        />

                    </div>
                )
            })}

            <Button onClick={addPublication}>
                <FontAwesomeIcon
                    icon={faPlus}
                    className="mr-2"
                />
                Tambah Publikasi
            </Button>

        </div>
    )
}
