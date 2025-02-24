import { create } from "zustand";
import poisData from "@/components/ratingSystem/mockData/poi-u1.json" assert { type: "json" };
import propertiesData from "@/components/ratingSystem/mockData/property.json" assert { type: "json" };

interface Property {
  property_property_id: string;
  latitude: number;
  longitude: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  weeklyRent: number;
  safetyScore: number;
}

interface POI {
  poi_id: string;
  address: string;
}

type TravelMode = "WALKING" | "DRIVING" | "TRANSIT";

interface WeightConfig {
  distance: number;
  price: number;
  neighborhood_safety: number;
  amenity: number;
}

interface RatingState {
  properties: Property[];
  pois: POI[];
  selectedPOI: POI | null;
  travelMode: TravelMode;
  distanceScores: Record<string, number>;
  travelTimes: Record<string, number>;
  distances: Record<string, number>;
  priceScores: Record<string, number>;
  safetyScores: Record<string, number>;
  amenitiesScores: Record<string, number>;
  amenitiesData: Record<string, any>;
  totalScores: Record<string, number>;
  weightConfig: WeightConfig;

  setSelectedPOI: (poi: POI) => void;
  setTravelMode: (mode: TravelMode) => void;
  setDistanceScores: (scores: Record<string, number>) => void;
  setTravelTimes: (times: Record<string, number>) => void;
  setDistances: (distances: Record<string, number>) => void;
  setPriceScores: (scores: Record<string, number>) => void;
  setSafetyScores: (scores: Record<string, number>) => void;
  setAmenitiesScores: (scores: Record<string, number>) => void;
  setAmenitiesData: (data: Record<string, any>) => void;

  setTotalScores: (scores: Record<string, number>) => void;
  setWeightConfig: (config: WeightConfig) => void;
  updateWeight: (key: keyof WeightConfig, value: number) => void;
}

const defaultWeightConfig: WeightConfig = {
  distance: 0.5,
  price: 0.5,
  neighborhood_safety: 0.5,
  amenity: 0.5,
};

export const useRatingStore = create<RatingState>((set) => ({
  properties: propertiesData,
  pois: poisData,
  selectedPOI: null,
  travelMode: "WALKING",
  distanceScores: {},
  travelTimes: {},
  distances: {},
  priceScores: {},
  safetyScores: {},
  amenitiesScores: {},
  amenitiesData: {},
  totalScores: {},
  weightConfig: defaultWeightConfig,

  setSelectedPOI: (poi) => set({ selectedPOI: poi }),
  setTravelMode: (mode) => set({ travelMode: mode }),
  setDistanceScores: (scores) => set({ distanceScores: scores }),
  setTravelTimes: (times) => set({ travelTimes: times }),
  setDistances: (distances) => set({ distances: distances }),
  setPriceScores: (scores) => set({ priceScores: scores }),
  setSafetyScores: (scores) => set({ safetyScores: scores }),
  setAmenitiesScores: (scores) => set({ amenitiesScores: scores }),
  setAmenitiesData: (data) => set({ amenitiesData: data }),

  setTotalScores: (scores) => set({ totalScores: scores }),
  setWeightConfig: (config) => set({ weightConfig: config }),
  updateWeight: (key, value) =>
    set((state) => ({
      weightConfig: {
        ...state.weightConfig,
        [key]: value,
      },
    })),
}));
