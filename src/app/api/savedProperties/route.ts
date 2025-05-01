import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";
const DEBUG = process.env.NODE_ENV === "development";
// 格式化用户自定义房源信息
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

// 直接在服务器端实现向量化
async function vectorizeProperty(savedPropertyId: number, groupId: string) {
  try {
    if (DEBUG)
      console.log(
        `🔄 Starting vectorization for saved_property_id: ${savedPropertyId}`
      );

    // 获取房源详细信息
    const { data: properties, error } = await supabase
      .from("saved_properties")
      .select("*")
      .eq("saved_property_id", savedPropertyId)
      .eq("group_id", groupId)
      .limit(1);

    if (error || !properties || properties.length === 0) {
      console.error(
        `No property found for saved_property_id ${savedPropertyId}`
      );
      return { success: false, error: "Property not found" };
    }

    const property = properties[0];
    if (DEBUG)
      console.log(`Found property: ${JSON.stringify(property, null, 2)}`);

    // 检查是否是用户自定义房源
    if (property.property_id !== null) {
      console.error(
        `Property ${savedPropertyId} is not user-defined, skipping vectorization`
      );
      return { success: false, error: "Not a user-defined property" };
    }

    // 格式化文本
    const text = formatSavedPropertyData(property);
    if (DEBUG) console.log(`Formatted text: ${text.substring(0, 200)}...`);

    // 调用向量 API
    const SILICON_FLOW_API_KEY = process.env.SILICON_FLOW_API_KEY!;
    const SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/embeddings";

    if (DEBUG) console.log(`Calling embedding API...`);
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
      console.error(`Embedding API failed:`, result);
      throw new Error("Failed to retrieve vector embedding");
    }

    const vector = result.data[0].embedding;
    if (DEBUG)
      console.log(`Got embedding vector with ${vector.length} dimensions`);

    // 存储向量
    const now = new Date().toISOString();
    if (DEBUG) console.log(`Storing vector in user_saved_property_vectors...`);
    const { error: upsertError } = await supabase
      .from("user_saved_property_vectors")
      .upsert([
        {
          saved_property_id: savedPropertyId,
          embedding: vector,
          updated_at: now,
        },
      ]);

    if (upsertError) {
      console.error(`Failed to store vector:`, upsertError);
      return { success: false, error: upsertError.message };
    }

    console.log(
      `✅ Vector stored successfully for saved_property_id ${savedPropertyId}`
    );
    return { success: true };
  } catch (error) {
    console.error(`❌ Error in vectorization process:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 直接在服务器端实现向量删除
async function removeVector(savedPropertyId: number) {
  try {
    if (DEBUG)
      console.log(
        `🗑️ Removing vector for saved_property_id: ${savedPropertyId}`
      );

    const { error } = await supabase
      .from("user_saved_property_vectors")
      .delete()
      .eq("saved_property_id", savedPropertyId);

    if (error) {
      console.error(`Failed to delete vector:`, error);
      return { success: false, error: error.message };
    }

    console.log(
      `✅ Vector deleted successfully for saved_property_id ${savedPropertyId}`
    );
    return { success: true };
  } catch (error) {
    console.error(`❌ Error in vector deletion:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("group_id");
  try {
    const { data, error } = await supabase
      .from("saved_properties")
      .select("*")
      .eq("group_id", groupId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    // type assertion to Error type
    const error = err as Error;
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

// POST: insert a new saved_properties record.
// Request body must include group_id and other property details
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("group_id");
  try {
    // check if the request body is empty
    if (!req.body) {
      return NextResponse.json(
        { error: "Request body is missing" },
        { status: 400 }
      );
    }

    // parse JSON, avoid `SyntaxError`
    const text = await req.text();
    console.log("📌 请求原始数据:", text);

    const body = JSON.parse(text); // use JSON.parse() to handle
    console.log("📌 解析后的数据:", body);

    if (!groupId) {
      return NextResponse.json(
        { error: "group_id is required" },
        { status: 400 }
      );
    }

    // 添加 .select() 以返回插入的数据
    const { data, error } = await supabase
      .from("saved_properties")
      .insert([{ ...body, group_id: groupId }])
      .select();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    // 检查是否为用户自定义房源并直接向量化
    if (data && data.length > 0) {
      const savedProperty = data[0];

      // 如果是用户自定义房源（property_id 为 null）
      if (savedProperty.property_id === null) {
        const savedPropertyId = savedProperty.saved_property_id;
        if (savedPropertyId && typeof savedPropertyId === "number") {
          // 使用直接向量化方法而不是通过 HTTP 请求
          (async () => {
            try {
              const result = await vectorizeProperty(savedPropertyId, groupId);
              if (!result.success) {
                console.error(`❌ Vectorization failed: ${result.error}`);
              }
            } catch (err) {
              console.error(`❌ Vectorization error:`, err);
            }
          })();
        }
      }
    }

    return NextResponse.json(
      { message: "Property saved successfully", data },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

// PUT: update a saved_properties record.
// Request URL must include group_id and saved_property_id
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("group_id");
  try {
    // check if the request body is empty
    if (!req.body) {
      return NextResponse.json(
        { error: "Request body missing" },
        { status: 400 }
      );
    }

    // parse JSON, avoid `SyntaxError`
    const text = await req.text();
    console.log("📌 Request original data:", text);

    const body = JSON.parse(text); // use JSON.parse() to parse data
    console.log("📌 Parsed data:", body);

    // check if the required parameters are present
    if (!groupId || !body.saved_property_id) {
      return NextResponse.json(
        { error: "group_id and saved_property_id are required" },
        { status: 400 }
      );
    }

    // 先获取要更新的记录，检查是否为用户自定义房源
    const { data: existingData, error: fetchError } = await supabase
      .from("saved_properties")
      .select("property_id")
      .eq("saved_property_id", body.saved_property_id)
      .eq("group_id", groupId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching property:", fetchError);
      return NextResponse.json(
        { error: fetchError.message, details: fetchError },
        { status: 500 }
      );
    }

    // 添加 .select() 以返回更新后的数据
    const { data, error } = await supabase
      .from("saved_properties")
      .update(body)
      .eq("group_id", groupId)
      .eq("saved_property_id", body.saved_property_id)
      .select();

    console.log("check========", data, error);

    if (error) {
      console.error("❌ Supabase update error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    // 如果是用户自定义房源，直接向量化
    if (existingData && existingData.property_id === null) {
      const savedPropertyId = body.saved_property_id;
      if (typeof savedPropertyId === "number") {
        // 使用直接向量化方法而不是通过 HTTP 请求
        (async () => {
          try {
            const result = await vectorizeProperty(savedPropertyId, groupId);
            if (!result.success) {
              console.error(`❌ Vectorization failed: ${result.error}`);
            }
          } catch (err) {
            console.error(`❌ Vectorization error:`, err);
          }
        })();
      }
    }

    return NextResponse.json(
      { message: "Property updated successfully", data },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

/// DELETE: delete a saved_properties record.
// Request URL can include group_id and place_id OR group_id and property_id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("group_id");
    const placeId = searchParams.get("place_id");
    const propertyId = searchParams.get("property_id");

    console.log("check=======", groupId, placeId, propertyId);

    if (!groupId || (!placeId && !propertyId)) {
      return NextResponse.json(
        {
          error: "group_id and either place_id or property_id are required",
        },
        { status: 400 }
      );
    }

    // 在删除前查找要删除的记录，以获取 saved_property_id
    let savedPropertyToDelete = null;

    // 构建查询以获取要删除的记录信息
    let findQuery = supabase
      .from("saved_properties")
      .select("saved_property_id, property_id")
      .eq("group_id", groupId);

    if (placeId) {
      findQuery = findQuery.eq("place_id", placeId);
    } else if (propertyId) {
      findQuery = findQuery.eq("property_id", propertyId);
    }

    const { data: findData, error: findError } = await findQuery.maybeSingle();

    if (findError) {
      console.error("❌ Error finding property to delete:", findError);
    } else {
      savedPropertyToDelete = findData;
    }

    // 执行删除操作
    let query = supabase
      .from("saved_properties")
      .delete()
      .eq("group_id", groupId);

    if (placeId) {
      query = query.eq("place_id", placeId);
    } else if (propertyId) {
      query = query.eq("property_id", propertyId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 如果是用户自定义房源，直接删除向量
    if (savedPropertyToDelete && savedPropertyToDelete.property_id === null) {
      const savedPropertyId = savedPropertyToDelete.saved_property_id;
      if (typeof savedPropertyId === "number") {
        // 使用直接删除向量方法而不是通过 HTTP 请求
        (async () => {
          try {
            const result = await removeVector(savedPropertyId);
            if (!result.success) {
              console.error(`❌ Vector deletion failed: ${result.error}`);
            }
          } catch (err) {
            console.error(`❌ Vector deletion error:`, err);
          }
        })();
      }
    }

    // 处理 placeId 对应的向量（如果需要）
    if (placeId) {
      try {
        console.log(`🗑️ Deleting vector for place_id: ${placeId}`);
        const vectorDeleteResponse = await supabase
          .from("user_property_vectors")
          .delete()
          .eq("place_id", placeId);

        if (vectorDeleteResponse.error) {
          console.error(
            `❌ Failed to delete vector for place_id ${placeId}:`,
            vectorDeleteResponse.error
          );
        } else {
          console.log(`✅ Vector deleted for place_id ${placeId}`);
        }
      } catch (vectorError) {
        console.error(
          `❌ Error deleting vector for place_id ${placeId}:`,
          vectorError
        );
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
