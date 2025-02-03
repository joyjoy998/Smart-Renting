import { create } from "zustand";

interface LocationState {
  properties: any[];
  pois: any[];
  setProperties: (properties: any[]) => void;
  setPOIs: (pois: any[]) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  properties: [],
  pois: [],
  setProperties: (properties) => set({ properties }),
  setPOIs: (pois) => set({ pois }),
}));
