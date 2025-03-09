import { useRatingStore } from "../store/ratingStore";

interface Property {
  property_property_id: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  weeklyRent: number;
}

/**
 * calculate price score and store in ratingStore
 */
export function calculatePriceScore() {
  const { properties, setPriceScores } = useRatingStore.getState();

  if (!properties || properties.length === 0) {
    console.warn("No properties available for price scoring.");
    return;
  }

  const priceScores: Record<string, number> = {};

  const adjustedPrices = properties.map(
    (p) =>
      p.weeklyRent /
      (p.bedrooms + 0.5 + 0.3 * p.bathrooms + 0.2 * p.parkingSpaces)
  );

  const minAdjustedPrice = Math.min(...adjustedPrices);
  const maxAdjustedPrice = Math.max(...adjustedPrices);

  properties.forEach((property, index) => {
    let adjustedPrice = adjustedPrices[index];

    let baseScore =
      1 -
      (adjustedPrice - minAdjustedPrice) /
        (maxAdjustedPrice - minAdjustedPrice);

    if (maxAdjustedPrice === minAdjustedPrice) baseScore = 1;

    priceScores[property.property_property_id] = baseScore;
  });

  setPriceScores(priceScores);
}
