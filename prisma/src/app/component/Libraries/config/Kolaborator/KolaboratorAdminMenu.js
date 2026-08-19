import { faEdit, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createKolaboratorAdminMenus = ({
    user,
    access,
    handleAdd,
    handleEdit,
    handleRemove
}) => ({
    main: [
        group(
            [
                item("Tambahkan kolaborator baru", handleAdd, { 
                    icon: faPlus,
                    enabled: access.create 
                })
            ]
        )
    ],

    row: [
        group(
            [
                item("Tambahkan kolaborator baru", handleAdd, {
                    icon: faPlus,
                    enabled: access.create
                }),
                item("Edit kolaborator", handleEdit, {
                    icon: faEdit,
                    enabled: access.update
                }),
                item("Hapus kolaborator", handleRemove, {
                    icon: faTrashCan,
                    enabled: access.delete,
                    danger: true
                })
            ]
        )
    ]
})
