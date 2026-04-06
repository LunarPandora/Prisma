"use client"

import { useUserStore } from "../stores/useUserStore"
import { useLoaderStore } from "../stores/useLoaderStore"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }) {
    const user = useUserStore(state => state.user)
    const hasHydrated = useUserStore(state => state.hasHydrated)
    const sessionExpired = useUserStore(state => state.sessionExpired)
    const justLoggedOut = useUserStore(state => state.justLoggedOut)

    const start = useLoaderStore(state => state.start)
    const setProgress = useLoaderStore(state => state.setProgress)
    const finish = useLoaderStore(state => state.finish)
    const stop = useLoaderStore(state => state.stop)

    const router = useRouter()
    const hasTriggered = useRef(false)

    useEffect(() => {
        if (!hasHydrated) return;

        // Case 1: never logged in -> instant redirect
        if (!user && !sessionExpired && !justLoggedOut) {
            router.replace("/login");
            return;
        }

        // Case 2: session expired OR logout -> use loader transition
        if (!user && (sessionExpired || justLoggedOut)) {
            if (hasTriggered.current) return;
            hasTriggered.current = true;

            (async() => {
                start()
                setProgress(20)

                await new Promise(r => setTimeout(r, 500)) // let animation breathe
                setProgress(50)

                router.replace("/login");

                await new Promise(r => setTimeout(r, 500))
                setProgress(80)

                finish()

                await new Promise((r) => setTimeout(r, 500));
                stop()
            })();
        }
    }, [hasHydrated, user, sessionExpired, justLoggedOut]);

    return (
        <>
            {!hasHydrated ? null : user ? children : null}
        </>
    )
}