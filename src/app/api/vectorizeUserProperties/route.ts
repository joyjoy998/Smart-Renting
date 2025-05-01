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

// format user-defined properties
function formatSavedPropertyData(property: any): string {
  return `This is a ${property.bedrooms || "unknown"}-bedroom, ${
    property.bathrooms || "unknown"
  }-bathroom, ${property.parking_spaces || "unknown"}-parking space ${
    property.property_type || "residence"
  }.
  It is located at ${property.street}, ${property.suburb}, ${
    property.state
  }, postal code ${property.postcode}.
  ${calculatePerRoomRent(
    property.weekly_rent,
    property.bedrooms,
    property.bathrooms
  )}
  ${calculateSafetyDescription(property.safety_score)}
  Additional notes: ${property.note || "No additional notes provided."} 
  This property is ideal for tenants looking for a ${
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
    let savedPropertyIds: number[] = [];
    let body = null;
    let groupId = null;

    try {
      const contentType = req.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await req.text();
        if (text) {
          body = JSON.parse(text);
          console.log("Request body:", body);

          // Extract group_id from request
          groupId = body.group_id;
        }
      }
    } catch (e) {
      console.log("No valid JSON body provided, but group_id is required");
    }

    // Validate group_id
    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "group_id is required" },
        { status: 400 }
      );
    }

    console.log(`Processing properties for group_id ${groupId}`);

    // Supports two invocation modes:
    // 1. Pass in a specific saved_property_id for processing
    // 2. No parameters passed – process all user-defined properties in the group that have not been vectorized

    if (body && body.saved_property_id) {
      // Verify the saved_property_id belongs to the specified group
      const { data: propertyCheck, error: checkError } = await supabase
        .from("saved_properties")
        .select("saved_property_id")
        .eq("saved_property_id", body.saved_property_id)
        .eq("group_id", groupId)
        .limit(1);

      if (checkError || !propertyCheck || propertyCheck.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Property not found or does not belong to the specified group",
          },
          { status: 403 }
        );
      }

      // handle specific saved_property_id
      savedPropertyIds = [body.saved_property_id];
      console.log(
        `Processing specific saved_property_id: ${body.saved_property_id}`
      );
    } else {
      // Retrieve all user-defined saved properties in the group that need vectorization
      const { data, error } = await supabase
        .from("saved_properties")
        .select("saved_property_id")
        .is("property_id", null) // Only select user-defined properties
        .eq("group_id", groupId) // Filter by specified group
        .not("saved_property_id", "in", (rq: any) =>
          rq.from("user_saved_property_vectors").select("saved_property_id")
        );

      if (error) {
        throw new Error(
          `Failed to fetch unvectorized saved properties: ${error.message}`
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No new user-defined properties to process in this group",
        });
      }

      savedPropertyIds = data.map((item) => item.saved_property_id);
    }

    console.log(
      `Processing ${savedPropertyIds.length} user-defined properties...`
    );

    // Process saved_property_ids
    const results = await Promise.all(
      savedPropertyIds.map(async (saved_property_id) => {
        try {
          // get the saved property info
          const { data: properties, error } = await supabase
            .from("saved_properties")
            .select("*")
            .eq("saved_property_id", saved_property_id)
            .eq("group_id", groupId) // Ensure property belongs to specified group
            .limit(1);

          if (error || !properties || properties.length === 0) {
            console.error(
              `No property found for saved_property_id ${saved_property_id}`
            );
            return {
              saved_property_id,
              success: false,
              error: "Property not found",
            };
          }

          const property = properties[0];

          // Check if it's a user-defined property
          if (property.property_id !== null) {
            console.error(
              `Property ${saved_property_id} is not user-defined, skipping vectorization`
            );
            return {
              saved_property_id,
              success: false,
              error: "Not a user-defined property",
            };
          }

          const text = formatSavedPropertyData(property);
          console.log(
            `Formatted text for saved_property_id ${saved_property_id}`
          );

          // generate vector
          const vector = await generateEmbedding(text);
          if (!vector) {
            console.error(
              `Embedding API failed for saved_property_id ${saved_property_id}`
            );
            return {
              saved_property_id,
              success: false,
              error: "Embedding generation failed",
            };
          }

          console.log(
            `Embedding generated for saved_property_id ${saved_property_id}`
          );

          // store in database
          const now = new Date().toISOString();
          const { error: upsertError } = await supabase
            .from("user_saved_property_vectors")
            .upsert([
              {
                saved_property_id: saved_property_id,
                embedding: vector,
                updated_at: now,
              },
            ]);

          if (upsertError) {
            console.error(
              `Failed to store vector for saved_property_id ${saved_property_id}:`,
              upsertError.message
            );
            return {
              saved_property_id,
              success: false,
              error: upsertError.message,
            };
          }

          console.log(
            `Vector stored successfully for saved_property_id ${saved_property_id}`
          );
          return { saved_property_id, success: true };
        } catch (error) {
          console.error(
            `Error processing saved_property_id ${saved_property_id}:`,
            error
          );
          return {
            saved_property_id,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    // Count success/failure
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

// Support for deleting vectors
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const savedPropertyId = searchParams.get("saved_property_id");
    const groupId = searchParams.get("group_id");

    if (!savedPropertyId) {
      return NextResponse.json(
        { success: false, error: "saved_property_id is required" },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "group_id is required" },
        { status: 400 }
      );
    }

    // Verify the saved_property_id belongs to the specified group
    const { data: propertyCheck, error: checkError } = await supabase
      .from("saved_properties")
      .select("saved_property_id")
      .eq("saved_property_id", savedPropertyId)
      .eq("group_id", groupId)
      .limit(1);

    if (checkError || !propertyCheck || propertyCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found or does not belong to the specified group",
        },
        { status: 403 }
      );
    }

    // Delete from user_saved_property_vectors
    const { error } = await supabase
      .from("user_saved_property_vectors")
      .delete()
      .eq("saved_property_id", savedPropertyId);

    if (error) {
      console.error(
        `Failed to delete vector for saved_property_id ${savedPropertyId}:`,
        error
      );
      return NextResponse.json(
        { success: false, error: `Failed to delete vector: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Vector deleted successfully for saved_property_id ${savedPropertyId}`,
    });
  } catch (err) {
    console.error("DELETE Error:", (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}

// Example usage:
// curl -X POST -H "Content-Type: application/json" -d '{"group_id": 456, "saved_property_id": 789}' http://localhost:3000/api/vectorizeUserProperties
// curl -X POST -H "Content-Type: application/json" -d '{"group_id": 456}' http://localhost:3000/api/vectorizeUserProperties
// curl -X DELETE "http://localhost:3000/api/vectorizeUserProperties?saved_property_id=789&group_id=456"
