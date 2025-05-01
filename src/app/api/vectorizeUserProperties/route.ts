import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// connect Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// connect API
const SILICON_FLOW_API_KEY = process.env.SILICON_FLOW_API_KEY!;
const SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/embeddings";

// calculate unit rent
function calculatePerRoomRent(
  weekly_rent: number,
  bedrooms: number,
  bathrooms: number
): string {
  if (!weekly_rent || !bedrooms) return "Rent price is unknown";
  const bathroomWeight = 0.4;
  const adjustedRooms = bedrooms + bathroomWeight * (bathrooms || 0);
  const perRoomRent = weekly_rent / adjustedRooms;

  if (perRoomRent < 200)
    return "This property has a low rental price, suitable for tenants on a budget.";
  if (perRoomRent < 350)
    return "This property has a moderate rental price with good value for money.";
  return "This property has a high rental price, ideal for those seeking a premium living experience.";
}

// generate safety desc
function calculateSafetyDescription(safety_score?: number): string {
  if (safety_score === undefined) return "Safety status is unknown";
  if (safety_score >= 0.88)
    return "This property is in a high-security area, suitable for safety-conscious tenants.";
  if (safety_score >= 0.5)
    return "This property has an average safety rating, meeting general safety standards.";
  return "This property has a low safety rating, tenants are advised to consider additional security measures.";
}

// format properties
function formatPropertyData(property: any): string {
  return `This is a ${property.bedrooms || "unknown"}-bedroom, ${
    property.bathrooms || "unknown"
  }-bathroom, ${property.parking_spaces || "unknown"}-parking space ${
    property.property_type || "residence"
  }.
  It is located in ${property.suburb}, ${property.state}, postal code ${
    property.postcode
  }.
  ${calculatePerRoomRent(
    property.weekly_rent,
    property.bedrooms,
    property.bathrooms
  )}
  ${calculateSafetyDescription(property.safety_score)}
  Additional details: This property is ideal for tenants looking for a ${
    property.bedrooms || "unknown"
  }-bedroom ${
    property.property_type || "property"
  }, catering to their specific needs.`;
}

// call vectorize api
async function generateEmbedding(text: string) {
  try {
    const response = await fetch(SILICON_FLOW_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SILICON_FLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "BAAI/bge-large-en-v1.5",
        input: text,
        encoding_format: "float",
      }),
    });

    const result = await response.json();

    if (!result || !result.data || result.data.length === 0) {
      console.error("Embedding API failed:", result);
      throw new Error("Failed to retrieve vector embedding");
    }

    return result.data[0].embedding;
  } catch (error) {
    console.error("Error calling embedding API:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    let placeIds: string[] = [];
    let body = null;

    try {
      const contentType = req.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await req.text();
        if (text) {
          body = JSON.parse(text);
        }
      }
    } catch (e) {
      console.log(
        "No valid JSON body provided, processing all unvectorized place_ids"
      );
    }

    // Supports two invocation modes:
    // 1. Pass in a specific place_id for processing
    // 2. No parameters passed – process all place_ids that have not been vectorized

    if (body && body.place_id) {
      // handle specific place_id
      placeIds = [body.place_id];
    } else {
      // Retrieve all place_ids that need processing (present in saved_properties but not in user_property_vectors)
      const { data, error } = await supabase.rpc("get_unvectorized_place_ids");

      if (error)
        throw new Error(
          `Failed to fetch unvectorized place_ids: ${error.message}`
        );
      if (!data || data.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No new place_ids to process",
        });
      }

      placeIds = data.map((item: any) => item.place_id);
    }

    console.log(`Processing ${placeIds.length} place_ids...`);

    // handle specific place_id
    const results = await Promise.all(
      placeIds.map(async (place_id) => {
        try {
          //get the property info of the given place_id
          const { data: properties, error } = await supabase
            .from("saved_properties")
            .select("*")
            .eq("place_id", place_id)
            .limit(1);

          if (error || !properties || properties.length === 0) {
            console.error(`No property found for place_id ${place_id}`);
            return { place_id, success: false };
          }

          const property = properties[0];
          const text = formatPropertyData(property);
          console.log(`Formatted text for place_id ${place_id}`);

          // generate vector
          const vector = await generateEmbedding(text);
          if (!vector) {
            console.error(`Embedding API failed for place_id ${place_id}`);
            return { place_id, success: false };
          }

          console.log(
            `Embedding generated for place_id ${place_id}:`,
            vector.slice(0, 5),
            "..."
          );

          // store in database
          const { error: upsertError } = await supabase
            .from("user_property_vectors")
            .upsert([
              {
                place_id: place_id,
                embedding: vector,
              },
            ]);

          if (upsertError) {
            console.error(
              `Failed to store vector for place_id ${place_id}:`,
              upsertError.message
            );
            return { place_id, success: false };
          }

          console.log(`Vector stored successfully for place_id ${place_id}`);
          return { place_id, success: true };
        } catch (error) {
          console.error(`Error processing place_id ${place_id}:`, error);
          return { place_id, success: false };
        }
      })
    );

    // count success or failure
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    console.log(
      `Vectorization completed: ${successCount} success, ${failedCount} failed`
    );

    return NextResponse.json({
      success: true,
      message: `Vectors stored successfully: ${successCount} success, ${failedCount} failed`,
      results: results,
    });
  } catch (err) {
    console.error("POST Error:", (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
// curl -X POST http://localhost:3000/api/vectorizeUserPropertiess
