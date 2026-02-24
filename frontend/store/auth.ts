import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  userId: string | null;
  eventId: string | null;
  eventSlug: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  login: (token: string, userId: string, eventId: string, eventSlug: string) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      eventId: null,
      eventSlug: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (token, userId, eventId, eventSlug) =>
        set({ token, userId, eventId, eventSlug, isAuthenticated: true }),

      logout: () =>
        set({ token: null, userId: null, eventId: null, eventSlug: null, isAuthenticated: false }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "event-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
