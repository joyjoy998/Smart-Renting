import { useRatingStore } from "@/stores/ratingStore";

interface Property {
  property_property_id: string;
  latitude: number;
  longitude: number;
  address: string;
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
 * calculate the score of a single amenity type using a sigmoid function
 * @param count the number of amenities
 * @param threshold ideal maximun number
 * @returns a score between 0-1
 */
function calculateSingleAmenityScore(count: number, threshold: number): number {
  // Sigmoid function provides a smooth S-curve
  // when the count reaches 2/3 of the threshold, the score reaches 0.8
  // when the count reaches threshold, the score reaches 0.9 and then the growth becomes slow
  const ratio = count / threshold;
  return Math.min(1, 1 / (1 + Math.exp(-5 * (ratio - 0.7))));
}

/**
 * Apply minimum-maximum scaling with a minimum score floor
 * @param rawScore original score
 * @param minScore minimum score in the dataset
 * @param maxScore maximum score in the dataset
 * @param floor minimum allowed score after normalization (default: 0.4)
 * @param ceiling maximum allowed score after normalization (default: 1.0)
 * @returns normalized score between floor and ceiling
 */
function normalizeScoreWithFloor(
  rawScore: number,
  minScore: number,
  maxScore: number,
  floor: number = 0.4,
  ceiling: number = 1.0
): number {
  // If all scores are the same, return a reasonable default
  if (maxScore === minScore) return 0.7;

  // Apply min-max scaling but keep within floor-ceiling range
  const range = ceiling - floor;
  return floor + (range * (rawScore - minScore)) / (maxScore - minScore);
}

/**
 * Apply logarithmic compression to reduce the effect of extreme values
 * @param scores array of scores to compress
 * @returns object with transformed scores
 */
function applyLogarithmicCompression(
  scores: Record<string, number>
): Record<string, number> {
  const transformedScores: Record<string, number> = {};
  const scoreValues = Object.values(scores);

  if (scoreValues.length === 0) return scores;

  // Find min and max for scaling
  const minScore = Math.min(...scoreValues);
  const maxScore = Math.max(...scoreValues);

  // Only apply compression if there's a meaningful range
  if (maxScore - minScore < 0.1) return scores;

  for (const [propertyId, score] of Object.entries(scores)) {
    // Shift to ensure all values are positive
    const shiftedScore = score - minScore + 0.1;
    // Apply log transformation and rescale to 0.4-1 range
    const logScore = Math.log(1 + shiftedScore);
    const maxLogScore = Math.log(1 + (maxScore - minScore + 0.1));

    transformedScores[propertyId] = 0.4 + 0.6 * (logScore / maxLogScore);
  }

  return transformedScores;
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
    if (!property.latitude || !property.longitude) {
      console.warn(
        `Property ${property.property_property_id} has invalid coordinates (lat: ${property.latitude}, lng: ${property.longitude})`
      );
      amenitiesScores[property.property_property_id] = 0.4; // Default to minimum score instead of 0
      continue;
    }

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
      amenitiesScores[property.property_property_id] = 0.4; // Default to minimum score instead of 0
    }
  }

  // Apply scientific normalization with a minimum score floor
  if (rawScores.length > 0) {
    const maxScore = Math.max(...rawScores);
    const minScore = Math.min(...rawScores);

    // First normalize to 0.4-1.0 range
    for (const propertyId in amenitiesScores) {
      amenitiesScores[propertyId] = normalizeScoreWithFloor(
        amenitiesScores[propertyId],
        minScore,
        maxScore
      );
    }

    // Then apply logarithmic compression to further reduce differences
    // between high and low scores, making the distribution more reasonable
    const compressedScores = applyLogarithmicCompression(amenitiesScores);

    // Use the compressed scores
    for (const propertyId in compressedScores) {
      amenitiesScores[propertyId] = compressedScores[propertyId];
    }
  }

  setAmenitiesScores(amenitiesScores);
  setAmenitiesData(amenitiesData);

  return {
    scores: amenitiesScores,
    data: amenitiesData,
  };
}
