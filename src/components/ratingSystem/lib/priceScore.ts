import { useRatingStore } from "@/stores/ratingStore";

interface Property {
  property_property_id: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  weeklyRent: number;
}

function smoothMapping(value: number, min: number, max: number): number {
  if (max === min) return 0.8;
  const normalized = (value - min) / (max - min);
  return 0.4 + 0.6 * Math.pow(1 - normalized, 0.5);
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
  const adjustedPrices = properties.map((p) => {
    const roomFactor =
      p.bedrooms + 0.5 + 0.3 * p.bathrooms + 0.2 * p.parkingSpaces;
    return roomFactor > 0 ? p.weeklyRent / roomFactor : p.weeklyRent;
  });

  const minAdjustedPrice = Math.min(...adjustedPrices);
  const maxAdjustedPrice = Math.max(...adjustedPrices);

  properties.forEach((property, index) => {
    let adjustedPrice = adjustedPrices[index];
    let score = smoothMapping(
      adjustedPrice,
      minAdjustedPrice,
      maxAdjustedPrice
    );

    priceScores[property.property_property_id] = score;
  });

  console.log("Price scores calculated:", priceScores);
  setPriceScores(priceScores);
}
