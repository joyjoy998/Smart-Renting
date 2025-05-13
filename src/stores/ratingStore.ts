import { create } from "zustand";
import { fetchGroupRatingData } from "../services/ratingService";
import { usePreferencesStore } from "../stores/usePreferencesStore";

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
  name: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  user_id?: string;
}

type TravelMode = "WALKING" | "DRIVING" | "TRANSIT";

interface WeightConfig {
  distance: number;
  price: number;
  neighborhood_safety: number;
  amenity: number;
}

interface PropertyPOIMap {
  [key: string]: number;
}

interface RatingState {
  isOpen: boolean;
  properties: Property[];
  pois: POI[];
  selectedPOI: POI | null;
  travelMode: TravelMode;
  distanceScores: Record<string, number>;
  travelTimes: PropertyPOIMap;
  distances: PropertyPOIMap;
  priceScores: Record<string, number>;
  safetyScores: Record<string, number>;
  amenitiesScores: Record<string, number>;
  amenitiesData: Record<string, any>;
  totalScores: Record<string, number>;
  weightConfig: WeightConfig;
  isLoading: boolean;
  error: string | null;
  currentGroup: any | null;

  selectedPropertyForRoute: Property | null;
  routesToPOIs: {
    poiId: string;
    polylinePath: google.maps.LatLngLiteral[];
    durationText: string;
    distanceText: string;
  }[];
  setSelectedPropertyForRoute: (property: Property | null) => void;
  setRoutesToPOIs: (routes: RatingState["routesToPOIs"]) => void;
  clearRoutesToPOIs: () => void;

  setOpen: (open: boolean) => void;
  setSelectedPOI: (poi: POI) => void;
  setTravelMode: (mode: TravelMode) => void;
  setDistanceScores: (scores: Record<string, number>) => void;
  setTravelTimes: (times: PropertyPOIMap) => void;
  setDistances: (distances: PropertyPOIMap) => void;
  setPriceScores: (scores: Record<string, number>) => void;
  setSafetyScores: (scores: Record<string, number>) => void;
  setAmenitiesScores: (scores: Record<string, number>) => void;
  setAmenitiesData: (data: Record<string, any>) => void;

  setTotalScores: (scores: Record<string, number>) => void;
  setWeightConfig: (config: WeightConfig) => void;
  updateWeight: (key: keyof WeightConfig, value: number) => void;
  loadData: (groupData?: any) => Promise<void>;
  syncWithPreferences: () => void;

  getTravelTimeForPropertyAndPOI: (
    propertyId: string,
    poiId: string
  ) => number | null;
  getDistanceForPropertyAndPOI: (
    propertyId: string,
    poiId: string
  ) => number | null;
}

const fallbackWeightConfig: WeightConfig = {
  distance: 0.5,
  price: 0.5,
  neighborhood_safety: 0.5,
  amenity: 0.5,
};

const getDefaultWeightConfig = (): WeightConfig => {
  try {
    const prefs = usePreferencesStore.getState().preferences;
    if (prefs && typeof prefs.distance === "number") {
      return {
        distance: prefs.distance,
        price: prefs.price,
        neighborhood_safety: prefs.neighborhoodSafety,
        amenity: prefs.amenity,
      };
    } else {
      console.warn(
        "Preferences not properly initialized, using fallback values"
      );
      return fallbackWeightConfig;
    }
  } catch (error) {
    console.warn("Failed to get preferences, using fallback values", error);
    return fallbackWeightConfig;
  }
};

const mapPropertyFromDB = (dbProperty: any): Property => {
  return {
    property_property_id: dbProperty.saved_property_id.toString(),
    latitude: dbProperty.latitude || 0,
    longitude: dbProperty.longitude || 0,
    address: `${dbProperty.street}, ${dbProperty.suburb}, ${dbProperty.state} ${dbProperty.postcode}`,
    bedrooms: dbProperty.bedrooms || 0,
    bathrooms: dbProperty.bathrooms || 0,
    parkingSpaces: dbProperty.parking_spaces || 0,
    weeklyRent: dbProperty.weekly_rent || 0,
    safetyScore: dbProperty.safety_score || 0,
  };
};

const mapPOIFromDB = (dbPOI: any): POI => {
  return {
    poi_id: dbPOI.saved_poi_id.toString(),
    address: `${dbPOI.street}, ${dbPOI.suburb}, ${dbPOI.state} ${dbPOI.postcode}`,
    name: dbPOI.name,
    latitude: dbPOI.latitude,
    longitude: dbPOI.longitude,
    type: dbPOI.category,
    user_id: dbPOI.user_id,
  };
};

const mapPreferencesToWeightConfig = (
  preferences: any[] | null
): WeightConfig => {
  if (!preferences || preferences.length === 0) {
    return getDefaultWeightConfig();
  }

  const weightConfig: Partial<WeightConfig> = {};
  const defaultConfig = getDefaultWeightConfig();

  preferences.forEach((pref) => {
    if (pref.preference_type === "distance") {
      weightConfig.distance = pref.weight;
    } else if (pref.preference_type === "price") {
      weightConfig.price = pref.weight;
    } else if (pref.preference_type === "neighborhood_safety") {
      weightConfig.neighborhood_safety = pref.weight;
    } else if (pref.preference_type === "amenity") {
      weightConfig.amenity = pref.weight;
    }
  });

  return {
    distance: weightConfig.distance || defaultConfig.distance,
    price: weightConfig.price || defaultConfig.price,
    neighborhood_safety:
      weightConfig.neighborhood_safety || defaultConfig.neighborhood_safety,
    amenity: weightConfig.amenity || defaultConfig.amenity,
  };
};

const initialWeightConfig = fallbackWeightConfig;

export const useRatingStore = create<RatingState>((set, get) => ({
  isOpen: false,
  properties: [],
  pois: [],
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
  weightConfig: initialWeightConfig,
  isLoading: false,
  error: null,
  currentGroup: null,

  selectedPropertyForRoute: null,
  routesToPOIs: [],
  setSelectedPropertyForRoute: (property) =>
    set({ selectedPropertyForRoute: property }),
  setRoutesToPOIs: (routes) => set({ routesToPOIs: routes }),
  clearRoutesToPOIs: () =>
    set({ selectedPropertyForRoute: null, routesToPOIs: [] }),

  setOpen: (open) => {
    set({ isOpen: open });
    if (open && get().properties.length === 0 && !get().isLoading) {
      get().loadData();
    }
  },

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

  syncWithPreferences: () => {
    try {
      const prefs = usePreferencesStore.getState().preferences;
      if (prefs && typeof prefs.distance === "number") {
        const currentConfig = get().weightConfig;
        if (
          currentConfig.distance !== prefs.distance ||
          currentConfig.price !== prefs.price ||
          currentConfig.neighborhood_safety !== prefs.neighborhoodSafety ||
          currentConfig.amenity !== prefs.amenity
        ) {
          set({
            weightConfig: {
              distance: prefs.distance,
              price: prefs.price,
              neighborhood_safety: prefs.neighborhoodSafety,
              amenity: prefs.amenity,
            },
          });
        }
      }
    } catch (error) {
      console.warn("Failed to sync with preferences", error);
    }
  },

  loadData: async (groupData?: any) => {
    set({ isLoading: true, error: null });
    try {
      get().syncWithPreferences();

      let data;
      data = await fetchGroupRatingData(groupData);
      const { group, properties, pois, preferences } = data;

      if (!group) {
        set({
          isLoading: false,
          error: "No group data found",
          properties: [],
          pois: [],
          currentGroup: null,
          weightConfig: getDefaultWeightConfig(),
        });
        return;
      }

      const mappedProperties = properties.map(mapPropertyFromDB);
      const mappedPOIs = pois.map(mapPOIFromDB);
      const weightConfig = mapPreferencesToWeightConfig(preferences);

      set({
        isLoading: false,
        properties: mappedProperties,
        pois: mappedPOIs,
        currentGroup: group,
        weightConfig: weightConfig,
        selectedPOI: null,
        distanceScores: {},
        travelTimes: {},
        distances: {},
        priceScores: {},
        safetyScores: {},
        amenitiesScores: {},
        amenitiesData: {},
        totalScores: {},
      });
    } catch (error) {
      console.error("Error loading data:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load data",
      });
    }
  },

  getTravelTimeForPropertyAndPOI: (propertyId: string, poiId: string) => {
    const key = `${propertyId}_${poiId}`;
    return get().travelTimes[key] || null;
  },

  getDistanceForPropertyAndPOI: (propertyId: string, poiId: string) => {
    const key = `${propertyId}_${poiId}`;
    return get().distances[key] || null;
  },
}));
