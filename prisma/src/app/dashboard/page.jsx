"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import Alert from "../component/Alert"
import Navbar from "../component/Navbar"
import { useUserStore } from "../stores/useUserStore"
import { useLoaderStore } from "../stores/useLoaderStore"
import { dashboardModules } from "../lib/menu"

export default function Dashboard(){    
    const user = useUserStore(state => state.user)

    const start = useLoaderStore(state => state.start)
    const setProgress = useLoaderStore(state => state.setProgress)
    const finish = useLoaderStore(state => state.finish)

    const allowedModules = user
        ? dashboardModules.filter(module =>
            module.roles.some(role => role.name === user.role)
        )
        : []

    const [active, setActive] = useState(null)
    const [logoutAlert, setLogoutAlert] = useState(null)
    const router = useRouter()

    useEffect(() => {
        if (allowedModules.length > 0 && !active) {
            setActive(allowedModules[0].key)
        }
    }, [allowedModules])

    const activeModule =
        allowedModules.find(m => m.key === active) || allowedModules[0]

    const ActiveComponent = activeModule?.component

    if (allowedModules.length === 0) {
        return router.push("/login")
    }

    async function logout() {
        const store = useUserStore.getState()

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

    return (
        <main className="relative flex bg-background min-h-screen">
            <Navbar
                setActive={setActive}
                modules={allowedModules}
                onLogout={() => setLogoutAlert(true)}
            />

            <div className="w-full pr-16 pl-32 py-12">
                {ActiveComponent && <ActiveComponent />}
            </div>

            <AnimatePresence>
                {logoutAlert && (
                    <motion.div
                        key="logoutModal"
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                    >   
                        <Alert 
                            title="Logout"
                            msg="Apakah anda yakin ingin logout?" 
                            onCancel={() => setLogoutAlert(false)} 
                            onAccept={() => logout()}
                            acceptText="Logout"
                            isConfirmation={true}
                        /> 
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

