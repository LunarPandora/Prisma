"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence } from "framer-motion"

import Alert from "../component/Alert/Alert"
import Navbar from "../component/Panel/Navbar"
import { useUserStore } from "../stores/useUserStore"
import { useLoaderStore } from "../stores/useLoaderStore"
import { dashboardModules } from "../component/Libraries/utils/menu"

function DashboardContent(){    
    const user = useUserStore(state => state.user)
    const searchParams = useSearchParams()

    const start = useLoaderStore(state => state.start)
    const setProgress = useLoaderStore(state => state.setProgress)
    const finish = useLoaderStore(state => state.finish)

    const allowedModules = useMemo(() => user
        ? dashboardModules.filter(m =>
            !m.hidden && m.roles.some(role => role.name === user.role)
        )
        : [],
    [user])

    const allModulesForUser = useMemo(() => user
        ? dashboardModules.filter(m =>
            m.roles.some(role => role.name === user.role)
        )
        : [],
    [user])

    const [active, setActive] = useState(null)
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    const [logoutAlert, setLogoutAlert] = useState(null)
    const router = useRouter()

    const handleSetActive = (key) => {
        setActive(key)
        const url = key === allowedModules[0]?.key
            ? "/dashboard"
            : `/dashboard?module=${key}`
        window.history.replaceState(null, "", url)
    }

    useEffect(() => {
        if (allModulesForUser.length === 0) return

        const moduleParam = searchParams.get("module")
        if (moduleParam && allModulesForUser.some(m => m.key === moduleParam)) {
            if (active !== moduleParam) setActive(moduleParam)
        } else {
            const firstKey = allowedModules[0]?.key
            if (firstKey && active !== firstKey) setActive(firstKey)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const activeModule =
        allModulesForUser.find(m => m.key === active) || allowedModules[0]

    const ActiveComponent = activeModule?.component

    async function logout() {
        const store = useUserStore.getState()

        try {
            const { web } = await import("../component/Libraries/utils/api")
            await web.post("/logout")
        } catch (err) {
            // Ignore logout API errors, proceed with local cleanup
        }

        store.logout()
        useUserStore.persist.clearStorage()

        start()
        setProgress(30)

        await new Promise(r => setTimeout(r, 500))
        setProgress(60)

        await new Promise(r => setTimeout(r, 800))
        setProgress(85)

        await new Promise(r => setTimeout(r, 500))

        router.push("/login")
        finish()
    }

    if (allowedModules.length === 0) {
        return (
            <main className="relative flex bg-background min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-500 mb-4">Tidak ada modul yang tersedia untuk role Anda.</p>
                    <button onClick={logout} className="text-sm text-blue-500 hover:underline">
                        Logout
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="relative flex bg-background min-h-screen">
            <Navbar
                user={user}
                setActive={handleSetActive}
                active={active}
                modules={allowedModules}
                onLogout={() => setLogoutAlert(true)}
                onExpandChange={setSidebarExpanded}
            />

            <div className={`w-full py-12 transition-all duration-300 ease-in-out ${sidebarExpanded ? "pl-70 pr-8" : "pl-32 pr-16"}`}>
                {ActiveComponent && <ActiveComponent key={active} />}
            </div>

            <AnimatePresence>
                {logoutAlert && (
                    <Alert 
                        title="Logout"
                        msg="Apakah anda yakin ingin logout?" 
                        onCancel={() => setLogoutAlert(false)} 
                        onAccept={() => logout()}
                        acceptText="Logout"
                        isConfirmation={true}
                    /> 
                )}
            </AnimatePresence>
        </main>
    )
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <main className="relative flex bg-background min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-500">Memuat...</p>
                </div>
            </main>
        }>
            <DashboardContent />
        </Suspense>
    )
}
