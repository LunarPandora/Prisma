import { AnimatePresence } from "framer-motion"
import ContextWindow from "./ContextWindow"
import ContextMenuRenderer from "./ContextMenuRenderer"

const hasVisibleItems = (menu, contextData) => {
    if (!menu || menu.length === 0) return false
    return menu.some(group => {
        const groupHidden = typeof group.hidden === "function"
            ? group.hidden(contextData)
            : !!group.hidden
        if (groupHidden) return false
        const visibleItems = group.items?.filter(item => {
            if (typeof item.hidden === "function") return !item.hidden(contextData)
            return !item.hidden
        })
        return visibleItems?.length > 0
    })
}

export default function ContextMenuWrapper({
    contextMenu,
    setContextMenu,
    menus
}) {
    if (!contextMenu) return null

    const menu = menus[contextMenu.type] || []

    if (!hasVisibleItems(menu, contextMenu.data)) return null

    return (
        <AnimatePresence>
            {contextMenu && (
                <ContextWindow
                    position={{ clientX: contextMenu.x, clientY: contextMenu.y }}
                    onClose={() => setContextMenu(null)}
                >
                    <ContextMenuRenderer
                        key={`${contextMenu.type}-${JSON.stringify(contextMenu.data)}`}
                        menu={menu}
                        contextData={contextMenu.data}
                        onClose={() => setContextMenu(null)}
                    />
                </ContextWindow>
            )}
        </AnimatePresence>
    )
}