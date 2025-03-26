import { useRatingStore } from "@/stores/ratingStore";

interface Weight {
  distance: number;
  price: number;
  neighborhood_safety: number;
  amenity: number;
}

const defaultWeight: Weight = {
  distance: 0.5,
  price: 0.5,
  neighborhood_safety: 0.5,
  amenity: 0.5,
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

function mapPreferenceToWeight(weightConfig: {
  distance: number;
  price: number;
  neighborhood_safety: number;
  amenity: number;
}): Weight {
  return {
    distance: weightConfig.distance,
    price: weightConfig.price,
    neighborhood_safety: weightConfig.neighborhood_safety,
    amenity: weightConfig.amenity,
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
    weightConfig,
  } = useRatingStore.getState();

  const userWeights = mapPreferenceToWeight(weightConfig);

  const selectedWeights =
    userWeights &&
    Object.keys(userWeights).length === 4 &&
    Object.values(userWeights).every(
      (weight) => typeof weight === "number" && weight >= 0
    )
      ? userWeights
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
