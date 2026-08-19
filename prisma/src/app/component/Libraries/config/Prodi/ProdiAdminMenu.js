import { faEdit, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createProdiAdminMenus = ({
    user,
    access,
    handleAdd,
    handleEdit,
    handleDelete
}) => ({
    main: [
        group(
            [
                item("Tambahkan prodi baru", handleAdd, { 
                    icon: faPlus,
                    enabled: access.create 
                })
            ]
        )
    ],

    row: [
        group(
            [
                item("Edit prodi", handleEdit, {
                    icon: faEdit,
                    enabled: access.update
                }),
                item("Hapus prodi", handleDelete, {
                    icon: faTrashCan,
                    enabled: access.delete,
                    danger: true
                })
            ]
        )
    ]
})
