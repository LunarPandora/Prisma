import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"

const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    cyan: "bg-cyan-50 text-cyan-600",
}

export default function SummaryCard({ icon, label, value, subtitle, color = "blue", href, actionLabel, description }) {
    const router = useRouter()
    const colorClasses = colorMap[color] || colorMap.blue
    const isPending = value > 0

    return (
        <div
            className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-all ${
                href && isPending
                    ? "border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer"
                    : "border-gray-200"
            } ${!isPending ? "opacity-60" : ""}`}
            onClick={href && isPending ? () => router.push(href) : undefined}
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                <FontAwesomeIcon icon={icon} className="text-lg" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${isPending ? "text-gray-800" : "text-gray-400"}`}>{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                )}
                {description && (
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{description}</p>
                )}
                {href && isPending && actionLabel && (
                    <p className="text-xs font-medium text-blue-600 mt-1.5 flex items-center gap-1">
                        {actionLabel}
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </p>
                )}
            </div>
        </div>
    )
}
