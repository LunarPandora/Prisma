"use client"

import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Button from "@/app/component/Inputs/Button"
import SelectInput from "@/app/component/Inputs/SelectInput"
import TextInput from "@/app/component/Inputs/TextInput"

const categoryOptions = [
    {
        text: "Didanai Kemdikbud",
        value: "kemdikbud",
    },
    {
        text: "Didanai Internal Perguruan Tinggi",
        value: "internal",
    },
]

export default function ResearchHistoryEditor({
    value = [],
    onChange,
}) {

    const addResearch = () => {
        onChange([
            ...value,
            {
                kategori: "",
                judul: "",
                tahun: "",
                dana_disetujui: "",
            },
        ])
    }

    const updateResearch = (index, field, fieldValue) => {
        const data = [...value]

        data[index] = {
            ...data[index],
            [field]: fieldValue,
        }

        onChange(data)
    }

    const removeResearch = (index) => {
        onChange(
            value.filter((_, i) => i !== index)
        )
    }

    return (
        <div className="flex flex-col gap-5">

            {value.map((item, index) => (
                <div
                    key={index}
                    className="border rounded-lg p-4 flex flex-col gap-3"
                >

                    <div className="flex justify-between items-center">

                        <span className="font-medium">
                            Riwayat Penelitian #{index + 1}
                        </span>

                        <button
                            type="button"
                            onClick={() => removeResearch(index)}
                            className="text-red-500"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>

                    </div>

                    <SelectInput
                        value={item.kategori}
                        onChange={(e) =>
                            updateResearch(
                                index,
                                "kategori",
                                e.target.value
                            )
                        }
                        options={categoryOptions}
                        placeholder="Kategori Pendanaan"
                    />

                    <TextInput
                        placeholder="Judul Penelitian"
                        value={item.judul}
                        onChange={(e) =>
                            updateResearch(
                                index,
                                "judul",
                                e.target.value
                            )
                        }
                    />

                    <div className="grid grid-cols-2 gap-3">

                        <TextInput
                            placeholder="Tahun"
                            type="number"
                            value={item.tahun}
                            onChange={(e) =>
                                updateResearch(
                                    index,
                                    "tahun",
                                    e.target.value
                                )
                            }
                        />

                        <TextInput
                            placeholder="Dana Disetujui"
                            type="number"
                            value={item.dana_disetujui}
                            onChange={(e) =>
                                updateResearch(
                                    index,
                                    "dana_disetujui",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>
            ))}

            <Button onClick={addResearch}>
                <FontAwesomeIcon
                    icon={faPlus}
                    className="mr-2"
                />
                Tambah Riwayat Penelitian
            </Button>

        </div>
    )
}