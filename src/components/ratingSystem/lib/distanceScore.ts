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
 * Calculate distance scores based on travel times
 * @param routes Array of route data from Google API
 * @returns Object containing distance scores, travel times, and distances
 */
function calculateScores(routes: RouteData[]) {
  const distanceScores: Record<string, number> = {};
  const travelTimes: Record<string, number> = {};
  const distances: Record<string, number> = {};

  // Convert all durations to seconds and store in travelTimes
  routes.forEach((route) => {
    const durationInSeconds = durationToSeconds(route.duration);
    travelTimes[route.propertyId] = durationInSeconds;
    distances[route.propertyId] = route.distanceMeters / 1000; // Convert to km
  });

  const validTimes = Object.values(travelTimes).filter((time) => time !== 9999);

  if (validTimes.length === 0) {
    console.warn("No valid travel times found, setting all scores to 0");
    routes.forEach((route) => {
      distanceScores[route.propertyId] = 0;
    });
    return { distanceScores, travelTimes, distances };
  }

  const maxTime = Math.max(...validTimes, 1);
  const minTime = Math.min(...validTimes);

  if (maxTime === minTime) {
    routes.forEach((route) => {
      distanceScores[route.propertyId] = 1;
    });
  } else {
    routes.forEach((route) => {
      const time = travelTimes[route.propertyId];
      if (time === 9999) {
        distanceScores[route.propertyId] = 0; // score for invalid routine is 0
      } else {
        distanceScores[route.propertyId] =
          1 - (time - minTime) / (maxTime - minTime);
      }
    });
  }

  return { distanceScores, travelTimes, distances };
}

/**
 * Calculate the travel time and distance of the selected POI, and calculate the distance score
 * @param selectedPOI the POI selected by the user
 * @param travelMode the mode of transportation selected by the user(walking/driving/public transportation)
 * @param properties the properties marked by the user
 */
export async function calculateDistanceScore(
  selectedPOI: POI,
  travelMode: TravelMode,
  properties: Property[]
) {
  console.log("calculateDistanceScore called with:", {
    selectedPOI,
    travelMode,
    propertyCount: properties.length,
  });

  const { setDistanceScores, setTravelTimes, setDistances } =
    useRatingStore.getState();

  if (!selectedPOI || properties.length === 0) {
    console.warn("No POI selected or no properties available.");
    return;
  }

  try {
    if (!selectedPOI.address) {
      throw new Error("Selected POI has no address");
    }

    const validProperties = properties.filter((p) => p.address);
    if (validProperties.length === 0) {
      throw new Error("No properties with valid addresses");
    }

    // Call the API route to get route data
    const response = await axios.post("/api/getDistance", {
      selectedPOI,
      travelMode,
      properties: validProperties,
    });

    const { routes } = response.data;

    if (!routes || routes.length === 0) {
      throw new Error("No routes returned from API");
    }

    // Calculate scores based on the route data
    const { distanceScores, travelTimes, distances } = calculateScores(routes);

    // Update the store with the results
    setDistanceScores(distanceScores);
    setTravelTimes(travelTimes);
    setDistances(distances);
  } catch (error) {
    console.error("Error calculating distance scores:", error);
  }
}
