import { create } from "zustand";

interface TravelModeState {
  mode: "walking" | "driving" | "transit";
  setMode: (mode: "walking" | "driving" | "transit") => void;
}

export const useTravelModeStore = create<TravelModeState>((set) => ({
  mode: "driving", // default driving
  setMode: (mode) => set({ mode }),
}));
