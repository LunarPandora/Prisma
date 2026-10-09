"use client"

import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"

import Proposal from "./Proposal/page"
import Laporan from "./Laporan/page"
import SkemaSelection from "./SkemaSelection"

function clearHighlightParams() {
    const url = new URL(window.location.href)
    url.searchParams.delete("proposal_id")
    url.searchParams.delete("laporan_id")
    url.searchParams.delete("tab")
    window.history.replaceState(null, "", url.pathname + url.search)
}

function clearDeepLinkParams() {
    const url = new URL(window.location.href)
    url.searchParams.delete("skema_id")
    url.searchParams.delete("view")
    url.searchParams.delete("proposal_id")
    url.searchParams.delete("laporan_id")
    url.searchParams.delete("tab")
    url.searchParams.delete("jenis")
    window.history.replaceState(null, "", url.pathname + url.search)
}

export default function AdminMonitoringPengajuan() {
    const searchParams = useSearchParams()
    const initialSkemaId = searchParams.get("skema_id")
    const initialView = searchParams.get("view")
    const initialHighlightId = searchParams.get("proposal_id") || searchParams.get("laporan_id") || null
    const initialTab = searchParams.get("tab") || null
    const initialJenis = searchParams.get("jenis") || null

    const [selectedSkema, setSelectedSkema] = useState(null)
    const [view, setView] = useState(null)

    const handleHighlightComplete = useCallback(() => {
        clearHighlightParams()
    }, [])

    if (selectedSkema && view === "proposal") {
        return (
            <Proposal
                skema={selectedSkema}
                highlightId={initialHighlightId}
                initialTab={initialTab}
                initialJenis={initialJenis}
                onHighlightComplete={handleHighlightComplete}
                onBack={() => {
                    clearDeepLinkParams()
                    setView(null)
                    setSelectedSkema(null)
                }}
            />
        )
    }

    if (selectedSkema && view === "laporan") {
        return (
            <Laporan
                skema={selectedSkema}
                highlightId={initialHighlightId}
                initialTab={initialTab}
                initialJenis={initialJenis}
                onHighlightComplete={handleHighlightComplete}
                onBack={() => {
                    clearDeepLinkParams()
                    setView(null)
                    setSelectedSkema(null)
                }}
            />
        )
    }

    return (
        <SkemaSelection
            initialSkemaId={initialSkemaId}
            initialView={initialView}
            onSelectSkema={(skema, type) => {
                setSelectedSkema(skema)
                setView(type)
            }}
        />
    )
}
