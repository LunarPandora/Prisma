"use client"

export default function RoleSelector({
    onSelect
}) {
    return (
        <div className="grid grid-cols-3 gap-3">

            <button
                type="button"
                onClick={() => onSelect("Dosen")}
                className="
                    border rounded-xl p-6
                    text-center
                    hover:border-foreground
                "
            >
                Dosen
            </button>

            <button
                type="button"
                onClick={() => onSelect("Mahasiswa")}
                className="
                    border rounded-xl p-6
                    text-center
                    hover:border-foreground
                "
            >
                Mahasiswa
            </button>

            <button
                type="button"
                onClick={() => onSelect("Kolaborator")}
                className="
                    border rounded-xl p-6
                    text-center
                    hover:border-foreground
                "
            >
                Kolaborator
            </button>

        </div>
    )
}