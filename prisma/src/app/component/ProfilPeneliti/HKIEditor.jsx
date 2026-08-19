"use client"

import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Button from "@/app/component/Inputs/Button"
import SelectInput from "@/app/component/Inputs/SelectInput"
import TextInput from "@/app/component/Inputs/TextInput"

const statusOptions = [
    {
        text: "Terdaftar",
        value: "terdaftar",
    },
    {
        text: "Granted",
        value: "granted",
    },
]

export default function HKIEditor({
    value = [],
    onChange,
}) {

    const addHKI = () => {
        onChange([
            ...value,
            {
                judul: "",
                tahun: "",
                jenis: "",
                nomor: "",
                status: "",
                url: "",
            },
        ])
    }

    const updateHKI = (index, field, fieldValue) => {
        const data = [...value]

        data[index] = {
            ...data[index],
            [field]: fieldValue,
        }

        onChange(data)
    }

    const removeHKI = (index) => {
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
                            HKI #{index + 1}
                        </span>

                        <button
                            type="button"
                            onClick={() => removeHKI(index)}
                            className="text-red-500"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>

                    </div>

                    <TextInput
                        placeholder="Judul HKI"
                        value={item.judul}
                        onChange={(e) =>
                            updateHKI(
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
                                updateHKI(
                                    index,
                                    "tahun",
                                    e.target.value
                                )
                            }
                        />

                        <TextInput
                            placeholder="Jenis HKI"
                            value={item.jenis}
                            onChange={(e) =>
                                updateHKI(
                                    index,
                                    "jenis",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <TextInput
                        placeholder="Nomor HKI"
                        value={item.nomor}
                        onChange={(e) =>
                            updateHKI(
                                index,
                                "nomor",
                                e.target.value
                            )
                        }
                    />

                    <SelectInput
                        value={item.status}
                        onChange={(e) =>
                            updateHKI(
                                index,
                                "status",
                                e.target.value
                            )
                        }
                        options={statusOptions}
                        placeholder="Status HKI"
                    />

                    <TextInput
                        placeholder="URL HKI"
                        value={item.url}
                        onChange={(e) =>
                            updateHKI(
                                index,
                                "url",
                                e.target.value
                            )
                        }
                    />

                </div>
            ))}

            <Button onClick={addHKI}>
                <FontAwesomeIcon
                    icon={faPlus}
                    className="mr-2"
                />
                Tambah HKI
            </Button>

        </div>
    )
}