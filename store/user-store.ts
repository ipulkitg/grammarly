import { create } from "zustand"
import type { User } from "@/types/data-models"

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  updatePreferences: (preferences: Partial<User["preferences"]>) => void
  updateImprovementStats: (stats: Partial<User["improvement_stats"]>) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updatePreferences: (preferences) =>
    set((state) => ({
      user: state.user ? { ...state.user, preferences: { ...state.user.preferences, ...preferences } } : null,
    })),
  updateImprovementStats: (stats) =>
    set((state) => ({
      user: state.user ? { ...state.user, improvement_stats: { ...state.user.improvement_stats, ...stats } } : null,
    })),
}))
