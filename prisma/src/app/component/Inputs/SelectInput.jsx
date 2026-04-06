"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion, AnimatePresence } from "framer-motion"
import { faCross, faX } from "@fortawesome/free-solid-svg-icons"

export default function SelectInput({ icon, placeholder, options, className, onChange, ...props }){
    const [isEmpty, setIsEmpty] = useState(true)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const [suggestionWindow, setSuggestionWindow] = useState(false)
    const [filteredOptions, setFilteredOptions] = useState(options)
    const [inputValue, setInputValue] = useState("")

    useEffect(() => {
        if(options.length > 0){
            setIsEmpty(false)
            setFilteredOptions(options)
        }
    }, [options])

    const updateSelection = (e) => {
        const value = e.target.value
        setInputValue(value)

        triggerChange(value)

        if (!value) {
            setFilteredOptions(options) // 👈 reset to full list
            setIsEmpty(false)
            return
        }

        let filtered = options.filter((val) =>
            val.text.toLowerCase().includes(value.toLowerCase())
        )

        if(filtered.length < 1){
            setIsEmpty(true)
        } else {
            setIsEmpty(false)
            setFilteredOptions(filtered)
        }
    }

    const saveValue = (val) => {
        setInputValue(val.text)
        setSuggestionWindow(false)

        triggerChange(val.value)
    }

    const triggerChange = (value) => {
        onChange?.({
            target: {
                name: props.name,
                value: value
            }
        })
    }

    const escapeRegex = (str) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }

    const highlightMatch = (text, query) => {
        if (!query) return text

        const safeQuery = escapeRegex(query)
        const regex = new RegExp(`(${safeQuery})`, "gi")

        return text.split(regex).map((part, i) => {
            if (part.toLowerCase() === query.toLowerCase()) {
                return (
                    <span key={i} className="bg-yellow-400 font-medium rounded-sm">
                        {part}
                    </span>
                )
            }
            return part
        })
    }

    useEffect(() => {
        if (props.value !== undefined) {
            const selected = options.find(opt => opt.value === props.value)

            if (selected) {
                setInputValue(selected.text)
            } else {
                setInputValue(props.value || "")
            }
        }
    }, [props.value, options])

    return (
        <div className="w-full relative"> 
            <div className={`w-full flex items-center border-[0.5px] border-gray-300 rounded-md px-3 py-3 gap-2 relative ${className}`}>
                <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />

                <AnimatePresence>
                    { inputValue.length > 0 &&
                        <motion.span
                            initial={{ opacity: 0, scale: 0.95, translateY: 0 }}
                            animate={{ opacity: 1, scale: 1, translateY: -10 }}
                            exit={{ opacity: 0, scale: 0.95, translateY: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400 text-xs absolute top-0 bg-white px-2 left-2"
                        >
                            { placeholder }
                        </motion.span>
                    }
                </AnimatePresence>

                <input 
                    {...props}
                    className="w-full text-sm focus:outline-none"
                    maxLength="50"
                    value={inputValue}
                    placeholder={placeholder}
                    onFocus={() => {
                        setSuggestionWindow(true)

                        if (!inputValue) {
                            setFilteredOptions(options)
                            setIsEmpty(false)
                        }
                    }}
                    onBlur={() => setSuggestionWindow(false)}
                    onChange={updateSelection}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            setHighlightedIndex(prev => (prev + 1) % filteredOptions.length)
                        }
                        if (e.key === "ArrowUp") {
                            setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length)
                        }
                        if (e.key === "Enter") {
                            saveValue(filteredOptions[highlightedIndex])
                        }
                        if (e.key === "Escape") {
                            setSuggestionWindow(false)
                        }
                    }}
                />

                {inputValue && (
                    <button onMouseDown={() => {
                        setInputValue("")
                        setFilteredOptions(options)
                        setIsEmpty(false)
                        triggerChange("")
                    }}>
                        <FontAwesomeIcon icon={faX} className="text-sm" />
                    </button>
                )}
            </div>
            <AnimatePresence>
                { suggestionWindow &&
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, translateY: -10 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        exit={{ opacity: 0, scale: 0.95, translateY: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute border border-gray-200 bg-white min-w-50 shadow-sm left-3 p-1 rounded-md w-fit h-fit max-h-30 overflow-y-scroll z-20"
                    >
                        { (isEmpty) ? 
                            <div className="w-full px-3 py-1.5">
                                <p className="text-sm">Tidak ditemukan opsi bernama "{inputValue}".</p>
                            </div>
                            :
                            filteredOptions.map((val, i) => (
                                <div className={`w-full px-3 py-1.5 rounded-sm hover:bg-gray-100 ${highlightedIndex == i ? 'bg-blue-100' : '' }`} key={i} onMouseDown={() => saveValue(val)}>
                                    <p className="text-sm">
                                        {highlightMatch(val.text, inputValue)}
                                    </p>
                                </div>
                            ))
                        }
                    </motion.div>
                }
            </AnimatePresence>
            
        </div>
        
    )
}