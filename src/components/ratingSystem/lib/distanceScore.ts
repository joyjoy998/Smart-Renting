import { useRatingStore } from "@/stores/ratingStore";
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
function durationToSeconds(duration: string): number {
  if (duration.endsWith("s")) {
    return parseInt(duration.slice(0, -1));
  }
  return parseInt(duration.replace(/\D/g, ""));
}

/**
 * Calculate scores for a single property-POI pair
 * @param travelTimeSeconds Travel time in seconds
 * @param allTravelTimes Array of all travel times for normalization
 * @returns Normalized score for this property-POI pair
 */
function calculateSingleScore(
  travelTimeSeconds: number,
  allTravelTimes: number[]
): number {
  if (travelTimeSeconds === 9999) return 0; // Invalid route

  const validTimes = allTravelTimes.filter((time) => time !== 9999);
  if (validTimes.length === 0) return 0;

  const maxTime = Math.max(...validTimes, 1);
  const minTime = Math.min(...validTimes);

  if (maxTime === minTime) return 1;

  return 1 - (travelTimeSeconds - minTime) / (maxTime - minTime);
}

/**
 * Calculate the comprehensive distance score using an exponential decay strategy
 * @param poiScores Object containing scores for each POI
 * @returns Comprehensive score
 */
function calculateExponentialDistanceScore(
  poiScores: Record<string, number>
): number {
  // Get all POI scores for this property
  const scores = Object.values(poiScores);
  if (scores.length === 0) return 0;

  // Sort scores in descending order (best scores first)
  scores.sort((a, b) => b - a);

  let totalWeight = 0;
  let weightedSum = 0;
  const decayFactor = 0.85; // Decay factor - can be adjusted

  // Apply exponential decay weights
  scores.forEach((score, index) => {
    const weight = Math.pow(decayFactor, index); // Weight decays exponentially with rank
    weightedSum += score * weight;
    totalWeight += weight;
  });

  return weightedSum / totalWeight;
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
  console.log("calculateDistanceScore called with:", {
    travelMode,
    propertyCount: properties.length,
  });

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
    const allTravelTimes: number[] = [];
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
        allTravelTimes.push(durationInSeconds);
      });
    }

    // Calculate individual scores for each property-POI pair
    for (const property of validProperties) {
      const propertyId = property.property_property_id;

      for (const poi of validPOIs) {
        const poiId = poi.poi_id;
        const key = `${propertyId}_${poiId}`;

        if (travelTimes[key] !== undefined) {
          const score = calculateSingleScore(travelTimes[key], allTravelTimes);
          poiScoresByProperty[propertyId][poiId] = score;
        }
      }
    }

    // Calculate comprehensive score for each property using exponential decay
    const distanceScores: Record<string, number> = {};
    for (const propertyId in poiScoresByProperty) {
      distanceScores[propertyId] = calculateExponentialDistanceScore(
        poiScoresByProperty[propertyId]
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
