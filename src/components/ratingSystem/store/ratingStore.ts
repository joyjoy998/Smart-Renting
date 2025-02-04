import { create } from "zustand";
import poisData from "@/components/ratingSystem/mockData/poi-u1.json";
import propertiesData from "@/components/ratingSystem/mockData/property.json";

interface Property {
  property_property_id: string;
  address: string;
  bedrooms: number; // 卧室数量
  bathrooms: number; // 浴室数量
  parkingSpaces: number; // 车位数量
  weeklyRent: number; // 每周租金，单位：澳元
}

interface POI {
  poi_id: string;
  address: string;
}

type TravelMode = "walking" | "driving" | "transit";

interface RatingState {
  properties: Property[];
  pois: POI[];
  selectedPOI: POI | null;
  travelMode: TravelMode;
  distanceScores: Record<string, number>;
  travelTimes: Record<string, number>;
  distances: Record<string, number>;
  setSelectedPOI: (poi: POI) => void;
  setTravelMode: (mode: TravelMode) => void;
  setDistanceScores: (scores: Record<string, number>) => void;
  setTravelTimes: (times: Record<string, number>) => void;
  setDistances: (distances: Record<string, number>) => void;
}

export const useRatingStore = create<RatingState>((set) => ({
  properties: propertiesData,
  pois: poisData,
  selectedPOI: null,
  travelMode: "walking",
  distanceScores: {},
  travelTimes: {},
  distances: {},
  setSelectedPOI: (poi) => set({ selectedPOI: poi }),
  setTravelMode: (mode) => set({ travelMode: mode }),
  setDistanceScores: (scores) => set({ distanceScores: scores }),
  setTravelTimes: (times) => set({ travelTimes: times }),
  setDistances: (distances) => set({ distances: distances }),
}));
