"use client"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { createPortal } from "react-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DayPicker } from "react-day-picker"
import { formatIndonesianRange } from "../Libraries/utils/date"
import { id } from "react-day-picker/locale";

export default function DatePicker({ date, tag, icon, placeholder, dateUpdate, mode, className }){
    const [calendar, setCalendar] = useState(false)
    const wrapperRef = useRef(null)
    const inputRef = useRef(null)
    const portalPosRef = useRef({ top: 0, left: 0 })
    const [portalPos, setPortalPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                wrapperRef.current && !wrapperRef.current.contains(e.target) &&
                !document.getElementById("datepicker-portal")?.contains(e.target)
            ) {
                setCalendar(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleToggle = () => {
        if (!calendar && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            const pos = {
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
            }
            portalPosRef.current = pos
            setPortalPos(pos)
        }
        setCalendar(prev => !prev)
    }

    const handleSelect = (selected) => {
        if (mode === "single") {
            dateUpdate(selected ? { from: selected, to: selected } : null)
        } else {
            dateUpdate(selected)
        }
    }

    return (
        <div className={`w-full relative ${className}`} ref={wrapperRef}>
            <span className="text-gray-500 text-xs">{ tag ? tag : placeholder }</span>

            <div ref={inputRef} className="w-full flex items-center border-[0.5px] border-gray-300 rounded-lg p-3 mt-1 focus-within:border-black focus-within:outline-4 outline-transparent focus-within:outline-black/20 transition-all duration-300 ease-in-out gap-2" onClick={handleToggle}>
                <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />
                <p className="text-sm">
                    {date?.from && date?.to
                        ? formatIndonesianRange(date)
                        : tag ? tag : placeholder}
                </p>
            </div>

            {calendar && createPortal(
                <motion.div
                    id="datepicker-portal"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed z-[9999] bg-white rounded-lg p-4 drop-shadow-lg border border-gray-200"
                    style={{ top: portalPos.top, left: portalPos.left }}
                >
                    <DayPicker
                        animate
                        mode={mode}
                        selected={{
                            from: date?.from ? new Date(date.from) : undefined,
                            to: date?.to ? new Date(date.to) : undefined
                        }}
                        locale={id}
                        onSelect={handleSelect}
                    />
                </motion.div>,
                document.body
            )}
        </div>
    )
}
