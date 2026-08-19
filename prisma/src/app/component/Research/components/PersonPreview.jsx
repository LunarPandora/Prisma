"use client"

export default function PersonPreview({
    person,
    onConfirm,
    onCancel
}) {

    if(!person) return null

    return (
        <div className="flex flex-col gap-4">

            <div className="flex items-center gap-4">

                <img
                    src={
                        person.avatar ||
                        "/img/user_placeholder.webp"
                    }
                    alt={person.nama}
                    onError={(e) => {
                        if (e.target.src !== window.location.origin + "/img/user_placeholder.webp") {
                            e.target.src = "/img/user_placeholder.webp"
                        }
                    }}
                    className="
                        w-16 h-16
                        rounded-full
                        object-cover
                        border
                    "
                />

                <div>

                    <p className="font-semibold">
                        {person.nama}
                    </p>

                    <p className="text-sm text-gray-500">
                        {person.type}
                    </p>

                </div>

            </div>

            <div className="flex justify-end gap-2">

                <button
                    type="button"
                    onClick={onCancel}
                    className="
                        px-4 py-2
                        border rounded-md
                    "
                >
                    Bukan Orang Ini
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    className="
                        px-4 py-2
                        rounded-md
                        bg-foreground
                        text-white
                    "
                >
                    Ya, Tambahkan
                </button>

            </div>

        </div>
    )
}