import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  userId: string | null;
  eventId: string | null;
  eventSlug: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  userCompany: string | null;
  userFoodPreference: string | null;
  userTshirtSize: string | null;
  userGrowthFocus: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  login: (token: string, userId: string, eventId: string, eventSlug: string, profile?: {
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    userCompany?: string | null;
    userFoodPreference?: string | null;
    userTshirtSize?: string | null;
    userGrowthFocus?: string | null;
  }) => void;
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
      userName: null,
      userEmail: null,
      userPhone: null,
      userCompany: null,
      userFoodPreference: null,
      userTshirtSize: null,
      userGrowthFocus: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (token, userId, eventId, eventSlug, profile) =>
        set({
          token, userId, eventId, eventSlug,
          userName: profile?.userName || null,
          userEmail: profile?.userEmail || null,
          userPhone: profile?.userPhone || null,
          userCompany: profile?.userCompany || null,
          userFoodPreference: profile?.userFoodPreference || null,
          userTshirtSize: profile?.userTshirtSize || null,
          userGrowthFocus: profile?.userGrowthFocus || null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null, userId: null, eventId: null, eventSlug: null,
          userName: null, userEmail: null, userPhone: null,
          userCompany: null, userFoodPreference: null, userTshirtSize: null, userGrowthFocus: null,
          isAuthenticated: false,
        }),

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
