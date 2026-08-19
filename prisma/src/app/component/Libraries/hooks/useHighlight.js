"use client"

import { useRef, useCallback, useEffect } from "react"

const DEFAULT_DURATION = 1200
const PRIMARY_RGB = "1, 151, 202"

function applyHighlight(el) {
    el.style.boxShadow = `0 0 0 3px rgba(${PRIMARY_RGB}, 0.4)`
    el.style.backgroundColor = `rgba(${PRIMARY_RGB}, 0.06)`
    el.style.transition = "box-shadow 0.3s ease, background-color 0.3s ease"
}

function removeHighlight(el) {
    el.style.boxShadow = ""
    el.style.backgroundColor = ""
    el.style.transition = "box-shadow 0.4s ease, background-color 0.4s ease"
}

export default function useHighlight(duration = DEFAULT_DURATION) {
    const timersRef = useRef([])
    const observerRef = useRef(null)

    const clearAllTimers = useCallback(() => {
        timersRef.current.forEach(t => clearTimeout(t))
        timersRef.current = []
        if (observerRef.current) {
            observerRef.current.disconnect()
            observerRef.current = null
        }
    }, [])

    const highlightOne = useCallback((el, ms) => {
        clearAllTimers()

        applyHighlight(el)

        const timer = setTimeout(() => {
            removeHighlight(el)
            timersRef.current = timersRef.current.filter(t => t !== timer)
        }, ms)

        timersRef.current.push(timer)
    }, [clearAllTimers])

    const highlight = useCallback((targetId, options = {}) => {
        const { scroll = true, duration: overrideDuration } = options
        const ms = overrideDuration ?? duration

        clearAllTimers()

        const el = document.querySelector(`[data-highlight="${targetId}"]`)
        if (el) {
            doHighlight(el, ms, scroll)
            return
        }

        observerRef.current = new MutationObserver(() => {
            const found = document.querySelector(`[data-highlight="${targetId}"]`)
            if (found) {
                observerRef.current?.disconnect()
                observerRef.current = null
                doHighlight(found, ms, scroll)
            }
        })
        observerRef.current.observe(document.body, { childList: true, subtree: true })

        const fallbackTimer = setTimeout(() => {
            observerRef.current?.disconnect()
            observerRef.current = null
        }, 5000)
        timersRef.current.push(fallbackTimer)
    }, [duration, clearAllTimers])

    function doHighlight(el, ms, scroll) {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const effectiveMs = prefersReduced ? Math.min(ms, 400) : ms

        if (scroll) {
            const rect = el.getBoundingClientRect()
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
            if (!isVisible) {
                el.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }

        highlightOne(el, effectiveMs)
    }

    useEffect(() => {
        return () => clearAllTimers()
    }, [clearAllTimers])

    return highlight
}
