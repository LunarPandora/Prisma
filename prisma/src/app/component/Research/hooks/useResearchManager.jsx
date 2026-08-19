"use client"

export default function useResearcherManager({
    value,
    onChange
}) {

    const addResearcher = (item, type) => {

        let researcherId

        if(type === "Dosen"){
            researcherId = item.user_id ?? item.id
        }
        else if(type === "Mahasiswa"){
            researcherId = item.mhswa_id
        }
        else if(type === "Kolaborator"){
            researcherId = item.kolab_id
        }

        /*
        |--------------------------------------------------------------------------
        | Duplicate check
        |--------------------------------------------------------------------------
        | Must scope by (type, id): a Dosen with user_id 5, a Mahasiswa with
        | mhswa_id 5 and a Kolaborator with kolab_id 5 are three different
        | people and must be independently addable.
        |--------------------------------------------------------------------------
        */

        const exists = value.some(
            member =>
                member.type === type &&
                member.id === researcherId
        )

        if(exists){
            return false
        }

        onChange([
            ...value,
            {
                id: researcherId,
                type,

                nama: item.nama,

                // Use the fully-qualified avatar URL (Laravel's avatar_url
                // accessor) so the <img> renders across origins. Fall back
                // to the raw column, and finally to a placeholder, so this
                // never explodes.
                avatar: item.avatar_url || item.avatar || null,

                institusi: item.institusi ?? null,
                prodi: item.prodi ?? null,

                ttjp: "",
                locked: false
            }
        ])

        return true
    }

    const removeResearcher = (id, type) => {

        const target = value.find(item =>
            item.id === id
            && (!type || item.type === type)
        )

        if(target?.locked){
            return
        }

        onChange(
            value.filter(item =>
                !(item.id === id
                    && (!type || item.type === type)
                )
            )
        )
    }

    const moveUp = (index) => {

        if(index < 1) return

        const arr = [...value]

        ;[
            arr[index - 1],
            arr[index]
        ] = [
            arr[index],
            arr[index - 1]
        ]

        onChange(arr)
    }

    const moveDown = (index) => {

        if(index === 0) return
        if(index === value.length - 1) return

        const arr = [...value]

        ;[
            arr[index + 1],
            arr[index]
        ] = [
            arr[index],
            arr[index + 1]
        ]

        onChange(arr)
    }

    const updateTTJP = (id, type, val) => {

        onChange(
            value.map(item =>
                item.id === id && item.type === type
                    ? {
                        ...item,
                        ttjp: val
                    }
                    : item
            )
        )
    }

    return {
        addResearcher,
        removeResearcher,
        moveUp,
        moveDown,
        updateTTJP
    }
}