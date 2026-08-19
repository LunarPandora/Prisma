import { faEdit, faTrashCan, faPlus, faEye, faFileUpload, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createProposalDosenMenus = ({
    user,
    access,
    handleView,
    handleAddG,
    handleEditG,
    handleRemoveG,
    handleUpload,
    handleViewRejection
}) => (
    {
    main: [
        group(
            [
                item("Ajukan proposal", handleAddG, { 
                    icon: faPlus,
                })
            ]
        )
    ],

    row: [
        group(
            [
                item("Edit proposal", handleEditG, {
                    icon: faEdit,
                    enabled: (r) => r.status === "Draft"
                }),
                item("Hapus proposal", handleRemoveG, {
                    icon: faTrashCan,
                    enabled: (r) => r.status === "Draft",
                    danger: true
                })
            ],
            {
                hidden: (r) => r.status !== "Draft"
            }
        ),
        group(
            [
                item("Upload proposal", handleUpload, {
                    icon: faFileUpload,
                    enabled: (r) => r.status === "Menunggu proposal untuk diupload"
                }),
                item("Hapus proposal", handleRemoveG, {
                    icon: faTrashCan,
                    enabled: (r) => r.status === "Menunggu proposal untuk diupload",
                    danger: true
                })
            ],
            {
                hidden: (r) => r.status !== "Menunggu proposal untuk diupload"
            }
        ),
        group(
            [
                item("Cek proposal", handleView, {
                    icon: faEye,
                    enabled: (r) => r.status === "Menunggu penugasan reviewer"
                }),
            ],
            {
                hidden: (r) => r.status !== "Menunggu penugasan reviewer"
            }
        ),
        group(
            [
                item("Perbaiki proposal", handleEditG, {
                    icon: faEdit,
                }),
                item("Hapus proposal", handleRemoveG, {
                    icon: faTrashCan,
                    danger: true
                })
            ],
            {
                hidden: (r) => r.status !== "Revisi"
            }
        ),
        group(
            [
                item("Lihat alasan penolakan", handleViewRejection, {
                    icon: faExclamationTriangle,
                }),
            ],
            {
                hidden: (r) => r.status !== "Ditolak"
            }
        )        
    ]
})
