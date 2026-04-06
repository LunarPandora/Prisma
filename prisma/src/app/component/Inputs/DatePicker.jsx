"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DayPicker } from "react-day-picker"
import { formatIndonesianRange } from "../../lib/date"
import { id } from "react-day-picker/locale";

export default function DatePicker({ date, icon, footerPlaceholder, dateUpdate, mode, className }){
    const [calendar, setCalendar] = useState(false)
    const wrapperRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setCalendar(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div ref={wrapperRef} className={`w-full flex items-center border-[0.5px] border-gray-300 rounded-md px-3 py-3 gap-2 relative ${className}`} onClick={() => setCalendar(true)}>
            <span className="text-gray-400 text-xs absolute top-0 -translate-y-2.5 bg-white px-2 left-2">{ footerPlaceholder }</span>

            <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />
            <p class="text-sm">
                {date?.from && date?.to
                    ? formatIndonesianRange(date)
                    : footerPlaceholder}
            </p>

            <AnimatePresence>
                { calendar && 
                    <motion.div
                        key="periodeModal"
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(3px)" }}
                        transition={{ duration: 0.2 }}
                        className="absolute -top-40 right-0 z-10 bg-linear-to-t from-black/20 to-white/80 backdrop-blur-md rounded-lg p-5 drop-shadow-lg border border-gray-300"
                    >
                        <DayPicker
                            animate
                            mode={mode}
                            selected={{
                                from: date?.from ? new Date(date.from) : undefined,
                                to: date?.to ? new Date(date.to) : undefined
                            }}
                            locale={id}
                            onSelect={(date) => dateUpdate(date)}
                        />
                    </motion.div>
                }
            </AnimatePresence>
        </div>        
    )
}