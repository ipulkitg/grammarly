import { create } from "zustand"
import type { Suggestion } from "@/types/data-models"

interface SuggestionState {
  suggestions: Suggestion[]
  setSuggestions: (suggestions: Suggestion[]) => void
  addSuggestion: (suggestion: Suggestion) => void
  removeSuggestion: (suggestionId: string) => void
  updateSuggestion: (suggestionId: string, updates: Partial<Suggestion>) => void
}

export const useSuggestionStore = create<SuggestionState>((set) => ({
  suggestions: [],
  setSuggestions: (suggestions) => set({ suggestions }),
  addSuggestion: (suggestion) =>
    set((state) => ({
      suggestions: [...state.suggestions, suggestion],
    })),
  removeSuggestion: (suggestionId) =>
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s.suggestion_id !== suggestionId),
    })),
  updateSuggestion: (suggestionId, updates) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) => (s.suggestion_id === suggestionId ? { ...s, ...updates } : s)),
    })),
}))
