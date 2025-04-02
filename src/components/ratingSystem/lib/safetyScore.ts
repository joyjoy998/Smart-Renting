import { useRatingStore } from "@/stores/ratingStore";

interface Property {
  property_property_id: string;
  address: string;
  safetyScore: number;
}

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
