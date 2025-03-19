import { useRatingStore } from "../store/ratingStore";
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
  // For ISO 8601 format, we'll need more complex parsing
  // This is a simplified version assuming seconds
  return parseInt(duration.replace(/\D/g, ""));
}

/**
 * Calculate distance scores based on travel times
 * @param routes Array of route data from Google API
 * @returns Object containing distance scores, travel times, and distances
 */
function calculateScores(routes: RouteData[]) {
  console.log("Calculating scores from routes:", routes);

  const distanceScores: Record<string, number> = {};
  const travelTimes: Record<string, number> = {};
  const distances: Record<string, number> = {};

  // Convert all durations to seconds and store in travelTimes
  routes.forEach((route) => {
    const durationInSeconds = durationToSeconds(route.duration);
    travelTimes[route.propertyId] = durationInSeconds;
    distances[route.propertyId] = route.distanceMeters / 1000; // Convert to km

    console.log(
      `Property ${route.propertyId}: ${
        route.distanceMeters / 1000
      } km, ${durationInSeconds} seconds`
    );
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

  console.log(`Travel time range: min=${minTime}, max=${maxTime}`);

  if (maxTime === minTime) {
    console.log("All travel times are equal, setting all scores to 1");
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

      console.log(
        `Property ${route.propertyId} score: ${
          distanceScores[route.propertyId]
        }`
      );
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
    // 确保 POI 和 properties 对象有必要的字段，尤其是 address
    if (!selectedPOI.address) {
      console.error("Selected POI has no address:", selectedPOI);
      throw new Error("Selected POI has no address");
    }

    const validProperties = properties.filter((p) => p.address);
    if (validProperties.length === 0) {
      console.error("No properties with valid addresses found:", properties);
      throw new Error("No properties with valid addresses");
    }

    console.log("Making API request to /api/getDistance");

    // Call the API route to get route data
    const response = await axios.post("/api/getDistance", {
      selectedPOI,
      travelMode,
      properties: validProperties,
    });

    console.log("API response received:", response.data);

    const { routes } = response.data;

    if (!routes || routes.length === 0) {
      console.error("No routes returned from API");
      throw new Error("No routes returned from API");
    }

    // Calculate scores based on the route data
    const { distanceScores, travelTimes, distances } = calculateScores(routes);

    console.log("Final calculated values:", {
      distanceScores,
      travelTimes,
      distances,
    });

    // Update the store with the results
    setDistanceScores(distanceScores);
    setTravelTimes(travelTimes);
    setDistances(distances);

    console.log("Store updated successfully");
  } catch (error) {
    console.error("Error calculating distance scores:", error);

    // Set default values in case of error
    const distanceScores: Record<string, number> = {};
    const travelTimes: Record<string, number> = {};
    const distances: Record<string, number> = {};

    properties.forEach((property) => {
      const propertyId = property.property_property_id;
      distanceScores[propertyId] = 0;
      travelTimes[propertyId] = 9999;
      distances[propertyId] = 9999;
    });

    console.log("Setting default values due to error");
    setDistanceScores(distanceScores);
    setTravelTimes(travelTimes);
    setDistances(distances);
  }
}
