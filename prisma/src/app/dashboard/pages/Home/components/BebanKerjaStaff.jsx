"use client"

const WORKLOAD_CATEGORIES = [
    { key: "seleksi_proposal", label: "Seleksi Proposal", color: "bg-blue-500", highlightPrefix: "action-proposal" },
    { key: "penugasan_reviewer", label: "Penugasan Reviewer", color: "bg-yellow-500", highlightPrefix: "action-proposal" },
    { key: "pemeriksaan_laporan", label: "Pemeriksaan Laporan", color: "bg-orange-500", highlightPrefix: "action-laporan" },
    { key: "konfirmasi_dana", label: "Konfirmasi Dana", color: "bg-teal-500", highlightPrefix: "action-dana" },
]

export default function BebanKerjaStaff({ data = {}, onCategoryClick }) {
    const entries = WORKLOAD_CATEGORIES
        .map(cat => ({ ...cat, count: data[cat.key] || 0 }))
        .filter(cat => cat.count > 0)

    const total = entries.reduce((sum, cat) => sum + cat.count, 0)

    if (total === 0) {
        return (
            <p className="text-sm text-gray-400 py-2">Tidak ada pekerjaan tertunda.</p>
        )
    }

    const maxCount = Math.max(...entries.map(c => c.count))

    return (
        <div className="flex flex-col gap-3">
            {WORKLOAD_CATEGORIES.map(cat => {
                const count = data[cat.key] || 0
                const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
                const isClickable = count > 0 && onCategoryClick

                return (
                    <div
                        key={cat.key}
                        className={`flex items-center gap-3 ${isClickable ? "cursor-pointer group" : ""}`}
                        onClick={isClickable ? () => onCategoryClick(cat.highlightPrefix) : undefined}
                        role={isClickable ? "button" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onKeyDown={isClickable ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                onCategoryClick(cat.highlightPrefix)
                            }
                        } : undefined}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm truncate ${isClickable ? "text-gray-600 group-hover:text-blue-600 transition-colors" : "text-gray-600"}`}>{cat.label}</span>
                                <span className="text-sm font-semibold text-gray-800 ml-2">{count}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${count > 0 ? cat.color : "bg-gray-200"}`}
                                    style={{ width: `${count > 0 ? Math.max(pct, 4) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
