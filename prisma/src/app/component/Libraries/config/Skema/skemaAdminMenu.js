import { faEdit, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createSkemaAdminMenus = ({
    access,
    handleAdd,
    handleEdit,
    handleDelete
}) => (
    {
    main: [
        group(
            [
                item("Buat skema pengajuan baru", () => handleAdd(true), { 
                    icon: faPlus,
                    enabled: access.create 
                })
            ]
        )
    ],

    row: [
        group(
            [
                item("Edit skema pengajuan", handleEdit, {
                    icon: faEdit,
                    enabled: access.update
                }),
                item("Hapus skema pengajuan", handleDelete, {
                    icon: faTrashCan,
                    enabled: access.delete,
                    danger: true
                })
            ]
        )
    ]
})
