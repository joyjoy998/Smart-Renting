import { NextRequest, NextResponse } from "next/server";
import NodeCache from "node-cache";

//get google places API key from environment variables
const GOOGLE_PLACES_API_KEY = process.env
  .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
if (!GOOGLE_PLACES_API_KEY) {
  throw new Error("Missing GOOGLE_PLACES_API_KEY environment variable.");
}

const PLACES_API_URL =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

class PlacesAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlacesAPIError";
  }
}

// mapping of amenity categories to google places API types
// each category maps to multiple relevant place types
const AMENITY_TYPES: Record<string, string[]> = {
  hospital: ["hospital", "doctor"],
  gym: ["gym", "fitness_center"],
  convenienceStore: [
    "convenience_store",
    "supermarket",
    "grocery_store",
    "shopping_mall",
  ],
  restaurant: ["restaurant", "cafe", "food"],
  park: ["park", "playground"],
};

const cache = new NodeCache({ stdTTL: 43200 });

interface AmenityResult {
  count: number;
  places: Array<{
    name: string;
    vicinity: string;
  }>;
}

interface PlacesApiResponse {
  status: string;
  results: Array<{
    name: string;
    vicinity: string;
  }>;
  error_message?: string;
}

/**
 * Fetches nearby amenities for a given location
 *
 * @param lat - Latitude of the location
 * @param lng - Longitude of the location
 * @returns Object containing counts and details of nearby amenities by category
 */

async function fetchAmenities(lat: number, lng: number) {
  const cacheKey = `amenities_${lat}_${lng}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log(`Using Cached Amenities Data for ${lat}, ${lng}`);
    return cachedData;
  }

  console.log(`Fetching Amenities Data for ${lat}, ${lng}...`);

  // initialize results object with empty data for each category
  const results: Record<string, AmenityResult> = {
    hospital: { count: 0, places: [] },
    gym: { count: 0, places: [] },
    convenienceStore: { count: 0, places: [] },
    restaurant: { count: 0, places: [] },
    park: { count: 0, places: [] },
  };

  // iterate through each category and its corresponding place types
  for (const [category, types] of Object.entries(AMENITY_TYPES)) {
    for (const type of types) {
      try {
        const url = new URL(PLACES_API_URL);
        url.searchParams.append("location", `${lat},${lng}`);
        url.searchParams.append("radius", "3000");
        url.searchParams.append("type", type);
        url.searchParams.append("key", GOOGLE_PLACES_API_KEY);

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new PlacesAPIError(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as PlacesApiResponse;

        if (data.status === "OK") {
          // filter out duplicate places within the same category
          const newPlaces = data.results
            .filter((place) => {
              return !results[category].places.some(
                (existing) => existing.name === place.name
              );
            })
            .map((place) => ({
              name: place.name,
              vicinity: place.vicinity,
            }));

          results[category].places.push(...newPlaces);
          results[category].count = results[category].places.length;
        } else if (data.status === "ZERO_RESULTS") {
          continue;
        } else if (data.status === "OVER_QUERY_LIMIT") {
          console.error(`API quota exceeded for ${category}/${type}`);
          throw new PlacesAPIError("API quota exceeded");
        } else {
          console.warn(
            `Places API error for ${category}/${type}:`,
            data.status,
            data.error_message
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching ${category}/${type} data:`, error);
        if (error instanceof PlacesAPIError) {
          throw error;
        }
        throw new PlacesAPIError("Failed to fetch places data");
      }
    }
  }

  for (const category of Object.keys(results)) {
    results[category].count = results[category].places.length;
  }

  cache.set(cacheKey, results);
  return results;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing latitude or longitude" },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude values" },
        { status: 400 }
      );
    }

    const amenitiesData = await fetchAmenities(latitude, longitude);
    return NextResponse.json(amenitiesData);
  } catch (error) {
    console.error("API Error:", error);
    if (
      error instanceof PlacesAPIError &&
      error.message === "API quota exceeded"
    ) {
      return NextResponse.json(
        { error: "API quota limit reached. Please try again later." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
