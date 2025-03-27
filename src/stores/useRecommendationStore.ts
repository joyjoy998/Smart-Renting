import { LargeNumberLike } from "crypto";
import { create } from "zustand";
import { Property } from "@/types/property";
interface RecommendationState {
  isRecommendationOpen: boolean;
  recommendedProperties: Property[];
  toggleRecommendation: () => void;
  setOpen: (open: boolean) => void;
  fetchRecommendations: (
    userId: string,
    groupId: number | null,
    minPrice?: number,
    maxPrice?: number,
    page?: number
  ) => Promise<void>;
}

export const useRecommendationStore = create<RecommendationState>()(
  (set, get) => ({
    isRecommendationOpen: false,
    recommendedProperties: [],
    toggleRecommendation: () =>
      set((state) => ({ isRecommendationOpen: !state.isRecommendationOpen })),
    setOpen: (open) => set({ isRecommendationOpen: open }),
    fetchRecommendations: async (
      userId: string,
      groupId: number | null,
      minPrice?: number,
      maxPrice?: number
    ) => {
      try {
        let url = `/api/recommendProperties?user_id=${userId}&group_id=${groupId}`;

        if (minPrice) url += `&min_budget=${minPrice}`;
        if (maxPrice) url += `&max_budget=${maxPrice}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          set({ recommendedProperties: data.recommended_properties });
        } else {
          console.error("Failed to get recommendation:", data.error);
        }
      } catch (error) {
        console.error("API fetch error:", error);
      }
    },
  })
);
