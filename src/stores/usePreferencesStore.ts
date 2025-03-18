import { create } from "zustand";

interface Preferences {
  distance: number;
  price: number;
  neighborhoodSafety: number;
  amenity: number;
}

interface PreferencesState {
  preferences: Preferences;
  setPreference: (key: keyof Preferences, value: number) => void;
}

interface Budget {
  budget: number;
  setBudget: (budget: number) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: {
    distance: 1,
    price: 1,
    neighborhoodSafety: 0.5,
    amenity: 0.5,
  },
  setPreference: (key, value: number) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value },
    })),
}));

export const useBudgetStore = create<Budget>((set) => ({
  budget: 500,
  setBudget: (budget) => set({ budget }),
}));
