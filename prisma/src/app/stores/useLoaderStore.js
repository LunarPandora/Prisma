import { create } from "zustand"

export const useLoaderStore = create((set) => ({
    isLoading: false,
    progress: 0,

    start: () => set({ isLoading: true, progress: 0 }),
    setProgress: (p) => set({ progress: p }),
    finish: () => set({ progress: 100 }),

    stop: () => set({ isLoading: false, progress: 0 }),
}))