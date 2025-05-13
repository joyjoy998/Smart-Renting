import { useRatingStore } from "../../../stores/ratingStore";

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
    const score = property.safetyScore;
    safetyScores[property.property_property_id] = score ? score : 0.4;
  });

  setSafetyScores(safetyScores);
}
