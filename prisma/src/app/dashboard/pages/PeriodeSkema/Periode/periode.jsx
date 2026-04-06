"use client"

import CustomTable from "@/app/component/CustomTable"
import { getPeriode } from "@/app/lib/api/periode"
import { formatIndonesianDate } from "@/app/lib/date"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/lib/menu"

import { faEdit, faRefresh, faTrashCan } from "@fortawesome/free-solid-svg-icons"

export default function Periode({ refreshKey, onEdit, onRemove, onRefresh, contextListener, rowContextListener }){
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
            "text": "Edit periode pengajuan",
            "textColor": "text-gray-700",
            "action": (r) => onEdit(r)
        },
        {
            "icon": faTrashCan,
            "iconColor": "text-red-500",
            "text": "Hapus periode pengajuan",
            "textColor": "text-red-500",
            "action": (r) => onRemove(r)
        },
    ]

    return (
        <CustomTable
            fetchMethod={getPeriode}
            isEditable={access.update}
            isRemovable={access.delete}
            refreshKey={refreshKey}
            className="w-full"
            roundedStyle="rounded-lg rounded-tl-none"
            context={contextMenu}
            onContextRequest={(ctx) => contextListener(ctx, contextMenu)}
            onRowContext={(e, row) => rowContextListener(e, row)}
            columns={[
                { header: "Nama Periode", key: "nama_periode" },
                { header: "Skema", key: "nama_skema" },
                { header: "Tanggal Mulai", key: "tgl_mulai", render: (value) => { return formatIndonesianDate(value) } },
                { header: "Tanggal Selesai", key: "tgl_selesai", render: (value) => { return formatIndonesianDate(value) } },
                { 
                    header: "Status", 
                    key: "status",
                    render: (value, row) => {
                        const isActive = value.toLowerCase()

                        if(isActive == 'belum dibuka'){
                            return (
                                <span className="text-red-600 bg-red-100 border-red-500 text-sm px-2 py-1 border rounded">
                                    {value}
                                </span>
                            )
                        }
                        else if(isActive == 'terbuka'){
                            return (
                                <span className="text-blue-600 bg-blue-100 border-blue-500 text-sm px-2 py-1 border rounded">
                                    {value}
                                </span>
                            )
                        }
                        else{
                            return (
                                <span className="text-green-600 bg-green-100 border-green-500 text-sm px-2 py-1 border rounded">
                                    {value}
                                </span>
                            )
                        }
                    }
                },
            ]}
        />
    )
}