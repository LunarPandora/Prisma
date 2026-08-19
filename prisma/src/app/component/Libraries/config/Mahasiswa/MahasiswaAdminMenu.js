import { faEdit, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createMahasiswaAdminMenus = ({
    user,
    access,
    handleAdd,
    handleEdit,
    handleRemove
}) => ({
    main: [
        group(
            [
                item("Tambahkan mahasiswa baru", handleAdd, { 
                    icon: faPlus,
                    enabled: access.create 
                })
            ]
        )
    ],

    row: [
        group(
            [
                item("Tambahkan mahasiswa baru", handleAdd, {
                    icon: faPlus,
                    enabled: access.create
                }),
                item("Edit mahasiswa", handleEdit, {
                    icon: faEdit,
                    enabled: access.update
                }),
                item("Hapus mahasiswa", handleRemove, {
                    icon: faTrashCan,
                    enabled: access.delete,
                    danger: true
                })
            ]
        )
    ]
})
