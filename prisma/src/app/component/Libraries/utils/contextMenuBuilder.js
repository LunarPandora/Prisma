export const item = (text, action, options = {}) => ({
    text,
    action,
    icon: options.icon || null,
    iconColor: options.iconColor || "text-gray-700",
    textColor: options.textColor || "text-gray-700",
    enabled: options.enabled ?? true,
    danger: options.danger ?? false,
    hidden: options.hidden ?? false,
})

export const group = (items, options = {}) => ({
    type: "group",
    items,
    hidden: options.hidden ?? false
})