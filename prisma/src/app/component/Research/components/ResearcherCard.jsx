"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faArrowUp,
    faArrowDown,
    faTrash,
    faUser,
} from "@fortawesome/free-solid-svg-icons"

import TextInput from "@/app/component/Inputs/TextInput"

export default function ResearcherCard({
    item,
    index,

    moveUp,
    moveDown,
    removeResearcher,
    updateTTJP,
}) {

    return (
        <div
            className="
                border border-gray-200
                rounded-md
                p-3
                flex flex-col gap-2
            "
        >
            <div className="flex justify-between">

                <div className="flex gap-3">

                    <img
                        src={
                            item.avatar ||
                            "/img/user_placeholder.webp"
                        }
                        alt={item.nama}
                        onError={(e) => {
                            if (e.target.src !== window.location.origin + "/img/user_placeholder.webp") {
                                e.target.src = "/img/user_placeholder.webp"
                            }
                        }}
                        className="
                            w-12 h-12
                            rounded-full
                            object-cover
                            border
                        "
                    />

                    <div>

                        <p className="font-medium">
                            #{index + 1} {item.nama}

                            {item.locked && (
                                <span
                                    className="
                                        ml-2
                                        text-xs
                                        text-blue-600
                                    "
                                >
                                    (Ketua Peneliti)
                                </span>
                            )}
                        </p>

                        <p className="text-xs text-gray-500">
                            {item.type}
                        </p>

                        {item.institusi && (
                            <p className="text-xs text-gray-500">
                                {item.institusi}
                            </p>
                        )}

                        {item.prodi && (
                            <p className="text-xs text-gray-500">
                                {item.prodi}
                            </p>
                        )}

                    </div>

                </div>

                <div className="flex gap-2">

                    {!item.locked && (
                        <>
                            <button
                                type="button"
                                onClick={() => moveUp(index)}
                            >
                                <FontAwesomeIcon
                                    icon={faArrowUp}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() => moveDown(index)}
                            >
                                <FontAwesomeIcon
                                    icon={faArrowDown}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    removeResearcher(item.id, item.type)
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faTrash}
                                />
                            </button>
                        </>
                    )}

                </div>

            </div>

            <TextInput
                placeholder="Tugas & Tanggung Jawab"
                icon={faUser}
                value={item.ttjp}
                onChange={(e) =>
                    updateTTJP(
                        item.id,
                        item.type,
                        e.target.value
                    )
                }
                isTextArea
            />

        </div>
    )
}