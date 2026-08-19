import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
    count: 0,
    notifications: [],
    total: 0,
    isOpen: false,
    isLoading: false,

    setCount: (count) => set({ count }),
    setNotifications: (notifications) => set({ notifications }),
    setTotal: (total) => set({ total }),
    setIsOpen: (isOpen) => set({ isOpen }),
    setIsLoading: (isLoading) => set({ isLoading }),

    incrementCount: () => set((s) => ({ count: s.count + 1 })),
    decrementCount: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
    resetCount: () => set({ count: 0 }),

    addNotification: (notification) => set((s) => ({
        notifications: [notification, ...s.notifications],
        count: s.count + 1,
    })),

    markItemAsRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) =>
            n.notification_id === id ? { ...n, is_read: true } : n
        ),
        count: Math.max(0, s.count - 1),
    })),

    markAllItemsAsRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
        count: 0,
    })),

    removeNotification: (id) => set((s) => ({
        notifications: s.notifications.filter((n) => n.notification_id !== id),
    })),
}))
