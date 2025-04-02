import { create } from "zustand";

interface POI {
  poi_id: string;
  name: string;
  latitude: number;
  longitude: number;
  place_id?: string;
}

interface RouteInfo {
  poiId: string;
  polylinePath: google.maps.LatLngLiteral[];
  durationText: string;
  distanceText: string;
}

interface Property {
  latitude: number;
  longitude: number;
  group_id?: string | number;
  [key: string]: any;
}

type TravelMode = "DRIVING" | "WALKING" | "TRANSIT";

interface RouteStoreState {
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;

  selectedPropertyForRoute: Property | null;
  setSelectedPropertyForRoute: (p: Property | null) => void;

  pois: POI[];
  setPois: (pois: POI[]) => void;

  routesToPOIs: RouteInfo[];
  setRoutesToPOIs: (routes: RouteInfo[]) => void;

  visiblePOIs: string[];
  setVisiblePOIs: (ids: string[]) => void;
  togglePOIVisibility: (id: string) => void;
}

export const useRouteStore = create<RouteStoreState>((set) => ({
  travelMode: "DRIVING",
  setTravelMode: (mode) => set({ travelMode: mode }),

  selectedPropertyForRoute: null,
  setSelectedPropertyForRoute: (p) => set({ selectedPropertyForRoute: p }),

  pois: [],
  setPois: (pois) => set({ pois }),

  routesToPOIs: [],
  setRoutesToPOIs: (routes) => set({ routesToPOIs: routes }),

  visiblePOIs: [],
  setVisiblePOIs: (ids) => set({ visiblePOIs: ids }),
  togglePOIVisibility: (id) =>
    set((state) => ({
      visiblePOIs: state.visiblePOIs.includes(id)
        ? state.visiblePOIs.filter((i) => i !== id)
        : [...state.visiblePOIs, id],
    })),
}));
