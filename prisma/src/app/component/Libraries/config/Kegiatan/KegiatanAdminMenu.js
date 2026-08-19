import { faEdit } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createKegiatanAdminMenus = ({
    access,
    handleEdit,
}) => (
    {
    main: [],

    row: [
        group(
            [
                item("Edit kegiatan pengajuan", handleEdit, {
                    icon: faEdit,
                    enabled: access.update
                }),
            ]
        )
    ]
})
