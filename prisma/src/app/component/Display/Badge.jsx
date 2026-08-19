"use client"

const COLORS = {
    yellow: {
        strong: "text-yellow-600 bg-yellow-100 border-yellow-500",
        light: "text-yellow-600 bg-yellow-50 border-yellow-300",
        flat: "text-yellow-800 bg-yellow-100",
    },
    blue: {
        strong: "text-blue-600 bg-blue-100 border-blue-500",
        light: "text-blue-600 bg-blue-50 border-blue-300",
        flat: "text-blue-800 bg-blue-100",
    },
    green: {
        strong: "text-green-600 bg-green-100 border-green-500",
        light: "text-green-600 bg-green-50 border-green-300",
        flat: "text-green-800 bg-green-100",
    },
    red: {
        strong: "text-red-600 bg-red-100 border-red-500",
        light: "text-red-600 bg-red-50 border-red-300",
        flat: "text-red-800 bg-red-100",
    },
    gray: {
        strong: "text-gray-600 bg-gray-100 border-gray-500",
        light: "text-gray-600 bg-gray-50 border-gray-300",
        flat: "text-gray-800 bg-gray-100",
    },
    purple: {
        strong: "text-purple-600 bg-purple-100 border-purple-500",
        light: "text-purple-600 bg-purple-50 border-purple-300",
        flat: "text-purple-800 bg-purple-100",
    },
    orange: {
        strong: "text-orange-600 bg-orange-100 border-orange-500",
        light: "text-orange-600 bg-orange-50 border-orange-300",
        flat: "text-orange-800 bg-orange-100",
    },
    indigo: {
        strong: "text-indigo-600 bg-indigo-100 border-indigo-500",
        light: "text-indigo-600 bg-indigo-50 border-indigo-300",
        flat: "text-indigo-800 bg-indigo-100",
    },
    teal: {
        strong: "text-teal-600 bg-teal-100 border-teal-500",
        light: "text-teal-600 bg-teal-50 border-teal-300",
        flat: "text-teal-800 bg-teal-100",
    },
    cyan: {
        strong: "text-cyan-600 bg-cyan-100 border-cyan-500",
        light: "text-cyan-600 bg-cyan-50 border-cyan-300",
        flat: "text-cyan-800 bg-cyan-100",
    },
    emerald: {
        strong: "text-emerald-600 bg-emerald-100 border-emerald-500",
        light: "text-emerald-600 bg-emerald-50 border-emerald-300",
        flat: "text-emerald-800 bg-emerald-100",
    },
    amber: {
        strong: "text-amber-600 bg-amber-100 border-amber-500",
        light: "text-amber-600 bg-amber-50 border-amber-300",
        flat: "text-amber-800 bg-amber-100",
    },
}

const SIZES = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2 py-1",
}

export default function Badge({
    children,
    color = "gray",
    size = "sm",
    variant = "bordered",
    intensity = "strong",
    className = "",
}) {
    const colorClass = COLORS[color]?.[intensity] || COLORS.gray.strong
    const sizeClass = SIZES[size] || SIZES.sm
    const variantClass = variant === "pill" ? "rounded-full border" : variant === "soft" ? "rounded" : "rounded border"

    return (
        <span className={`inline-flex items-center whitespace-nowrap ${sizeClass} ${variantClass} ${colorClass} ${className}`}>
            {children}
        </span>
    )
}

export function StatusBadge({ status, statusStyles, className = "" }) {
    const style = statusStyles?.[status] || { color: "gray", label: status }
    return (
        <Badge color={style.color} size="sm" className={className}>
            {style.label || status}
        </Badge>
    )
}
