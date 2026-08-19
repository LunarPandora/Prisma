import ContextMenuWrapper from "./ContextMenuWrapper"

export default function ContextMenu({
    contextMenu,
    closeMenu,
    menus
}) {
    return (
        <ContextMenuWrapper
            contextMenu={contextMenu}
            setContextMenu={closeMenu}
            menus={menus}
        />
    )
}