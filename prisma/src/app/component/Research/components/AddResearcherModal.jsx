"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { faArrowLeft, faX } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import RoleSelector from "./RoleSelector"
import SearchResultList from "./SearchResultList"
import PersonPreview from "./PersonPreview"
import CreateKolaboratorModal from "./createKolaboratorModal"

import { fetchDosen } from "@/app/component/Libraries/api/dosen"
import { fetchListMahasiswa } from "@/app/component/Libraries/api/mahasiswa"
import { fetchKolaborator } from "../../Libraries/api/kolaborator"

export default function AddResearcherModal({
    open,
    onClose,

    value,

    addResearcher,
}) {

    const [researcherType, setResearcherType] = useState("Dosen")
    const [step, setStep] = useState("role")

    const [selectedPerson, setSelectedPerson] = useState(null)

    const [showCreateKolaborator, setShowCreateKolaborator] =
        useState(false)

    const [newKolaboratorName, setNewKolaboratorName] =
        useState("")

    useEffect(() => {
        if (!open) {

            setResearcherType("Dosen")
            setStep("role")

            setSelectedPerson(null)

            setShowCreateKolaborator(false)
            setNewKolaboratorName("")
        }
    }, [open])

    if (!open) return null

    return (
        <>
            <motion.div
                key="formModal"
                initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
            >
                <div
                    className="
                        w-full max-w-2xl
                        rounded-xl
                        bg-white
                        shadow-xl
                        max-h-[90vh]
                        flex flex-col
                    "
                >
                    <div className="flex items-start justify-between p-6 pb-0">

                        <div className="flex items-center gap-3">

                            {step !== "role" && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedPerson(null)
                                        setStep("role")
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft}/>
                                </button>
                            )}

                            <h3 className="text-xl font-medium">
                                Tambah Peneliti
                            </h3>

                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faX} />
                        </button>

                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {step === "role" && (
                            <RoleSelector
                                onSelect={(role) => {
                                    setResearcherType(role)
                                    setStep("search")
                                }}
                            />
                        )}

                        {step === "search" && (
                            <SearchResultList
                                researcherType={researcherType}
                                value={value}
                                fetchDosen={fetchDosen}
                                fetchListMahasiswa={fetchListMahasiswa}
                                fetchKolaborator={fetchKolaborator}
                                onSelect={(person) => {
                                    setSelectedPerson(person)
                                    setStep("preview")
                                }}
                                onCreateKolaborator={(keyword) => {
                                    setNewKolaboratorName(keyword)
                                    setShowCreateKolaborator(true)
                                }}
                            />
                        )}

                        {step === "preview" && (
                            <PersonPreview
                                person={selectedPerson}
                                onCancel={() => {
                                    setSelectedPerson(null)
                                    setStep("search")
                                }}
                                onConfirm={() => {
                                    addResearcher(
                                        selectedPerson,
                                        selectedPerson.type
                                    )

                                    setSelectedPerson(null)

                                    onClose()
                                }}
                            />
                        )}
                    </div>

                </div>
            </motion.div>

            <CreateKolaboratorModal
                open={showCreateKolaborator}
                initialName={newKolaboratorName}
                onClose={() =>
                    setShowCreateKolaborator(false)
                }
                onSubmit={(response) => {
                    const kolaborator = response.data.data

                    setShowCreateKolaborator(false)

                    setSelectedPerson({
                        ...kolaborator,
                        id: kolaborator.kolab_id,
                        avatar: kolaborator.avatar_url,
                        type: "Kolaborator"
                    })

                    setStep("preview")
                }}
            />
        </>
    )
}