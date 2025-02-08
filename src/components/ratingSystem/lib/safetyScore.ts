import { useRatingStore } from "../store/ratingStore";

interface Property {
  property_property_id: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  weeklyRent: number;
  safetyScore: number;
}

/**
 * 直接从 `property` 数据中提取 `safetyScore` 并存入状态管理
 */
export function loadSafetyScores() {
  const { properties, setSafetyScores } = useRatingStore.getState();

  if (!properties || properties.length === 0) {
    console.warn("No properties available for safety scoring.");
    return;
  }

  const safetyScores: Record<string, number> = {};

  properties.forEach((property) => {
    safetyScores[property.property_property_id] = property.safetyScore ?? 0;
  });

  setSafetyScores(safetyScores);
}
