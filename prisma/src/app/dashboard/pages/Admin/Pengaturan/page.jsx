"use client"

import { useState } from "react"
import PengaturanUmum from "./PengaturanUmum/page"


export default function Pengaturan() {
    return (
        <div className="flex flex-col gap-5 min-h-screen">

            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">
                    Pengaturan
                </h1>

                <p className="text-lg text-gray-500 font-light">
                    Ubah konfigurasi dan pengaturan sistem LPPM disini.
                </p>
            </div>

            <PengaturanUmum />

        </div>
    )
}
