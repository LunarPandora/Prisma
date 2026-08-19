"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/app/stores/useUserStore"

export default function LoginLayout({ children }) {
    const router = useRouter()
    const user = useUserStore(state => state.user)
    const hasHydrated = useUserStore(state => state.hasHydrated)

    useEffect(() => {
        if (hasHydrated && user) {
            router.replace("/dashboard")
        }
    }, [hasHydrated, user, router])

    // Don't render children until hydration check is complete
    if (!hasHydrated) return null
    if (user) return null

    return children
}
