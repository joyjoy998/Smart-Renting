import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials in environment variables");
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      return NextResponse.json(
        { error: "Google Maps API Key is not configured" },
        { status: 500 }
      );
    }

    // get all properties with no geo data
    const { data: properties, error: fetchError } = await supabase
      .from("properties")
      .select("*")
      .or("latitude.is.null,longitude.is.null");

    if (fetchError) throw fetchError;

    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { message: "No properties need geocoding" },
        { status: 200 }
      );
    }

    console.log(`Found ${properties.length} properties that need geocoding`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // processing each property
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(
        `Processing ${i + 1}/${properties.length}: Property ID ${
          property.property_id
        }`
      );

      const address = [
        property.street,
        property.suburb,
        property.state,
        property.postcode,
        "Australia",
      ]
        .filter(Boolean)
        .join(", ");

      if (!address) {
        console.error(
          `  Error: Property ID ${property.property_id} has no address info`
        );
        errorCount++;
        results.push({
          property_id: property.property_id,
          status: "error",
          message: "No address information available",
        });
        continue;
      }

      try {
        // call Google Maps Geocoding API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${googleMapsApiKey}`;

        const response = await fetch(url);
        const geocodeData = await response.json();

        if (
          geocodeData.status === "OK" &&
          geocodeData.results &&
          geocodeData.results.length > 0
        ) {
          const location = geocodeData.results[0].geometry.location;

          // update property data in supabase
          const { error: updateError } = await supabase
            .from("properties")
            .update({
              latitude: location.lat,
              longitude: location.lng,
            })
            .eq("property_id", property.property_id);

          if (updateError) throw updateError;
          successCount++;

          results.push({
            property_id: property.property_id,
            status: "success",
            latitude: location.lat,
            longitude: location.lng,
          });
        } else {
          console.error(
            `  Error: Property ID ${property.property_id}, Geocoding failed: ${geocodeData.status}`
          );
          errorCount++;

          results.push({
            property_id: property.property_id,
            status: "error",
            message: `Geocoding failed: ${geocodeData.status}`,
          });
        }
      } catch (err) {
        console.error(
          `  Error: Property ID ${property.property_id}, ${
            (err as Error).message
          }`
        );
        errorCount++;

        results.push({
          property_id: property.property_id,
          status: "error",
          message: (err as Error).message,
        });
      }

      if (i < properties.length - 1) {
        console.log("  Waiting for API rate limit...");
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    console.log("\nGeocoding completed:");
    console.log(`Total: ${properties.length} properties`);
    console.log(`Success: ${successCount} properties`);
    console.log(`Failed: ${errorCount} properties`);

    return NextResponse.json(
      {
        total: properties.length,
        success: successCount,
        error: errorCount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Execution error:", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
