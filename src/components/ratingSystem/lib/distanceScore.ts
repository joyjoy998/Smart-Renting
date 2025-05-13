import { useRatingStore } from "../../../stores/ratingStore";
import axios from "axios";

interface Property {
  property_property_id: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface POI {
  poi_id: string;
  address: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  type?: string;
}

type TravelMode = "WALKING" | "DRIVING" | "TRANSIT";

interface RouteData {
  propertyId: string;
  distanceMeters: number;
  duration: string;
}

/**
 * Convert duration string to seconds
 * @param duration Duration string in format "1200s" or "PT20M" (ISO 8601)
 * @returns Duration in seconds
 */
export function durationToSeconds(duration: string): number {
  if (duration.endsWith("s")) {
    return parseInt(duration.slice(0, -1));
  }
  return parseInt(duration.replace(/\D/g, ""));
}

/**
 * Get weight for POI based on its type
 * @param poiType Type of the POI
 * @returns Weight for the POI type
 */
export function getPOIWeight(poiType: string | undefined): number {
  const weights: Record<string, number> = {
    Work: 1.0,
    School: 1.0,
    Gym: 0.6,
    Grocery: 0.8,
    Other: 0.5,
  };

  return weights[poiType?.toLowerCase() || ""] || 0.5; // Default weight for unknown types
}

/**
 * Apply sigmoid function to normalize score between 0 and 1
 * with a smoother transition and less extreme values
 * @param value The value to normalize
 * @param midpoint The midpoint of the sigmoid (value that maps to 0.5)
 * @param steepness Controls how steep the sigmoid curve is
 * @returns Normalized value between 0 and 1
 */
export function sigmoidNormalize(
  value: number,
  midpoint: number,
  steepness: number = 0.1
): number {
  return 1 / (1 + Math.exp(steepness * (value - midpoint)));
}

/**
 * Calculate score for a single property-POI pair with time-based scoring
 * @param travelTimeSeconds Travel time in seconds
 * @param poiType Type of the POI
 * @returns Score for this property-POI pair
 */
export function calculateTimeBucketScore(
  travelTimeSeconds: number,
  poiType: string | undefined
): number {
  if (travelTimeSeconds === 9999) return 0; // Invalid route

  // Define time thresholds in minutes (converted to seconds)
  const excellent = 5 * 60; // 5 minutes
  const good = 15 * 60; // 15 minutes
  const fair = 30 * 60; // 30 minutes
  const poor = 60 * 60; // 60 minutes

  // Adjust thresholds based on POI type
  const type = poiType?.toLowerCase() || "";
  const multiplier = (() => {
    if (type === "Work" || type === "School") return 1.5; // Allow longer times for work/school
    if (type === "Grocery") return 1.0; // Standard time for grocery
    if (type === "Gym") return 0.8; // Expect shorter times for gym
    return 1.0; // Default multiplier
  })();

  // Apply the multiplier to the thresholds
  const adjustedExcellent = excellent * multiplier;
  const adjustedGood = good * multiplier;
  const adjustedFair = fair * multiplier;
  const adjustedPoor = poor * multiplier;

  // Score based on time buckets (using sigmoid for smoother transitions)
  if (travelTimeSeconds <= adjustedExcellent) {
    // Excellent: 0.8-1.0
    return (
      0.8 +
      0.2 * sigmoidNormalize(travelTimeSeconds, adjustedExcellent / 2, 0.02)
    );
  } else if (travelTimeSeconds <= adjustedGood) {
    // Good: 0.6-0.8
    const progress =
      (travelTimeSeconds - adjustedExcellent) /
      (adjustedGood - adjustedExcellent);
    return 0.8 - 0.2 * progress;
  } else if (travelTimeSeconds <= adjustedFair) {
    // Fair: 0.4-0.6
    const progress =
      (travelTimeSeconds - adjustedGood) / (adjustedFair - adjustedGood);
    return 0.6 - 0.2 * progress;
  } else if (travelTimeSeconds <= adjustedPoor) {
    // Poor: 0.2-0.4
    const progress =
      (travelTimeSeconds - adjustedFair) / (adjustedPoor - adjustedFair);
    return 0.4 - 0.2 * progress;
  } else {
    // Very Poor: 0-0.2 (with sigmoid decay)
    return 0.2 * sigmoidNormalize(travelTimeSeconds, adjustedPoor * 1.5, 0.01);
  }
}

/**
 * Calculate the comprehensive distance score using POI type-based weights
 * @param poiScores Object containing scores for each POI
 * @param pois Array of POIs with their types
 * @returns Comprehensive score
 */
export function calculateExponentialDistanceScore(
  poiScores: Record<string, number>,
  pois: POI[]
): number {
  const scores = Object.entries(poiScores);
  if (scores.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  // Calculate weighted sum based on POI types
  scores.forEach(([poiId, score]) => {
    const poi = pois.find((p) => p.poi_id === poiId);
    const weight = getPOIWeight(poi?.type);
    weightedSum += score * weight;
    totalWeight += weight;
  });

  // Apply sigmoid normalization to keep scores in a reasonable range
  // This prevents extreme values and centers the distribution
  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return rawScore;
}

/**
 * Calculate distance scores for all properties to all POIs using the existing API
 * @param selectedPOI Parameter kept for compatibility, not used in calculation
 * @param travelMode the mode of transportation selected by the user (walking/driving/transit)
 * @param properties the properties marked by the user
 */
export async function calculateDistanceScore(
  selectedPOI: POI | null,
  travelMode: TravelMode,
  properties: Property[]
) {
  const { pois, setDistanceScores, setTravelTimes, setDistances } =
    useRatingStore.getState();

  if (pois.length === 0 || properties.length === 0) {
    console.warn("No POIs or no properties available.");
    return;
  }

  try {
    const validProperties = properties.filter(
      (p) => p.address && p.latitude && p.longitude
    );
    const validPOIs = pois.filter(
      (p) => p.address && p.latitude && p.longitude
    );

    if (validProperties.length === 0 || validPOIs.length === 0) {
      throw new Error(
        "No properties or POIs with valid addresses and coordinates"
      );
    }

    // Prepare data structures for results
    const travelTimes: Record<string, number> = {};
    const distances: Record<string, number> = {};
    const poiScoresByProperty: Record<string, Record<string, number>> = {};

    // Initialize score objects
    validProperties.forEach((property) => {
      poiScoresByProperty[property.property_property_id] = {};
    });

    // Make API calls for each POI
    for (const poi of validPOIs) {
      // Use existing API endpoint
      const response = await axios.post("/api/getDistance", {
        selectedPOI: poi,
        travelMode,
        properties: validProperties,
      });

      const { routes } = response.data;

      if (!routes || routes.length === 0) {
        console.warn(`No routes returned for POI ${poi.name || poi.poi_id}`);
        continue;
      }

      // Process route data for this POI
      routes.forEach((route: RouteData) => {
        const { propertyId, distanceMeters, duration } = route;
        const durationInSeconds = durationToSeconds(duration);
        const distanceKm = distanceMeters / 1000;

        // Store raw data with combined key for property-POI pair
        const key = `${propertyId}_${poi.poi_id}`;
        travelTimes[key] = durationInSeconds;
        distances[key] = distanceKm;
      });
    }

    // Calculate individual scores for each property-POI pair using time-based scoring
    for (const property of validProperties) {
      const propertyId = property.property_property_id;

      for (const poi of validPOIs) {
        const poiId = poi.poi_id;
        const key = `${propertyId}_${poiId}`;

        if (travelTimes[key] !== undefined) {
          // Use time-bucket scoring instead of normalization across all properties
          const score = calculateTimeBucketScore(travelTimes[key], poi.type);
          poiScoresByProperty[propertyId][poiId] = score;
        }
      }
    }

    // Calculate comprehensive score for each property using POI type-based weights
    const distanceScores: Record<string, number> = {};
    for (const propertyId in poiScoresByProperty) {
      distanceScores[propertyId] = calculateExponentialDistanceScore(
        poiScoresByProperty[propertyId],
        validPOIs
      );
    }

    // Apply final sigmoid normalization to all scores to avoid extreme distributions
    const allScores = Object.values(distanceScores);
    const median =
      allScores.sort((a, b) => a - b)[Math.floor(allScores.length / 2)] || 0.5;

    // Normalize all scores with a sigmoid centered at the median
    for (const propertyId in distanceScores) {
      distanceScores[propertyId] =
        0.3 +
        0.7 *
          sigmoidNormalize(
            1 - distanceScores[propertyId], // Invert because lower time is better
            1 - median,
            10 // Steepness factor
          );
    }

    // Update the store with the results
    setDistanceScores(distanceScores);
    setTravelTimes(travelTimes);
    setDistances(distances);

    console.log("Comprehensive distance scores calculated:", distanceScores);
    return { distanceScores, travelTimes, distances };
  } catch (error) {
    console.error("Error calculating distance scores:", error);
  }
}
