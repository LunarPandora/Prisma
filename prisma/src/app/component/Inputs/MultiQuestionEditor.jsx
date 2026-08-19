"use client"

import { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faTrash,
    faGripLines,
    faCircleExclamation
} from "@fortawesome/free-solid-svg-icons"

export default function MultiQuestionEditor({
    name,
    value = [],
    onChange,
    tag,
    placeholder,
    className
}) {

    const addQuestion = () => {
        const updated = [
            ...value,
            { question: "" }
        ]

        onChange({
            target: {
                name,
                value: updated
            }
        })
    }

    const removeQuestion = (index) => {
        const updated = value.filter((_, i) => i !== index)

        onChange({
            target: {
                name,
                value: updated
            }
        })
    }

    const updateQuestion = (index, question) => {
        const updated = value.map((item, i) =>
            i === index
                ? {
                    ...item,
                    question
                }
                : item
        )

        onChange({
            target: {
                name,
                value: updated
            }
        })
    }

    useEffect(() => {
        if (value.length === 0) {
            onChange({
                target: {
                    name,
                    value: [{ question: "" }]
                }
            })
        }
    }, [])

    const hasEmpty = value.some(item => !item.question?.trim())

    return (
        <div className={`flex flex-col gap-3 w-full ${className}`}>
            <div className="flex flex-col gap-2">
                {value.map((item, index) => (
                    <div
                        key={index}
                        className="
                            flex items-center gap-2
                            bg-gray-50
                            rounded-lg
                            px-3 py-2
                            transition-colors
                            hover:bg-gray-100
                        "
                    >
                        <FontAwesomeIcon
                            icon={faGripLines}
                            className="text-gray-400 text-xs"
                        />

                        <span className="text-xs font-medium text-gray-500 w-5 text-right shrink-0">
                            {index + 1}.
                        </span>

                        <input
                            type="text"
                            value={item.question}
                            onChange={(e) =>
                                updateQuestion(index, e.target.value)
                            }
                            placeholder={`Tuliskan pertanyaan kesesuaian tema`}
                            className="
                                flex-1
                                outline-none
                                bg-transparent
                                text-sm
                                focus:placeholder-gray-400
                            "
                        />

                        <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            aria-label={`Hapus Pertanyaan ${index + 1}`}
                            className="
                                w-7 h-7
                                rounded-md
                                text-gray-400
                                hover:text-red-600
                                hover:bg-red-50
                                transition-all
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-red-300
                                inline-flex
                                items-center
                                justify-center
                            "
                        >
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="text-xs"
                            />
                        </button>
                    </div>
                ))}
            </div>

            {hasEmpty && value.length > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md flex items-center gap-2">
                    <FontAwesomeIcon icon={faCircleExclamation} className="text-xs" />
                    Semua pertanyaan wajib diisi.
                </p>
            )}

            <button
                type="button"
                onClick={addQuestion}
                className="
                    px-3 py-1.5
                    rounded-md
                    bg-transparent
                    hover:bg-gray-100
                    transition-all
                    text-sm
                    font-medium
                    text-gray-600
                    flex items-center gap-2
                    w-fit
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-gray-300
                "
            >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                Tambah Pertanyaan
            </button>
        </div>
    )
}