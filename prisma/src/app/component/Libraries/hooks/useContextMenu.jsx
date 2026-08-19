"use client"

import { useState } from "react"

export function useContextMenu() {
    const [contextMenu, setContextMenu] = useState(null)

    const openMenu = (e, type = "main", data = null, source = 'hover') => {
        e.preventDefault()
        e.stopPropagation()

        let pos = {}
        if(source == 'btn'){
            const p = e.currentTarget.getBoundingClientRect()
            pos = {clientX: p.x, clientY: p.y + 20}
        }
        else{
            pos = e
        }

        setContextMenu({
            x: pos.clientX,
            y: pos.clientY,
            type,
            data
        })
    }

    const closeMenu = () => setContextMenu(null)

    return {
        contextMenu,
        openMenu,
        closeMenu
    }
}