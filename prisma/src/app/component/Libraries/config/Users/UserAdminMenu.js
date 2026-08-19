import { faEdit, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createUserAdminMenus = ({
    user,
    access,
    handleAdd,
    handleEdit,
    handleRemove
}) => ({
    main: [
        group(
            [
                item("Tambahkan user baru", handleAdd, { 
                    icon: faPlus,
                    enabled: access.create 
                })
            ]
        )
    ],

    row: [
        group(
            [
                item("Edit user", handleEdit, {
                    icon: faEdit,
                    enabled: access.update
                }),
                item("Hapus user", handleRemove, {
                    icon: faTrashCan,
                    enabled: access.delete,
                    danger: true
                })
            ]
        )
    ]
})
