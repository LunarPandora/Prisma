"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import ContextMenuRoot from "./ContextMenuRoot"

function getVisibleItems(menu, contextData) {
    const result = []

    const visibleGroups = (menu || []).filter((g) =>
        typeof g.hidden === "function" ? !g.hidden(contextData) : !g.hidden
    )

    for (const group of visibleGroups) {
        const items = (group.items || []).filter((item) =>
            typeof item.hidden === "function"
                ? !item.hidden(contextData)
                : !item.hidden
        )
        for (const item of items) {
            result.push(item)
        }
    }

    return result
}

function getFirstEnabledIndex(items) {
    for (let i = 0; i < items.length; i++) {
        if (items[i]?.enabled !== false) return i
    }
    return -1
}

function computeInitialFocus(visibleItems) {
    return getFirstEnabledIndex(visibleItems)
}

export default function ContextMenuRenderer({ menu, contextData, onClose }) {
    const itemRefs = useRef([])
    const visibleItems = getVisibleItems(menu, contextData)
    const [focusedIndex, setFocusedIndex] = useState(() => computeInitialFocus(visibleItems))

    const registerRef = useCallback((index) => (el) => {
        itemRefs.current[index] = el
    }, [])

    const handleKeyDown = useCallback((e) => {
        const total = visibleItems.length
        if (!total) return

        switch (e.key) {
            case "ArrowDown": {
                e.preventDefault()
                setFocusedIndex((prev) => {
                    let next = prev + 1
                    while (next < total) {
                        if (visibleItems[next]?.enabled !== false) return next
                        next++
                    }
                    return prev
                })
                break
            }
            case "ArrowUp": {
                e.preventDefault()
                setFocusedIndex((prev) => {
                    let next = prev - 1
                    while (next >= 0) {
                        if (visibleItems[next]?.enabled !== false) return next
                        next--
                    }
                    return prev
                })
                break
            }
            case "Home": {
                e.preventDefault()
                for (let i = 0; i < total; i++) {
                    if (visibleItems[i]?.enabled !== false) {
                        setFocusedIndex(i)
                        break
                    }
                }
                break
            }
            case "End": {
                e.preventDefault()
                for (let i = total - 1; i >= 0; i--) {
                    if (visibleItems[i]?.enabled !== false) {
                        setFocusedIndex(i)
                        break
                    }
                }
                break
            }
            case "Enter":
            case " ": {
                e.preventDefault()
                if (focusedIndex >= 0 && focusedIndex < total) {
                    const item = visibleItems[focusedIndex]
                    if (item?.enabled !== false && item?.action) {
                        item.action(contextData)
                        onClose?.()
                    }
                }
                break
            }
            case "Escape": {
                e.preventDefault()
                e.stopPropagation()
                onClose?.()
                break
            }
            default:
                break
        }
    }, [visibleItems, focusedIndex, contextData, onClose])

    useEffect(() => {
        if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex].scrollIntoView({ block: "nearest" })
        }
    }, [focusedIndex])

    const groups = (menu || []).filter((g) =>
        typeof g.hidden === "function" ? !g.hidden(contextData) : !g.hidden
    )

    let itemIndex = -1

    const visibleGroups = groups
        .map(group => ({
            ...group,
            visibleItems: (group.items || []).filter(item =>
                typeof item.hidden === "function"
                    ? !item.hidden(contextData)
                    : !item.hidden
            ),
        }))
        .filter(g => g.visibleItems.length > 0)

    return (
        <div
            role="menu"
            aria-label="Context menu"
            onKeyDown={handleKeyDown}
            className="py-1"
        >
            {visibleGroups.map((group, gi) => {
                return (
                    <div key={gi}>
                        {group.visibleItems.map((item) => {
                            itemIndex++
                            const currentIndex = itemIndex
                            return (
                                <ContextMenuRoot
                                    key={currentIndex}
                                    icon={item.icon}
                                    iconColor={item.iconColor}
                                    textColor={item.textColor}
                                    enabled={item.enabled}
                                    danger={item.danger}
                                    contextData={contextData}
                                    focused={focusedIndex === currentIndex}
                                    onItemRef={registerRef(currentIndex)}
                                    onClicked={() => {
                                        item.action(contextData)
                                        onClose?.()
                                    }}
                                >
                                    {item.text}
                                </ContextMenuRoot>
                            )
                        })}
                        {gi !== visibleGroups.length - 1 && (
                            <div className="mx-2 my-1 border-t border-gray-200" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
