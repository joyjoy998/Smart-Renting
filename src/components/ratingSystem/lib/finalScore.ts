import { useRatingStore } from "../../../stores/ratingStore";

interface Weight {
  distance: number;
  price: number;
  neighborhood_safety: number;
  amenity: number;
}

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
  console.log("Using weights from ratingStore:", userWeights);

  const weights = normalizeWeights(userWeights);
  const totalScores: Record<string, number> = {};

  for (const property of properties) {
    const propertyId = property.property_property_id;
    const distanceScore = distanceScores[propertyId] || 0.4;
    const priceScore = priceScores[propertyId] || 0.4;
    const safetyScore = safetyScores[propertyId] || 0.4;
    const amenityScore = amenitiesScores[propertyId] || 0.4;

    const totalScore =
      distanceScore * weights.distance +
      priceScore * weights.price +
      safetyScore * weights.neighborhood_safety +
      amenityScore * weights.amenity;

    totalScores[propertyId] = totalScore;
  }

  setTotalScores(totalScores);

  console.log("Weight configuration used:", userWeights);
  console.log("Normalized weights:", weights);
  console.log("Total scores:", totalScores);

  return totalScores;
}
