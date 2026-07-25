import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

/**
 * Client-side mirror of the session, used for instant UI decisions
 * (e.g. which sidebar links to render) without waiting on a request.
 * The httpOnly cookie set by the server remains the source of truth
 * for actual route protection — this store is for UX only.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isHydrated: false,
      setSession: (user, accessToken) => set({ user, accessToken }),
      clearSession: () => set({ user: null, accessToken: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-store",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
