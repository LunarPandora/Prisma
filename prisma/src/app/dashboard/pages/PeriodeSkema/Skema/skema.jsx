"use client"
import CustomTable from "@/app/component/CustomTable"
import { getSkema } from "@/app/lib/api/skema"
import { faEdit, faRefresh, faTrashCan } from "@fortawesome/free-solid-svg-icons"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/lib/menu"

export default function Skema({ refreshKey, onEdit, onRemove, onRefresh, contextListener, rowContextListener }){
    const user = useUserStore(state => state.user)
    const access = getModuleAccess("periodeskema", user?.role)

    const contextMenu = [
        {
            "icon": faRefresh,
            "iconColor": "text-gray-700",
            "text": "Refresh Tabel",
            "textColor": "text-gray-700",
            "action": () => onRefresh()
        },
        {
            "icon": faEdit,
            "iconColor": "text-gray-700",
            "text": "Edit skema pengajuan",
            "textColor": "text-gray-700",
            "action": (r) => onEdit(r)
        },
        {
            "icon": faTrashCan,
            "iconColor": "text-red-500",
            "text": "Hapus skema pengajuan",
            "textColor": "text-red-500",
            "action": (r) => onRemove(r)
        },
    ]

    return (
        <CustomTable
            fetchMethod={getSkema}
            isEditable={access.update}
            isRemovable={access.delete}
            refreshKey={refreshKey}
            className="w-full"
            roundedStyle="rounded-lg rounded-tl-none"
            context={contextMenu}
            onContextRequest={(ctx) => contextListener(ctx, contextMenu)}
            onRowContext={(e, row) => rowContextListener(e, row)}
            columns={[
                { header: "Nama Skema", key: "nama_skema" },
                { 
                    header: "Jenis", 
                    key: "jenis",
                    render: (value, row) => {
                        const isActive = value?.toLowerCase() === "penelitian"

                        return (                            <span
                                className={`${
                                isActive
                                    ? "text-blue-600 bg-blue-100 border-blue-500"
                                    : "text-green-600 bg-green-100 border-green-500"
                                } text-sm px-2 py-1 border rounded`}
                            >
                                {value}
                            </span>
                        )
                    }
                },
                { header: "Keterangan", key: "keterangan" },
            ]}
        />
    )
}