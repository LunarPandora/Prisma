"use client"

import { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faTrash,
    faGripLines,
    faCircleCheck,
    faCircleExclamation
} from "@fortawesome/free-solid-svg-icons"

export default function MultiKriteriaEditor({
    name,
    value = [],
    onChange,
    onValidationChange,
    tag,
    placeholder,
    className
}) {

    const addRow = () => {
        const updated = [
            ...value,
            {
                kriteria: "",
                indikator_penilaian: "",
                bobot: ""
            }
        ]

        triggerChange(updated)
    }

    const removeRow = (index) => {
        const updated = value.filter((_, i) => i !== index)

        triggerChange(updated)
    }

    const updateField = (index, field, fieldValue) => {
        const updated = value.map((item, i) =>
            i === index
                ? {
                    ...item,
                    [field]: fieldValue
                }
                : item
        )

        triggerChange(updated)
    }

    const triggerChange = (updated) => {
        onChange({
            target: {
                name,
                value: updated
            }
        })
    }

    useEffect(() => {
        if (value.length === 0) {
            triggerChange([
                {
                    kriteria: "",
                    indikator_penilaian: "",
                    bobot: ""
                }
            ])
        }
    }, [])

    const totalBobot = value.reduce(
        (sum, item) => sum + (Number(item.bobot) || 0),
        0
    )

    const isValid = totalBobot === 100

    const hasEmptyFields = value.some((item) => {
        return (
            !item.kriteria?.trim() ||
            !item.indikator_penilaian?.trim() ||
            item.bobot === "" ||
            item.bobot === null ||
            item.bobot === undefined
        )
    })

    useEffect(() => {
        if (onValidationChange) {
            onValidationChange({
                valid: isValid,
                totalBobot,
                hasEmptyFields
            })
        }
    }, [value])

    return (
        <div className={`flex flex-col gap-4 w-full ${className}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {value.map((item, index) => (
                    <div
                        key={index}
                        className="
                            w-full
                            bg-white
                            border border-gray-200
                            rounded-xl
                            shadow-sm
                            flex flex-col
                        "
                    >
                        <div className="flex items-center justify-between px-4 py-2.5 bg-foreground rounded-t-xl">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <FontAwesomeIcon
                                    icon={faGripLines}
                                    className="text-gray-400 text-xs shrink-0 cursor-grab"
                                />

                                <p className="text-sm font-semibold text-white truncate">
                                    Kriteria {index + 1}
                                </p>

                                {item.bobot !== "" && item.bobot !== null && item.bobot !== undefined && (
                                    <span className="text-xs text-gray-400 font-normal shrink-0">
                                        Bobot: {item.bobot}%
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                title="Hapus kriteria"
                                aria-label={`Hapus Kriteria ${index + 1}`}
                                className="
                                    w-7 h-7
                                    rounded-md
                                    text-gray-400
                                    hover:text-red-500
                                    hover:bg-white/10
                                    transition-all
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-white/30
                                    inline-flex
                                    items-center
                                    justify-center
                                    shrink-0
                                "
                            >
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className="text-xs"
                                />
                            </button>
                        </div>

                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 font-medium">
                                    Nama Kriteria
                                </label>
                                <input
                                    type="text"
                                    value={item.kriteria}
                                    onChange={(e) =>
                                        updateField(index, "kriteria", e.target.value)
                                    }
                                    placeholder="Contoh: Kreativitas"
                                    className="
                                        w-full
                                        border border-gray-200
                                        rounded-md
                                        px-3 py-1.5
                                        text-sm
                                        outline-none
                                        focus:border-primary
                                        transition-colors
                                    "
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 font-medium">
                                    Indikator Penilaian
                                </label>
                                <textarea
                                    value={item.indikator_penilaian}
                                    onChange={(e) =>
                                        updateField(index, "indikator_penilaian", e.target.value)
                                    }
                                    placeholder="Jelaskan indikator penilaian"
                                    rows={2}
                                    className="
                                        w-full
                                        border border-gray-200
                                        rounded-md
                                        px-3 py-1.5
                                        text-sm
                                        outline-none
                                        resize-none
                                        min-h-[56px]
                                        focus:border-primary
                                        transition-colors
                                    "
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 font-medium">
                                    Bobot (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.bobot}
                                    onChange={(e) =>
                                        updateField(index, "bobot", e.target.value)
                                    }
                                    placeholder="0"
                                    className="
                                        w-full
                                        border border-gray-200
                                        rounded-md
                                        px-3 py-1.5
                                        text-sm
                                        outline-none
                                        focus:border-primary
                                        transition-colors
                                    "
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`
                flex items-center gap-2
                text-sm font-medium
                px-3 py-2 rounded-md
                ${totalBobot === 100
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-red-600 bg-red-50"
                }
            `}>
                <FontAwesomeIcon
                    icon={totalBobot === 100 ? faCircleCheck : faCircleExclamation}
                    className="text-xs"
                />
                Total Bobot: {totalBobot} / 100
                {totalBobot === 100
                    ? " — Sudah sesuai"
                    : totalBobot > 100
                        ? " — Melebihi 100"
                        : " — Kurang dari 100"
                }
            </div>

            {hasEmptyFields && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md">
                    Semua field kriteria wajib diisi sebelum menyimpan.
                </p>
            )}

            <button
                type="button"
                onClick={addRow}
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
                Tambah Kriteria
            </button>
        </div>
    )
}