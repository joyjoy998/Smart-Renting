import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env
  .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("Missing GOOGLE_MAPS_API_KEY environment variable.");
}

interface Property {
  property_property_id: string;
  address: string;
}

interface POI {
  poi_id: string;
  address: string;
}

type TravelMode = "DRIVE" | "BICYCLE" | "WALK" | "TWO_WHEELER" | "TRANSIT";

function mapTravelMode(mode: "WALKING" | "DRIVING" | "TRANSIT"): TravelMode {
  switch (mode) {
    case "WALKING":
      return "WALK";
    case "DRIVING":
      return "DRIVE";
    case "TRANSIT":
      return "TRANSIT";
    default:
      return "DRIVE";
  }
}

interface RouteData {
  propertyId: string;
  distanceMeters: number;
  duration: string;
}

/**
 * use Google Directions API v2 to calculate the route between two points
 */
async function computeRoute(
  origin: string,
  destination: string,
  travelMode: TravelMode
): Promise<{ distanceMeters: number; duration: string } | null> {
  try {
    const requestBody: any = {
      origin: {
        address: origin,
      },
      destination: {
        address: destination,
      },
      travelMode: travelMode,
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      },
      languageCode: "en-US",
      units: "METRIC",
    };

    if (travelMode === "DRIVE" || travelMode === "TWO_WHEELER") {
      requestBody.routingPreference = "TRAFFIC_AWARE";
    }

    /* console.log(
      "Directions API Request:",
      JSON.stringify(requestBody, null, 2)
    ); */

    // call directions API
    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log("Directions API Response:", JSON.stringify(data, null, 2));

    if (!data.routes || data.routes.length === 0) {
      console.warn("No routes found");
      return null;
    }

    const route = data.routes[0];
    return {
      distanceMeters: route.distanceMeters,
      duration: route.duration,
    };
  } catch (error) {
    console.error("Error computing route:", error);
    return null;
  }
}

/**
 * calculate routes for multiple properties to a single POI
 */
async function getRoutes(
  selectedPOI: POI,
  travelMode: "WALKING" | "DRIVING" | "TRANSIT",
  properties: Property[]
): Promise<RouteData[]> {
  const validProperties = properties.filter((p) => p.address);
  if (validProperties.length === 0) {
    return [];
  }

  if (!selectedPOI.address) {
    console.error("Selected POI has no address");
    return properties.map((property) => ({
      propertyId: property.property_property_id,
      distanceMeters: 9999000,
      duration: "9999s",
    }));
  }

  console.log(
    "Computing routes for POI:",
    JSON.stringify(selectedPOI, null, 2)
  );
  console.log("First property:", JSON.stringify(validProperties[0], null, 2));

  const googleTravelMode = mapTravelMode(travelMode);
  const results: RouteData[] = [];

  for (const property of validProperties) {
    try {
      const routeResult = await computeRoute(
        property.address,
        selectedPOI.address,
        googleTravelMode
      );

      if (routeResult) {
        results.push({
          propertyId: property.property_property_id,
          distanceMeters: routeResult.distanceMeters,
          duration: routeResult.duration,
        });
      } else {
        results.push({
          propertyId: property.property_property_id,
          distanceMeters: 9999000,
          duration: "9999s",
        });
      }
    } catch (error) {
      console.error(
        `Error computing route for property ${property.property_property_id}:`,
        error
      );
      results.push({
        propertyId: property.property_property_id,
        distanceMeters: 9999000,
        duration: "9999s",
      });
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { selectedPOI, travelMode, properties } = requestData;

    if (!selectedPOI || !properties || properties.length === 0) {
      return NextResponse.json(
        { error: "Missing POI or properties" },
        { status: 400 }
      );
    }

    const validTravelModes = ["WALKING", "DRIVING", "TRANSIT"];
    if (!validTravelModes.includes(travelMode)) {
      return NextResponse.json(
        { error: "Invalid travel mode" },
        { status: 400 }
      );
    }

    const routes = await getRoutes(selectedPOI, travelMode, properties);
    return NextResponse.json({ routes });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
