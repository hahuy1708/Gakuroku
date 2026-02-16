// store/useAuthStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Hardcode user temporarily for demo purposes
const DEMO_USER = { username: "admin", password: "123" };

interface AuthState {
  user: string | null;
  isLoggedIn: boolean;
  hasHydrated: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      hasHydrated: false,
      login: (username, password) => {
        if (username === DEMO_USER.username && password === DEMO_USER.password) {
          set({ user: username, isLoggedIn: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isLoggedIn: false }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "gakuroku-auth",

      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
