"use client"

import { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion, AnimatePresence } from "framer-motion"
import { faCheck, faChevronDown, faRefresh, faX } from "@fortawesome/free-solid-svg-icons"

export default function SelectInputMulti({
    icon,
    tag,
    placeholder,
    options = [],
    className,
    onSelect,
    dataSource,
    transform,
    disabled = false,
    before,
    onReset,
    selectedValues = [],
    onCreateNew,
    maxCount,
    maxCountLabel
}) {
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const [suggestionWindow, setSuggestionWindow] = useState(false)

    const [internalOptions, setInternalOptions] = useState([])
    const [filteredOptions, setFilteredOptions] = useState([])

    const [loading, setLoading] = useState(!!dataSource)
    const [inputValue, setInputValue] = useState("")

    const containerRef = useRef(null)
    const ignoreClickRef = useRef(false)

    const resolvedOptions = dataSource ? internalOptions : options
    const usableOptions = resolvedOptions

    useEffect(() => {
        setFilteredOptions(usableOptions)
    }, [resolvedOptions, selectedValues])

    const fetchData = async () => {
        if (!dataSource) return

        try {
            setLoading(true)

            const res = await dataSource()
            const normalized = transform
                ? res.map(item => ({
                    ...transform(item),
                    __raw: item
                }))
                : res.map(item => ({
                    ...item,
                    __raw: item
                }))

            setInternalOptions(normalized)
        } catch (err) {
            console.error(err)
            setInternalOptions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (dataSource && internalOptions.length === 0) {
            fetchData()
        }
    }, [dataSource])

    const updateSelection = (e) => {
        const value = e.target.value

        if (!inputValue && selectedValues.length > 0) {
            setInputValue("")
        }

        setInputValue(value)

        if (!value) {
            setFilteredOptions(usableOptions)
            return
        }

        const filtered = usableOptions.filter(val =>
            val.text.toLowerCase().includes(value.toLowerCase())
        )

        setFilteredOptions(filtered)
        setHighlightedIndex(0)
    }

    const handleSelect = (val) => {
        const isSelected = selectedValues.includes(val.value)

        if (!isSelected && maxCount && selectedValues.length >= maxCount) {
            return
        }

        onSelect?.({
            type: isSelected ? "remove" : "add",
            mapped: val,
            raw: val.__raw || val
        })

        setInputValue("")
        setHighlightedIndex(0)
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ignoreClickRef.current) {
                ignoreClickRef.current = false
                return
            }

            if (!containerRef.current) return

            if (!containerRef.current.contains(e.target)) {
                setSuggestionWindow(false)
                setInputValue("")
                setHighlightedIndex(0)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const escapeRegex = (str) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    const highlightMatch = (text, query) => {
        if (!query) return text

        const regex = new RegExp(`(${escapeRegex(query)})`, "gi")

        return text.split(regex).map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="bg-yellow-400 rounded-sm">{part}</span>
                : part
        )
    }

    useEffect(() => {
        if (highlightedIndex >= filteredOptions.length) {
            setHighlightedIndex(0)
        }
    }, [filteredOptions])

    const displayValue = inputValue
    ? inputValue
    : selectedValues.length > 0
        ? `${selectedValues.length} data dipilih`
        : ""

    const isMaxReached = maxCount && selectedValues.length >= maxCount

    return (
        <div className="w-full relative" ref={containerRef}>
            <span className="text-gray-500 text-xs">
                { tag ? tag : placeholder }
            </span>

            <div className={`
                w-full flex items-center border-[0.5px] rounded-lg p-3 mt-1 gap-2 transition-all duration-300 ease-in-out ${className}

                ${disabled
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70'
                    : 'border-gray-300 focus-within:border-black focus-within:outline-4 outline-transparent focus-within:outline-black/20 cursor-pointer'
                }
            `}>
                { icon &&
                    <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />
                }

                <input
                    className="w-full text-sm focus:outline-none disabled:cursor-not-allowed"
                    value={isMaxReached && !inputValue ? `${maxCountLabel || `${selectedValues.length}/${maxCount} dipilih`}` : displayValue}
                    placeholder={isMaxReached ? "Batas maksimum tercapai" : placeholder}
                    disabled={disabled}
                    readOnly={isMaxReached && !inputValue}
                    onFocus={() => {
                        setSuggestionWindow(true)

                        if (!inputValue) {
                            setInputValue("") // ensures clean typing state
                            setFilteredOptions(usableOptions)
                        }

                        if (dataSource && internalOptions.length === 0) {
                            fetchData()
                        }
                    }}
                    onChange={updateSelection}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            setHighlightedIndex(prev => (prev + 1) % filteredOptions.length)
                        }
                        if (e.key === "ArrowUp") {
                            setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length)
                        }
                        if (e.key === "Enter" && filteredOptions.length > 0) {
                            handleSelect(filteredOptions[highlightedIndex])
                        }
                        if (e.key === "Escape") {
                            setSuggestionWindow(false)
                        }
                    }}
                />

                <FontAwesomeIcon icon={faChevronDown} className={`text-gray-500 text-md duration-200 transition-transform ease-in-out ${suggestionWindow ? 'rotate-180' : 'rotate-0'}`} />
            </div>

            <AnimatePresence>
                {suggestionWindow && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, translateY: -10 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        exit={{ opacity: 0, scale: 0.95, translateY: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute border border-gray-200 bg-white min-w-50 shadow-lg/10 mt-1.5 rounded-lg w-full h-fit z-20"
                    >
                        <div className="overflow-y-scroll h-full p-2 max-h-32">
                            { loading ? (
                                <div className="p-2 text-sm text-gray-500">
                                    Loading...
                                </div>
                            ) : filteredOptions.length === 0 ? (
                                <>
                                    <div className="p-2 text-sm text-gray-500">
                                        Tidak ada pilihan tersedia.
                                    </div>

                                    {onCreateNew && inputValue.trim() !== "" && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                onCreateNew(inputValue)
                                            }}
                                            className="
                                                w-full
                                                text-left
                                                px-3 py-2
                                                text-sm
                                                text-blue-600
                                                hover:bg-blue-50
                                                rounded-md
                                            "
                                        >
                                            + Tambahkan "{inputValue}" sebagai data baru
                                        </button>
                                    )}
                                </>
                            ) : (
                                filteredOptions.map((val, i) => {
                                    const isSelected = selectedValues.includes(val.value)
                                    const isActive = highlightedIndex === i
                                    const isDisabled = isMaxReached && !isSelected

                                        // console.log({
                                        //     selectedValues,
                                        //     optionValue: val.value
                                        // })

                                    return (
                                        <div
                                            key={i}
                                            onMouseDown={() => {
                                                if (!isDisabled) handleSelect(val)
                                            }}
                                            className={`
                                                flex justify-between items-center w-full px-3 py-2 rounded-md group transition-color ease-in-out duration-200 
                                                ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                                                ${isActive && !isDisabled ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 hover:text-blue-800' : 'hover:bg-blue-200 hover:text-blue-800'}
                                            `}
                                        >
                                            <p className="text-sm flex items-center">
                                                {before ? 
                                                    (
                                                        <span className="pr-2">
                                                            { before(val.__raw) }
                                                        </span>
                                                    )
                                                    :
                                                    null
                                                }

                                                {highlightMatch(val.text, inputValue)}
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon 
                                                    icon={faCheck}
                                                    className={`text-sm text-blue-800 transition-all ease-in-out duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {!disabled && 
                            <div className={`flex gap-1 items-center justify-end border-t-[0.5px] border-t-gray-300 p-2`}>
                                <div className={`flex items-center gap-1 relative transition-all duration-200 ${selectedValues.length > 0 ? 'scale-100 opacity-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]' : 'scale-0 opacity-0 ease-out]'} `}>
                                    <button 
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            ignoreClickRef.current = true

                                            onReset?.()

                                            setInputValue("")
                                            setHighlightedIndex(0)
                                        }}
                                        className="bg-red-500 flex items-center justify-center p-1 aspect-square rounded-full overflow-hidden group"
                                    >
                                        <FontAwesomeIcon icon={faX} className="text-[8px] transition-all duration-200 ease-in-out text-black opacity-0 group-hover:opacity-100" />
                                    </button>
                                </div>

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
                )}
            </AnimatePresence>
        </div>
    )
}