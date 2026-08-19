"use client"

import { useEffect, useState } from "react"

import ResearcherList from "./components/ResearcherList"
import AddResearcherModal from "./components/AddResearcherModal"
import useResearcherManager from "./hooks/useResearchManager"

export default function ResearcherManager({
    value = [],
    onChange,
    currentUser
}) {

    const [showAddModal, setShowAddModal] = useState(false)

    const {
        addResearcher,
        removeResearcher,
        moveUp,
        moveDown,
        updateTTJP
    } = useResearcherManager({
        value,
        onChange
    })

    /*
    |--------------------------------------------------------------------------
    | Auto Insert Current User As First Author
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if(!currentUser) return
        if(value.length > 0) return

        onChange([
            {
                id: currentUser.id,
                nama: currentUser.nama,
                avatar: currentUser.avatar,
                type: "Dosen",
                ttjp: "",
                locked: true
            }
        ])

    }, [currentUser])

    return (
        <div className="flex flex-col gap-3">

            <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="
                    rounded-md
                    bg-foreground
                    text-white
                    py-2 px-4
                "
            >
                Tambah Peneliti
            </button>

            <AddResearcherModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                value={value}
                addResearcher={addResearcher}
            />

            <ResearcherList
                researchers={value}
                moveUp={moveUp}
                moveDown={moveDown}
                removeResearcher={removeResearcher}
                updateTTJP={updateTTJP}
            />

        </div>
    )
}