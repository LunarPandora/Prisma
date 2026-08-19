"use client"

import ResearcherCard from "./ResearcherCard"

export default function ResearcherList({
    researchers,

    moveUp,
    moveDown,
    removeResearcher,
    updateTTJP,
}) {

    return (
        <div className="flex flex-col gap-2">

            {researchers.map((item, index) => (
                <ResearcherCard
                    key={item.id}
                    item={item}
                    index={index}
                    moveUp={moveUp}
                    moveDown={moveDown}
                    removeResearcher={removeResearcher}
                    updateTTJP={updateTTJP}
                />
            ))}

        </div>
    )
}