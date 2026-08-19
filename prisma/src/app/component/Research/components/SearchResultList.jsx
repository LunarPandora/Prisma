"use client"

import { useState } from "react"

import SelectInputMulti from "@/app/component/Inputs/SelectInputMulti"
import { faUser } from "@fortawesome/free-solid-svg-icons"

export default function SearchResultList({
    researcherType,
    value,
    onSelect,
    onCreateKolaborator,

    fetchDosen,
    fetchListMahasiswa,
    fetchKolaborator,
}) {

    const [keyword, setKeyword] = useState("")

    if(researcherType === "Dosen"){
        return (
            <SelectInputMulti
                dataSource={fetchDosen}
                transform={(item) => ({
                    text: `${item.nama} (${item.nidn || '-'}/${item.nuptk || '-'})`,
                    value: item.user_id
                })}
                selectedValues={value
                    .filter(i => i.type === "Dosen")
                    .map(i => i.id)
                }
                onSelect={({ type, raw }) => {
                    if(type === "add"){
                        onSelect({
                            ...raw,
                            type: "Dosen"
                        })
                    }
                }}
                tag={"Pilih kontributor"}
                placeholder={"Ketikkan nama dosen disini..."}
                icon={faUser}
            />
        )
    }

    if(researcherType === "Mahasiswa"){
        return (
            <SelectInputMulti
                dataSource={fetchListMahasiswa}
                transform={(item) => ({
                    text: `${item.nama} (${item.nim || '-'})`,
                    value: item.mhswa_id
                })}
                selectedValues={value
                    .filter(i => i.type === "Mahasiswa")
                    .map(i => i.id)
                }
                onSelect={({ type, raw }) => {
                    if(type === "add"){
                        onSelect({
                            ...raw,
                            type: "Mahasiswa"
                        })
                    }
                }}
                tag={"Pilih kontributor"}
                placeholder={"Ketikkan nama mahasiswa disini..."}
                icon={faUser}
            />
        )
    }

    if(researcherType === "Kolaborator"){
        return (
            <div className="flex flex-col gap-3">

                <SelectInputMulti
                    dataSource={(params) => {
                        setKeyword(params?.search ?? "")
                        return fetchKolaborator(params)
                    }}
                    onCreateNew={(keyword) =>
                        onCreateKolaborator(keyword)
                    }
                    transform={(item) => ({
                        text: `${item.nama} (${item.nidn || '-'}/${item.nuptk || '-'})`,
                        value: item.kolab_id
                    })}
                    selectedValues={value
                        .filter(i => i.type === "Kolaborator")
                        .map(i => i.id)
                    }
                    onSelect={({ type, raw }) => {
                        if(type === "add"){
                            onSelect({
                                ...raw,
                                type: "Kolaborator"
                            })
                        }
                    }}
                    tag={"Pilih kontributor"}
                    placeholder={"Ketikkan nama kontributor disini..."}
                    icon={faUser}
                />

                {keyword.trim() !== "" && (
                    <button
                        type="button"
                        onClick={() =>
                            onCreateKolaborator(keyword)
                        }
                        className="
                            w-full
                            border
                            border-dashed
                            rounded-lg
                            py-3
                            hover:bg-gray-50
                        "
                    >
                        + Tambahkan Kolaborator Baru
                    </button>
                )}

            </div>
        )
    }

    return null
}