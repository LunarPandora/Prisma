"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import clsx from "clsx"

const sizes = {
    sm: {
        wrapper: "text-xs px-3 py-1.5 rounded-md gap-1.5",
        icon: "text-xs",
    },
    md: {
        wrapper: "text-sm px-4 py-2 rounded-lg gap-2",
        icon: "text-sm",
    },
    lg: {
        wrapper: "text-base px-5 py-2.5 rounded-lg gap-2",
        icon: "text-base",
    },
}

const variants = {
    primary: "bg-foreground/90 hover:bg-foreground text-white",
    secondary: "bg-white hover:bg-foreground text-foreground/90 hover:text-white border-2 border-foreground/80",
    danger: "bg-red-700 hover:bg-red-900 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
}

const disabledStyle = "bg-gray-200 text-gray-400 cursor-not-allowed"

export default function Button({
    icon,
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    className,
    ...props
}) {
    const s = sizes[size] || sizes.md

    return (
        <motion.button
            {...props}
            disabled={disabled}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
                "font-medium transition-colors duration-200 ease-in-out inline-flex items-center justify-center",
                s.wrapper,
                disabled ? disabledStyle : variants[variant],
                className
            )}
        >
            {icon && (
                <FontAwesomeIcon icon={icon} className={clsx("fa-fw", s.icon)} />
            )}
            {children}
        </motion.button>
    )
}
