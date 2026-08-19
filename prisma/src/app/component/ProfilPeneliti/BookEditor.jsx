"use client"

import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Button from "@/app/component/Inputs/Button"
import TextInput from "@/app/component/Inputs/TextInput"

export default function BookEditor({
    value = [],
    onChange,
}) {

    const addBook = () => {
        onChange([
            ...value,
            {
                judul: "",
                tahun: "",
                isbn: "",
                penerbit: "",
                url: "",
            },
        ])
    }

    const updateBook = (index, field, fieldValue) => {
        const data = [...value]

        data[index] = {
            ...data[index],
            [field]: fieldValue,
        }

        onChange(data)
    }

    const removeBook = (index) => {
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
                            Buku #{index + 1}
                        </span>

                        <button
                            type="button"
                            onClick={() => removeBook(index)}
                            className="text-red-500"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>

                    </div>

                    <TextInput
                        placeholder="Judul Buku / Book Chapter"
                        value={item.judul}
                        onChange={(e) =>
                            updateBook(
                                index,
                                "judul",
                                e.target.value
                            )
                        }
                    />

                    <div className="grid grid-cols-2 gap-3">

                        <TextInput
                            placeholder="Tahun Terbit"
                            type="number"
                            value={item.tahun}
                            onChange={(e) =>
                                updateBook(
                                    index,
                                    "tahun",
                                    e.target.value
                                )
                            }
                        />

                        <TextInput
                            placeholder="ISBN"
                            value={item.isbn}
                            onChange={(e) =>
                                updateBook(
                                    index,
                                    "isbn",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <TextInput
                        placeholder="Penerbit"
                        value={item.penerbit}
                        onChange={(e) =>
                            updateBook(
                                index,
                                "penerbit",
                                e.target.value
                            )
                        }
                    />

                    <TextInput
                        placeholder="URL Buku"
                        value={item.url}
                        onChange={(e) =>
                            updateBook(
                                index,
                                "url",
                                e.target.value
                            )
                        }
                    />

                </div>
            ))}

            <Button onClick={addBook}>
                <FontAwesomeIcon
                    icon={faPlus}
                    className="mr-2"
                />
                Tambah Buku
            </Button>

        </div>
    )
}