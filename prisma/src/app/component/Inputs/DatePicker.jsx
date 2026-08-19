"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DayPicker } from "react-day-picker"
import { formatIndonesianRange } from "../Libraries/utils/date"
import { id } from "react-day-picker/locale";

export default function DatePicker({ date, tag, icon, placeholder, dateUpdate, mode, className }){
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

            <div className={`w-full flex items-center border-[0.5px] border-gray-300 rounded-lg p-3 mt-1 focus-within:border-black focus-within:outline-4 outline-transparent focus-within:outline-black/20 transition-all duration-300 ease-in-out gap-2`} onClick={() => setCalendar(true)}>

                <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />
                <p className="text-sm">
                    {date?.from && date?.to
                        ? formatIndonesianRange(date)
                        : tag ? tag : placeholder}
                </p>

                <AnimatePresence>
                    { calendar && 
                        <motion.div
                            key="kegiatanModal"
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
                                onSelect={handleSelect}
                            />
                        </motion.div>
                    }
                </AnimatePresence>
            </div>       
        </div> 
    )
}