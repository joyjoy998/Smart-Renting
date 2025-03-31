import { LargeNumberLike } from "crypto";
import { create } from "zustand";
import { Property } from "@/types/property";
import { useGroupStore } from "./useGroupStore";
interface RecommendationState {
  isRecommendationOpen: boolean;
  recommendedProperties: Property[];
  currentGroupId: number | null;
  toggleRecommendation: () => void;
  setOpen: (open: boolean) => void;
  fetchRecommendations: (
    userId: string,
    currentGroupId: number | null,
    minPrice?: number,
    maxPrice?: number,
    page?: number,
    mapLat?: number | null,
    mapLng?: number | null
  ) => Promise<void>;
}

export const useRecommendationStore = create<RecommendationState>()(
  (set, get) => ({
    isRecommendationOpen: false,
    recommendedProperties: [],
    currentGroupId: null,
    toggleRecommendation: () =>
      set((state) => ({ isRecommendationOpen: !state.isRecommendationOpen })),
    setOpen: (open) => set({ isRecommendationOpen: open }),
    fetchRecommendations: async (
      userId: string,
      currentGroupId: number | null,
      minPrice?: number,
      maxPrice?: number,
      mapLat?,
      mapLng?
    ) => {
      try {
        let url = `/api/recommendProperties?user_id=${userId}&group_id=${currentGroupId}`;

        if (minPrice) url += `&min_budget=${minPrice}`;
        if (maxPrice) url += `&max_budget=${maxPrice}`;
        if (
          mapLat !== undefined &&
          mapLat !== null &&
          mapLng !== undefined &&
          mapLng !== null
        ) {
          url += `&mapLat=${encodeURIComponent(
            mapLat
          )}&mapLng=${encodeURIComponent(mapLng)}`;
        }
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          set({
            recommendedProperties: data.recommended_properties,
            currentGroupId: currentGroupId,
          });
        } else {
          console.error("Failed to get recommendation:", data.error);
        }
      } catch (error) {
        console.error("API fetch error:", error);
      }
    },
  })
);
