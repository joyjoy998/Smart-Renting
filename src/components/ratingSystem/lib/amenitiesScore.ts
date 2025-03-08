import { useRatingStore } from "../store/ratingStore";

interface Property {
  property_property_id: string;
  latitude: number;
  longitude: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  weeklyRent: number;
}

interface AmenityResult {
  count: number;
  places: Array<{
    name: string;
    vicinity: string;
  }>;
}

interface AmenityData {
  [key: string]: AmenityResult;
}

// define amenity weights
const AMENITY_WEIGHTS: Record<string, number> = {
  hospital: 0.3,
  convenienceStore: 0.3,
  restaurant: 0.2,
  gym: 0.1,
  park: 0.1,
};

const AMENITY_THRESHOLDS: Record<string, number> = {
  hospital: 20,
  convenienceStore: 40,
  restaurant: 35,
  gym: 20,
  park: 10,
};

/**
 * calculate the score of a single amenity type
 * @param count the number of amenities
 * @param threshold ideal maximun number
 * @returns  a score between 0-1
 */

function calculateSingleAmenityScore(count: number, threshold: number): number {
  // when the count reaches 2/3 of the threshold, the score reaches 0.8
  // when the count reaches threshold, the score reaches 0.9 and then the growth becomes slow
  const ratio = count / threshold;
  return Math.min(1, 1 / (1 + Math.exp(-5 * (ratio - 0.7))));
}

/**
 * calculate the amenity score and store it
 */
export async function calculateAmenitiesScore() {
  const { properties, setAmenitiesScores, setAmenitiesData } =
    useRatingStore.getState();
  const amenitiesScores: Record<string, number> = {};
  const amenitiesData: Record<string, AmenityData> = {};
  const rawScores: number[] = [];

  for (const property of properties) {
    try {
      const response = await fetch(
        `/api/getAmenities?lat=${property.latitude}&lng=${property.longitude}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as AmenityData;
      amenitiesData[property.property_property_id] = data;

      let weightedScore = 0;
      let totalWeight = 0;

      for (const [amenityType, weight] of Object.entries(AMENITY_WEIGHTS)) {
        const count = data[amenityType]?.count || 0;
        const threshold = AMENITY_THRESHOLDS[amenityType];
        const amenityScore = calculateSingleAmenityScore(count, threshold);
        weightedScore += amenityScore * weight;
        totalWeight += weight;

        console.log(
          `${amenityType}: ${count} places, score: ${amenityScore.toFixed(2)}`
        );
      }

      // normalize weights
      weightedScore = weightedScore / totalWeight;
      console.log(`Final weighted score: ${weightedScore.toFixed(2)}`);

      rawScores.push(weightedScore);
      amenitiesScores[property.property_property_id] = weightedScore;
    } catch (error) {
      console.error(
        `Error calculating amenities score for property ${property.property_property_id}:`,
        error
      );
      amenitiesScores[property.property_property_id] = 0;
    }
  }

  // normalize scores
  if (rawScores.length > 0) {
    const maxScore = Math.max(...rawScores);
    const minScore = Math.min(...rawScores);

    if (maxScore !== minScore) {
      for (const propertyId in amenitiesScores) {
        amenitiesScores[propertyId] =
          (amenitiesScores[propertyId] - minScore) / (maxScore - minScore);
      }
    }
  }

  setAmenitiesScores(amenitiesScores);
  setAmenitiesData(amenitiesData);

  return {
    scores: amenitiesScores,
    data: amenitiesData,
  };
}
