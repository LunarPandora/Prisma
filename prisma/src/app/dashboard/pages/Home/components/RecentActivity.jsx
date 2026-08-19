"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileLines, faClipboardCheck } from "@fortawesome/free-solid-svg-icons"
import EmptyState from "./EmptyState"
import { relativeTime } from "@/app/component/Libraries/utils/date"

const TYPE_ICONS = {
    proposal: faFileLines,
    laporan: faClipboardCheck,
}

const TYPE_LABELS = {
    proposal: "Proposal",
    laporan: "Laporan",
}

export default function RecentActivity({ items = [] }) {
    if (items.length === 0) {
        return <EmptyState message="Belum ada perubahan terbaru" />
    }

    return (
        <div className="flex flex-col gap-0">
            {items.map((item, index) => (
                <div
                    key={`${item.type}-${index}`}
                    className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
                >
                    <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon
                            icon={TYPE_ICONS[item.type] || faFileLines}
                            className="text-gray-400 text-xs"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                {TYPE_LABELS[item.type] || item.type}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 truncate">
                            {item.title}
                        </p>
                        {item.description && (
                            <p className="text-xs text-gray-400 truncate">
                                {item.description}
                            </p>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {relativeTime(item.time)}
                    </span>
                </div>
            ))}
        </div>
    )
}
