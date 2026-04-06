"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"
import { useUserStore } from "../stores/useUserStore"
import { useLoaderStore } from "../stores/useLoaderStore"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'

import { initAuth, web } from "../lib/api"

export default function Login(){
    const router = useRouter()

    const setUser = useUserStore(state => state.setUser)
    const setLoginFailed = useUserStore(state => state.setLoginFailed)
    const start = useLoaderStore(state => state.start)
    const setProgress = useLoaderStore(state => state.setProgress)
    const finish = useLoaderStore(state => state.finish)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleLogin(){
        setLoading(true)
        start()

        try {
            setProgress(30)

            await initAuth()
            setProgress(40)

            const login = await web.post("/login", { email, password })
            setProgress(50)

            setUser(login.data)
            setProgress(60)

            await new Promise(r => setTimeout(r, 2000)) // let animation breathe
            setProgress(80)

            router.push("/dashboard")

            finish()
        } catch (err) {
            console.log(err)
            setLoginFailed()
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex items-center justify-center h-screen w-full bg-primary">
            <div className="bg-white w-1/4 h-80 rounded-xl flex flex-col items-center justify-center">
                <p className="text-foreground text-4xl font-medium pb-2">Login</p>

                <div className="flex flex-col w-full p-5 pb-0 gap-2">
                    <div className="w-full flex items-center border-[0.5px] border-gray-300 rounded-md px-3 py-2 gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 text-md" />
                        <input 
                            id="email" 
                            type="email" 
                            className="w-full text-sm focus:outline-none" 
                            placeholder="Masukkan email anda" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="w-full flex items-center border-[0.5px] border-gray-300 rounded-md px-3 py-2 gap-2">
                        <FontAwesomeIcon icon={faLock} className="text-gray-500 text-md" />
                        <input 
                            id="password" 
                            type="password" 
                            className="w-full text-sm focus:outline-none" 
                            placeholder="Masukkan password anda"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button onClick={handleLogin} disabled={loading} className="bg-primary hover:bg-secondary text-white text-lg px-5 py-2 rounded-lg font-medium mt-1 transition-colors duration-300 ease-in-out">{loading ? "Loading..." : "Masuk"}</button>
                </div>
            </div>
        </main>
    )
}