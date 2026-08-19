"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion, AnimatePresence } from "framer-motion"
import { faCheck, faChevronDown, faRefresh, faX } from "@fortawesome/free-solid-svg-icons"

export default function SelectInput({ icon, tag, placeholder, options, className, classSpan = '', onChange, dataSource, transform, disabled = false, error, required, helperText, ...props }){
    const [isEmpty, setIsEmpty] = useState(true)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const [suggestionWindow, setSuggestionWindow] = useState(false)

    const [internalOptions, setInternalOptions] = useState([])
    const [filteredOptions, setFilteredOptions] = useState([])
    const [loading, setLoading] = useState(!!dataSource)

    const resolvedOptions = dataSource ? internalOptions : options
    const [inputValue, setInputValue] = useState("")

    useEffect(() => {
        if (resolvedOptions.length > 0) {
            setFilteredOptions(resolvedOptions)
            setIsEmpty(false)
        }
    }, [resolvedOptions])

    const updateSelection = (e) => {
        const value = e.target.value
        setInputValue(value)

        if (!value) {
            setFilteredOptions(resolvedOptions)
            setIsEmpty(false)
            return
        }

        let filtered = resolvedOptions.filter((val) =>
            val.text.toLowerCase().includes(value.toLowerCase())
        )

        if(filtered.length < 1){
            setIsEmpty(true)
        } else {
            setIsEmpty(false)
            setFilteredOptions(filtered)
        }
    }

    const fetchData = async () => {
        if (!dataSource) return

        try {
            setLoading(true)
            
            const res = await dataSource()
            const normalized = transform
                ? res.map(transform)
                : res

            setInternalOptions(normalized)
        } catch (err) {
            console.error(err)
            setInternalOptions([])
        } finally {
            setLoading(false)
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

    const handleBlur = () => {
        setSuggestionWindow(false)

        // find exact match
        const matched = resolvedOptions.find(
            opt => opt.text.toLowerCase() === inputValue.toLowerCase()
        )

        if (matched) {
            // valid → sync value
            setInputValue(matched.text)
            triggerChange(matched.value)
        } else {
            if (props.value) {
                // fallback to last selected value
                const selected = resolvedOptions.find(opt => opt.value === props.value)
                setInputValue(selected?.text || "")
            } else {
                // no selection → clear
                setInputValue("")
                triggerChange("")
            }
        }
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
        if (dataSource && internalOptions.length === 0) {
            fetchData()
        }
    }, [])

    useEffect(() => {
        if (props.value !== undefined) {
            if (props.value && resolvedOptions.length === 0) {
                setInputValue("Loading...")
                return
            }

            const selected = resolvedOptions.find(opt => opt.value === props.value)

            if (selected) {
                setInputValue(selected.text)
            } else {
                setInputValue("")
            }
        }
    }, [props.value, resolvedOptions])

    useEffect(() => {
        if (highlightedIndex >= filteredOptions.length) {
            setHighlightedIndex(0)
        }
    }, [filteredOptions])

    return (
        <div className={`w-full relative ${classSpan}`}>
            <span className={`text-xs ${error ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                { tag ? tag : placeholder }
                { required && <span className="text-red-500 ml-0.5">*</span> }
            </span>

            <div className={`
                w-full flex items-center border-[0.5px] rounded-lg p-3 mt-1 gap-2 transition-all duration-300 ease-in-out ${className}

                ${disabled
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70'
                    : error
                        ? 'border-red-400 focus-within:border-red-500 focus-within:outline-4 outline-transparent focus-within:outline-red-200'
                        : 'border-gray-300 focus-within:border-black focus-within:outline-4 outline-transparent focus-within:outline-black/20 cursor-pointer'
                }
            `}>
                { icon &&
                    <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />
                }

                <input 
                    {...props}
                    className="w-full text-sm focus:outline-none disabled:cursor-not-allowed"
                    maxLength="50"
                    value={inputValue}
                    disabled={disabled}
                    placeholder={placeholder}
                    onFocus={() => {
                        setSuggestionWindow(true)

                        if (dataSource && internalOptions.length === 0) {
                            fetchData()
                        }

                        if (!inputValue) {
                            setFilteredOptions(resolvedOptions)
                            setIsEmpty(false)
                        }
                    }}
                    onBlur={handleBlur}
                    onChange={updateSelection}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            setHighlightedIndex(prev => (prev + 1) % filteredOptions.length)
                        }
                        if (e.key === "ArrowUp") {
                            setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length)
                        }
                        if (e.key === "Enter") {
                            if (filteredOptions.length > 0) {
                                saveValue(filteredOptions[highlightedIndex])
                            }

                            e.target.blur()
                        }
                        if (e.key === "Escape") {
                            setSuggestionWindow(false)
                        }
                    }}
                />

                <FontAwesomeIcon icon={faChevronDown} className={`text-gray-500 text-md duration-200 transition-transform ease-in-out ${suggestionWindow ? 'rotate-180' : 'rotate-0'}`} />
            </div>

            <AnimatePresence>
                { suggestionWindow &&
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, translateY: -10 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        exit={{ opacity: 0, scale: 0.95, translateY: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute border border-gray-200 bg-white min-w-50 shadow-lg/10 mt-1.5 rounded-lg w-full h-fit z-20"
                    >
                        <div className="overflow-y-scroll h-full p-2 max-h-32">
                            { 
                                loading ? (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                        Loading...
                                    </div>
                                ) :
                                filteredOptions.length < 1 ? (
                                    <div className="w-full px-3 py-1.5">
                                        <p className="text-sm">Tidak ada pilihan tersedia.</p>
                                    </div>
                                ) :
                                isEmpty ? (
                                    <div className="w-full px-3 py-1.5">
                                        <p className="text-sm">Tidak ditemukan opsi bernama "{inputValue}".</p>
                                    </div>
                                ) :
                                filteredOptions.map((val, i) => (
                                    <div 
                                        className={`
                                            flex justify-between items-center w-full px-3 py-2 rounded-md group transition-color ease-in-out duration-200
                                            ${highlightedIndex == i ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 hover:text-blue-800' : 'hover:bg-blue-200 hover:text-blue-800' }
                                            ${props.value === val.value ? 'bg-blue-500 text-white' : ''}
                                        `}
                                        key={i} 
                                        onMouseDown={() => saveValue(val)}>
                                        <p className="text-sm flex items-center /">
                                            {props.value === val.value
                                                ? val.text
                                                : highlightMatch(val.text, inputValue)
                                            }
                                        </p>
                                        {
                                            (props.value === val.value) && 
                                            <FontAwesomeIcon icon={faCheck} className="text-sm text-white group-hover:text-blue-800 transition-color ease-in-out duration-200" />
                                        }
                                    </div>
                                ))
                            }
                        </div>

                        {(!props.disabled && (inputValue != '')) && 
                            <div className={`flex gap-1 items-center justify-end border-t-[0.5px] border-t-gray-300 p-2`}>
                                { inputValue && (
                                    <div className="flex items-center gap-1 relative">
                                        <button 
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                setInputValue("")
                                                setFilteredOptions(resolvedOptions)
                                                setIsEmpty(false)
                                                triggerChange("")
                                            }}
                                            className="bg-red-500 flex items-center justify-center p-1 aspect-square rounded-full overflow-hidden group"
                                        >
                                            <FontAwesomeIcon icon={faX} className="text-[8px] transition-all duration-200 ease-in-out text-black opacity-0 group-hover:opacity-100" />
                                        </button>
                                    </div>
                                )}

                                { dataSource && (
                                    <div className="relative bg-yellow-500 flex items-center justify-center p-1 aspect-square rounded-full group" onMouseDown={(e) => {
                                        e.preventDefault()
                                        fetchData()
                                    }}>
                                        <FontAwesomeIcon icon={faRefresh} className="text-[8px] text-black opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out" />
                                    </div>
                                )}
                            </div>
                        }
                    </motion.div>
                }
            </AnimatePresence>

            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}

            {!error && helperText && (
                <p className="text-gray-400 text-xs mt-1">{helperText}</p>
            )}
        </div>
    )
}