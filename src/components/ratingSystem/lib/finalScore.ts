import { useRatingStore } from "../store/ratingStore";
import userPreference from "@/components/ratingSystem/mockData/preference-u1.json";

interface Weight {
  distance: number;
  price: number;
  neighborhood_safety: number;
  amenity: number;
}

const defaultWeight: Weight = {
  distance: 1,
  price: 1,
  neighborhood_safety: 0.2,
  amenity: 0.3,
};

function normalizeWeights(weights: Weight): Weight {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  return {
    distance: weights.distance / total,
    price: weights.price / total,
    neighborhood_safety: weights.neighborhood_safety / total,
    amenity: weights.amenity / total,
  };
}

export function calculateTotalScore() {
  const {
    properties,
    distanceScores,
    priceScores,
    safetyScores,
    amenitiesScores,
    setTotalScores,
  } = useRatingStore.getState();

  const typedUserPreference = userPreference as Weight;

  // 检查用户偏好是否有效
  const selectedWeights =
    typedUserPreference &&
    Object.keys(typedUserPreference).length === 4 &&
    Object.values(typedUserPreference).every(
      (weight) => typeof weight === "number"
    )
      ? typedUserPreference
      : defaultWeight;

  console.log(
    "Using weights from:",
    selectedWeights === defaultWeight ? "default" : "user preference"
  );

  const weights = normalizeWeights(selectedWeights);
  const totalScores: Record<string, number> = {};
  let maxScore = -Infinity;
  let minScore = Infinity;

  for (const property of properties) {
    const propertyId = property.property_property_id;

    const distanceScore = distanceScores[propertyId] || 0;
    const priceScore = priceScores[propertyId] || 0;
    const safetyScore = safetyScores[propertyId] || 0;
    const amenityScore = amenitiesScores[propertyId] || 0;

    const totalScore =
      distanceScore * weights.distance +
      priceScore * weights.price +
      safetyScore * weights.neighborhood_safety +
      amenityScore * weights.amenity;

    totalScores[propertyId] = totalScore;
    maxScore = Math.max(maxScore, totalScore);
    minScore = Math.min(minScore, totalScore);
  }

  if (properties.length > 1) {
    for (const propertyId in totalScores) {
      if (maxScore === minScore) {
        totalScores[propertyId] = 1;
      } else {
        totalScores[propertyId] =
          (totalScores[propertyId] - minScore) / (maxScore - minScore);
      }
    }
  }

  setTotalScores(totalScores);

  console.log("Weight configuration used:", selectedWeights);
  console.log("Normalized weights:", weights);
  console.log("Total scores:", totalScores);

  return totalScores;
}
