"use client"

import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    animate
} from "framer-motion"
import { useEffect, useState } from "react"

import { useUserStore } from "@/app/stores/useUserStore"
import { useLoaderStore } from "@/app/stores/useLoaderStore"
import Alert from "../Alert/Alert"

export default function AppLoader() {
    const { isLoading, setProgress, progress, start, stop } = useLoaderStore()
    
    const user = useUserStore(state => state.user)
    const hasHydrated = useUserStore(state => state.hasHydrated)
    const justLoggedOut = useUserStore(state => state.justLoggedOut)
    const sessionExpired = useUserStore((state) => state.sessionExpired)
    const loginFailed = useUserStore((state) => state.loginFailed)
    const clearLogoutFlag = useUserStore(state => state.clearLogoutFlag)
    const clearSessionExpired = useUserStore((state) => state.clearSessionExpired)
    const clearLoginFailed = useUserStore((state) => state.clearLoginFailed)
    
    const [message, setMessage] = useState("Loading...")
    const [showAlert, setShowAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')
    const [alertStatus, setAlertStatus] = useState('success')

    useEffect(() => {
        if (!hasHydrated) return;

        let timer;
        let interval;

        if (loginFailed) {
            start()

            setAlertMsg("Login gagal. Periksa kembali kredensial Anda.")
            setAlertStatus("danger")

            setShowAlert(true)
            setProgress(100)

            interval = setInterval(() => {
                const current = useLoaderStore.getState().progress;

                if (current <= 0) {
                    clearInterval(interval);
                    clearLoginFailed();
                    setProgress(0);
                    return;
                }

                setProgress(current - 1);
            }, 10);

            setTimeout(() => stop(), 2000) // let animation breathe
        }
        else if (sessionExpired) {
            setMessage("Sesi Anda telah berakhir. Silakan login kembali.");
            timer = setTimeout(() => {
                clearSessionExpired()
            }, 1500)
        } else if (justLoggedOut) {
            setMessage("Anda telah logout.")
            timer = setTimeout(() => {
                clearLogoutFlag()
            }, 1500)
        } else if (user) {
            setMessage(`Selamat datang, ${user.nama}.`)
        } else {
            setMessage("Loading...")
        }

        return () => {
            if (timer) clearTimeout(timer);
            if (interval) clearInterval(interval);
        }
    }, [hasHydrated, user, justLoggedOut, sessionExpired, loginFailed]);

    const smooth = useMotionValue(0)
    const y = useTransform(smooth, [0, 100], [90, -70])

    useEffect(() => {
        const controls = animate(smooth, progress, {
            duration: 0.3,
            ease: "easeInOut",
        })
        return () => controls.stop()
    }, [progress])

    useEffect(() => {
        if (progress === 100 && !loginFailed) {
            const t = setTimeout(() => stop(), 800)
            return () => clearTimeout(t)
        }
    }, [progress, loginFailed])

    useEffect(() => {
        if (showAlert) {
            const t = setTimeout(() => setShowAlert(false), 2000);
            return () => clearTimeout(t);
        }
    }, [showAlert]);

    return (
        <>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="fixed inset-0 z-40 bg-foreground flex flex-col items-center justify-center"
                    >
                        <div className="relative w-full max-w-[800px] h-[200px]">
                            {/* background text */}
                            <div className="absolute inset-0 flex items-center justify-center text-[170px] font-bold text-white/20">
                                Prisma
                            </div>

                            <svg
                                viewBox="0 0 800 200"
                                className="absolute inset-0 w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <defs>
                                    <mask id="text-mask">
                                        <rect width="100%" height="100%" fill="black" />

                                        {/* perfectly centered */}
                                        <text
                                            x="50%"
                                            y="50%"
                                            textAnchor="middle"
                                            dy="0.36em"
                                            fontSize="170px"
                                            fontWeight="bold"
                                            fill="url(#waterGlow)"
                                        >
                                            Prisma
                                        </text>
                                    </mask>

                                    <linearGradient id="waterGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                                        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                                    </linearGradient>
                                </defs>

                                <g mask="url(#text-mask)">
                                    <motion.path
                                        d="M0,100 C150,180 350,20 500,100 C650,180 850,20 1000,100"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                        opacity="0.8"
                                        style={{ y }}
                                        animate={{ x: [0, -1000] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 5,
                                            ease: "linear"
                                        }}
                                    />

                                    {/* 🌊 Wave 1 (seamless) */}
                                    <motion.g
                                        style={{ y }}
                                        animate={{ x: [0, -1000] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 5,
                                            ease: "linear"
                                        }}
                                    >
                                        {/* duplicate paths */}
                                        <path
                                            d="M0,100 C150,180 350,20 500,100 C650,180 850,20 1000,100 L1000,400 L0,400 Z"
                                            fill="url(#waterGlow)"
                                        />
                                        <path
                                            d="M1000,100 C1150,180 1350,20 1500,100 C1650,180 1850,20 2000,100 L2000,400 L1000,400 Z"
                                            fill="url(#waterGlow)"
                                        />
                                    </motion.g>

                                    {/* 🌊 Wave 2 (seamless, opposite direction) */}
                                    <motion.g
                                        style={{ y }}
                                        animate={{ x: [-1000, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 7,
                                            ease: "linear"
                                        }}
                                    >
                                        <path
                                            d="M0,120 C200,40 400,200 600,120 C800,40 900,200 1000,120 L1000,400 L0,400 Z"
                                            fill="white"
                                            opacity="0.5"
                                        />
                                        <path
                                            d="M1000,120 C1200,40 1400,200 1600,120 C1800,40 1900,200 2000,120 L2000,400 L1000,400 Z"
                                            fill="white"
                                            opacity="0.5"
                                        />
                                    </motion.g>
                                </g>
                            </svg>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.p
                                initial={{ y: "5%", opacity: 0 }}
                                animate={{ y: "0%", opacity: 1 }}
                                exit={{ y: "5%", opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="text-white text-lg"
                            >
                                {message}
                            </motion.p>
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAlert && (
                    <Alert 
                        msg={alertMsg}
                        alertType={alertStatus}
                    />
                )}
            </AnimatePresence>
        </>
    )
}