import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY env variable.");
}

interface Property {
  latitude: number;
  longitude: number;
}

interface POI {
  poi_id: string;
  latitude: number;
  longitude: number;
}

interface RouteResult {
  poiId: string;
  distanceText: string;
  durationText: string;
  polyline: string;
}

function mapTravelMode(mode: "DRIVING" | "WALKING" | "TRANSIT"): string {
  switch (mode) {
    case "DRIVING":
      return "DRIVE";
    case "WALKING":
      return "WALK";
    case "TRANSIT":
      return "TRANSIT";
    default:
      return "DRIVE";
  }
}

export async function POST(req: NextRequest) {
  //console.log("getRouteToPOIs API triggered!");
  try {
    const body = await req.json();
    const { property, pois, travelMode } = body as {
      property: Property;
      pois: POI[];
      travelMode: "DRIVING" | "WALKING" | "TRANSIT";
    };

    if (!property || !pois || pois.length === 0) {
      return NextResponse.json(
        { error: "Missing property address or POIs" },
        { status: 400 }
      );
    }

    const results: RouteResult[] = [];
    const googleTravelMode = mapTravelMode(travelMode);

    for (const poi of pois) {
      const requestBody: any = {
        origin: {
          location: {
            latLng: {
              latitude: property.latitude,
              longitude: property.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: poi.latitude,
              longitude: poi.longitude,
            },
          },
        },
        travelMode: googleTravelMode,
        languageCode: "en-US",
        units: "METRIC",
        polylineQuality: "OVERVIEW",
        polylineEncoding: "ENCODED_POLYLINE",
      };
      if (googleTravelMode === "DRIVE" || googleTravelMode === "TWO_WHEELER") {
        requestBody.routingPreference = "TRAFFIC_AWARE";
      }

      const routeResponse = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY || "",
            "X-Goog-FieldMask":
              "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!routeResponse.ok) {
        console.error(`Failed route for POI ${poi.poi_id}`);
        continue;
      }

      const data = await routeResponse.json();
      const route = data.routes?.[0];

      if (!route) continue;

      results.push({
        poiId: poi.poi_id,
        distanceText: `${(route.distanceMeters / 1000).toFixed(1)} km`,
        durationText: parseDuration(route.duration),
        polyline: route.polyline?.encodedPolyline || "",
      });
    }

    return NextResponse.json({ routes: results });
  } catch (err) {
    console.error("getRoutesToPOIs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function parseDuration(duration: string): string {
  // Example input: "1423s" -> "24 min"
  const seconds = parseInt(duration.replace("s", ""), 10);
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}
