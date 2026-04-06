import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,

      // ✅ flags
      justLoggedOut: false,
      sessionExpired: false,
      loginFailed: false,

      setUser: (data) =>
        set({
          user: data,
          justLoggedOut: false,
          sessionExpired: false,
        }),

      logout: () =>
        set({
          user: null,
          justLoggedOut: true,
          sessionExpired: false,
        }),

      expiredSession: () =>
        set({
          user: null,
          justLoggedOut: false,
          sessionExpired: true,
        }),
        
      setLoginFailed: () =>
        set({
          loginFailed: true,
          justLoggedOut: false,
          sessionExpired: false,
        }),

      clearLogoutFlag: () =>
        set({
          justLoggedOut: false,
        }),

      clearSessionExpired: () =>
        set({
          sessionExpired: false,
        }),

      clearLoginFailed: () =>
        set({
          loginFailed: false,
        }),

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "user-storage",

      // 🔥 VERY IMPORTANT: don’t persist flags
      partialize: (state) => ({
        user: state.user,
      }),

      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
    }
  )
);