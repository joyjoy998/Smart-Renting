import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// connect to Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Connecting Vector API
const SILICON_FLOW_API_KEY = process.env.SILICON_FLOW_API_KEY!;
const SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/embeddings";

// **Calculate unit rent (considering bedroom + bathroom weights)**
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

// **Calculate safety score description**
function calculateSafetyDescription(safety_score?: number): string {
  if (safety_score === undefined) return "Safety status is unknown";
  if (safety_score >= 0.88)
    return "This property is in a high-security area, suitable for safety-conscious tenants.";
  if (safety_score >= 0.5)
    return "This property has an average safety rating, meeting general safety standards.";
  return "This property has a low safety rating, tenants are advised to consider additional security measures.";
}

// **Format property information**
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

// **Call Vector API**
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
    // **get properties data **
    const { data: properties, error } = await supabase
      .from("properties")
      .select("*");

    if (error) throw new Error(`Failed to fetch properties: ${error.message}`);
    if (!properties || properties.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No properties found",
      });
    }

    console.log(`Processing ${properties.length} properties...`);

    // **format property data**
    const results = await Promise.all(
      properties.map(async (property) => {
        try {
          const text = formatPropertyData(property);
          console.log(`Formatted text for property_id ${property.property_id}`);

          // **generate vectors**
          const vector = await generateEmbedding(text);
          if (!vector) {
            console.error(
              `Embedding API failed for property_id ${property.property_id}`
            );
            return { property_id: property.property_id, success: false };
          }

          console.log(
            `Embedding generated for property_id ${property.property_id}:`,
            vector.slice(0, 5),
            "..."
          );

          // **store in database**
          const { error: upsertError } = await supabase
            .from("property_vectors")
            .upsert([
              {
                property_id: property.property_id,
                embedding: vector,
              },
            ]);

          if (upsertError) {
            console.error(
              `Failed to store vector for property_id ${property.property_id}:`,
              upsertError.message
            );
            return { property_id: property.property_id, success: false };
          }

          console.log(
            `Vector stored successfully for property_id ${property.property_id}`
          );
          return { property_id: property.property_id, success: true };
        } catch (error) {
          console.error(
            `Error processing property_id ${property.property_id}:`,
            error
          );
          return { property_id: property.property_id, success: false };
        }
      })
    );

    // **success/failure count**
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    console.log(
      `Vectorization completed: ${successCount} success, ${failedCount} failed`
    );

    return NextResponse.json({
      success: true,
      message: `Vectors stored successfully: ${successCount} success, ${failedCount} failed`,
    });
  } catch (err) {
    console.error("POST Error:", (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}

//calling method: curl -X POST http://localhost:3000/api/vectorizeProperties
