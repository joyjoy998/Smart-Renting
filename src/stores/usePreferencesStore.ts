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

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: {
    distance: 0.5,
    price: 0.5,
    neighborhoodSafety: 0.5,
    amenity: 0.5,
  },
  setPreference: (key, value: number) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value },
    })),
}));
