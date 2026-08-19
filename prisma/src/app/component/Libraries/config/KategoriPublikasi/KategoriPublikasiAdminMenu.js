import { faEdit, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createKategoriPublikasiAdminMenus = ({
    access,
    handleAdd,
    handleEdit,
    handleRemove
}) => (
    {
    main: [
        group(
            [
                item("Tambahkan kategori publikasi", handleAdd, {
                    icon: faPlus,
                    enabled: (r) => access?.create,
                }),
            ]
        )
    ],

    row: [
        group(
            [
                item("Tambahkan kategori publikasi", handleAdd, {
                    icon: faPlus,
                    enabled: (r) => access?.create,
                }),
                item("Edit kategori publikasi", handleEdit, {
                    icon: faEdit,
                    enabled: (r) => access?.update,
                }),
                item("Hapus kategori publikasi", handleRemove, {
                    icon: faTrashCan,
                    enabled: (r) => access?.delete,
                    danger: true
                }),
            ]
        )
    ]
})
