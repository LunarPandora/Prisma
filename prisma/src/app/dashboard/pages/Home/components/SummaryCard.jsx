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

export default function SummaryCard({ icon, label, value, subtitle, color = "blue", href, actionLabel, description, onCtaClick }) {
    const router = useRouter()
    const colorClasses = colorMap[color] || colorMap.blue
    const isPending = value > 0

    const handleClick = () => {
        if (onCtaClick) {
            onCtaClick()
        } else if (href && isPending) {
            router.push(href)
        }
    }

    return (
        <div
            className={`bg-white rounded-xl border p-4 flex flex-col gap-2 transition-all ${
                (onCtaClick || (href && isPending))
                    ? "border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer"
                    : "border-gray-200"
            } ${!isPending ? "opacity-60" : ""}`}
            onClick={handleClick}
        >
            <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                    <FontAwesomeIcon icon={icon} className="text-base" />
                </div>
                <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
            </div>

            <p className={`text-3xl font-bold leading-none ${isPending ? "text-gray-900" : "text-gray-300"}`}>
                {value}
            </p>

            {subtitle && (
                <p className="text-xs text-gray-400 leading-snug">{subtitle}</p>
            )}

            {description && (
                <p className="text-[11px] text-gray-400 line-clamp-1">{description}</p>
            )}

            {isPending && actionLabel && (
                <div className="mt-auto pt-1">
                    <span className="text-xs font-medium text-blue-600 flex items-center gap-1.5 transition-all">
                        {actionLabel}
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </span>
                </div>
            )}
        </div>
    )
}
