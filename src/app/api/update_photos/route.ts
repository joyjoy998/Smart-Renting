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

    // query the properties table where photo is an empty array
    const { data: properties, error: fetchError } = await supabase
      .from("properties")
      .select("*")
      .eq("photo", "{}")
      .not("place_id", "is", "null");

    if (fetchError) {
      console.error("Error fetching properties:", fetchError);
      throw fetchError;
    }

    if (!properties || properties.length === 0) {
      console.log("No properties found with empty photos");
      return NextResponse.json(
        { message: "No properties need photo update" },
        { status: 200 }
      );
    }

    console.log(`Found ${properties.length} properties that need photo update`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // call Google Places API to get photos for each property
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(
        `Processing ${i + 1}/${properties.length}: Property ID ${property.property_id}`
      );

      try {
        // 1. get Place Details to get photo references
        const placeDetailsUrl = `https://places.googleapis.com/v1/places/${property.place_id}?fields=photos&key=${googleMapsApiKey}`;
        const placeDetailsResponse = await fetch(placeDetailsUrl, {
          headers: {
            'X-Goog-FieldMask': 'photos'
          }
        });
        const placeDetailsData = await placeDetailsResponse.json();

        let photos = [];
        if (placeDetailsData.photos && placeDetailsData.photos.length > 0) {
          // get up to 2 photos
          const maxPhotos = Math.min(2, placeDetailsData.photos.length);
          for (let j = 0; j < maxPhotos; j++) {
            const photoName = placeDetailsData.photos[j].name;
            // use the new Place Photo API to get the photo URL
            const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${googleMapsApiKey}`;
            photos.push(photoUrl);
          }
        }

        // update the photos in the database
        const { error: updateError } = await supabase
          .from("properties")
          .update({ 
            photo: photos.length > 0 ? photos : null
          })
          .eq("property_id", property.property_id);

        if (updateError) throw updateError;
        successCount++;

        results.push({
          property_id: property.property_id,
          status: "success",
          photos_count: photos.length
        });
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

    console.log("\nPhoto update completed:");
    console.log(`Total: ${properties.length} properties`);
    console.log(`Success: ${successCount} properties`);
    console.log(`Failed: ${errorCount} properties`);

    return NextResponse.json(
      {
        total: properties.length,
        success: successCount,
        error: errorCount,
        results
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