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

    // query the properties table where place_id is null or PlaceIdPlaceHolder
    const { data: properties, error: fetchError } = await supabase
      .from("properties")
      .select("*")
      .or('place_id.is.null,place_id.eq."",place_id.eq.PlaceIdPlaceHolder')
      .not("latitude", "is", "null")
      .not("longitude", "is", "null");

    if (fetchError) {
      console.error("Error fetching properties:", fetchError);
      throw fetchError;
    }

    // add debug log
    console.log("Query conditions:", {
      or_filter: 'place_id.is.null,place_id.eq."",place_id.eq.PlaceIdPlaceHolder'
    });

    if (!properties || properties.length === 0) {
      console.log("No properties found matching the criteria");
      return NextResponse.json(
        { message: "No properties need place_id update" },
        { status: 200 }
      );
    }

    console.log(`Found ${properties.length} properties that need place_id update`);
    console.log("Sample property:", properties[0]);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // call the reverse geocoding API for each property
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(
        `Processing ${i + 1}/${properties.length}: Property ID ${property.property_id}`
      );

      const { latitude, longitude } = property;

      try {
        // use latitude and longitude to construct the request URL for the reverse geocoding API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`;
        const response = await fetch(url);
        const geocodeData = await response.json();

        if (
          geocodeData.status === "OK" &&
          geocodeData.results &&
          geocodeData.results.length > 0
        ) {
          // get the place_id of the first result
          const place_id = geocodeData.results[0].place_id;

          // update the place_id in the database
          const { error: updateError } = await supabase
            .from("properties")
            .update({ place_id })
            .eq("property_id", property.property_id);

          if (updateError) throw updateError;
          successCount++;

          results.push({
            property_id: property.property_id,
            status: "success",
            place_id,
          });
        } else {
          console.error(
            `Error: Property ID ${property.property_id}, reverse geocoding failed: ${geocodeData.status}`
          );
          errorCount++;
          results.push({
            property_id: property.property_id,
            status: "error",
            message: `Reverse geocoding failed: ${geocodeData.status}`,
          });
        }
      } catch (err) {
        console.error(
          `Error: Property ID ${property.property_id}, ${(err as Error).message}`
        );
        errorCount++;
        results.push({
          property_id: property.property_id,
          status: "error",
          message: (err as Error).message,
        });
      }

      // follow the API call frequency limit, wait 200 milliseconds between requests
      if (i < properties.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    console.log("\nPlace ID update completed:");
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
