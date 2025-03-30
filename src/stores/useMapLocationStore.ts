import { create } from "zustand";

interface MapLocationState {
  mapLocation: google.maps.LatLngLiteral | null;
  setMapLocation: (location: google.maps.LatLngLiteral) => void;
}

export const useMapLocationStore = create<MapLocationState>((set) => ({
  mapLocation: null,
  setMapLocation: (location) => set({ mapLocation: location }),
}));
