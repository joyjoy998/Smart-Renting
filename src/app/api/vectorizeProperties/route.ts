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
    let propertyIds: number[] = [];
    let body = null;

    // 解析请求体，检查是否有特定的 property_id
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
        "No valid JSON body provided, processing unvectorized properties"
      );
    }

    // 支持三种调用模式:
    // 1. 传入特定 property_id 处理单个房产
    // 2. 传入 force=true 强制查找未向量化的房产
    // 3. 不传参数 - 处理所有需要更新的房产
    if (body && body.property_id) {
      // 处理特定 property_id
      propertyIds = [body.property_id];
      console.log(`Processing specific property_id: ${body.property_id}`);
    }
    // force 模式处理 - 关键修复：类型统一
    else if (body && body.force === true) {
      console.log(
        "Force mode activated: directly finding unvectorized properties"
      );

      // 获取所有房产ID
      const { data: allProperties, error: allPropsError } = await supabase
        .from("properties")
        .select("property_id");

      if (allPropsError) {
        throw new Error(
          `Failed to fetch all properties: ${allPropsError.message}`
        );
      }

      if (!allProperties || allProperties.length === 0) {
        console.log("No properties found in database");
        return NextResponse.json({
          success: true,
          message: "No properties found in database",
        });
      }

      // 获取所有已有向量的房产ID
      const { data: vectorizedProperties, error: vecPropsError } =
        await supabase.from("property_vectors").select("property_id");

      if (vecPropsError) {
        throw new Error(
          `Failed to fetch vectorized properties: ${vecPropsError.message}`
        );
      }

      // 关键修复：统一类型为 string
      const vectorizedSet = new Set(
        (vectorizedProperties || []).map((item) => String(item.property_id))
      );
      const allPropertyIds = (allProperties || []).map((prop) =>
        String(prop.property_id)
      );

      // 找出未向量化的房产ID
      const unvectorizedIds = allPropertyIds
        .filter((id) => !vectorizedSet.has(id))
        .map((id) => Number(id)); // 保持下游类型一致

      console.log(`DEBUG: allProperties sample:`, allProperties.slice(0, 5));
      console.log(
        `DEBUG: vectorizedProperties sample:`,
        vectorizedProperties?.slice(0, 5)
      );
      console.log(`DEBUG: Set sample:`, Array.from(vectorizedSet).slice(0, 5));
      console.log(
        `DEBUG: unvectorizedIds sample:`,
        unvectorizedIds.slice(0, 5)
      );

      console.log(`Found ${unvectorizedIds.length} unvectorized properties`);
      // 分批，带 offset/limit
      const limit = body.limit || 100;
      const offset = body.offset || 0;
      propertyIds = unvectorizedIds.slice(offset, offset + limit);

      console.log(
        `Will process ${propertyIds.length} properties in this batch (offset=${offset}, limit=${limit})`
      );

      if (propertyIds.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No unvectorized properties to process",
        });
      }
    } else {
      // 原有的增量更新逻辑
      try {
        const { data, error } = await supabase.rpc(
          "get_properties_needing_vectorization"
        );

        if (error) {
          console.error("Failed to call RPC function:", error);
          throw new Error("RPC call failed");
        }

        if (data && data.length > 0) {
          propertyIds = data.map((item: any) => item.property_id);
          console.log(
            `Found ${propertyIds.length} properties needing vectorization via RPC`
          );
        } else {
          console.log("No properties need vectorization");
          return NextResponse.json({
            success: true,
            message: "No properties need vectorization",
          });
        }
      } catch (rpcError) {
        // 方法2：手动查询需要更新的房产
        console.log("Falling back to manual query for unvectorized properties");

        // 获取所有房产ID
        const { data: allProperties, error: propError } = await supabase
          .from("properties")
          .select("property_id, updated_at");

        if (propError) {
          throw new Error(`Failed to fetch properties: ${propError.message}`);
        }

        // 获取所有已有向量的房产ID及其更新时间
        const { data: vectorizedProperties, error: vecError } = await supabase
          .from("property_vectors")
          .select("property_id, updated_at");

        if (vecError) {
          throw new Error(
            `Failed to fetch vectorized properties: ${vecError.message}`
          );
        }

        // 创建向量化房产的映射，用于快速查找
        const vectorizedMap = new Map();
        vectorizedProperties?.forEach((vp: any) => {
          vectorizedMap.set(String(vp.property_id), vp.updated_at);
        });

        // 找出需要更新的房产
        propertyIds = (allProperties || [])
          .filter((prop: any) => {
            const vectorUpdatedAt = vectorizedMap.get(String(prop.property_id));
            return (
              !vectorUpdatedAt ||
              (prop.updated_at &&
                new Date(prop.updated_at) > new Date(vectorUpdatedAt))
            );
          })
          .map((prop: any) => prop.property_id);

        console.log(
          `Found ${propertyIds.length} properties needing vectorization via manual query`
        );
      }
    }

    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No properties need vectorization",
      });
    }

    console.log(`Processing ${propertyIds.length} properties...`);

    // 处理需要更新的房产
    const results = await Promise.all(
      propertyIds.map(async (property_id) => {
        try {
          // 获取房产详细信息
          const { data: properties, error } = await supabase
            .from("properties")
            .select("*")
            .eq("property_id", property_id)
            .limit(1);

          if (error || !properties || properties.length === 0) {
            console.error(`No property found for property_id ${property_id}`);
            return { property_id, success: false, error: "Property not found" };
          }

          const property = properties[0];
          const text = formatPropertyData(property);
          console.log(`Formatted text for property_id ${property_id}`);

          // 生成向量
          const vector = await generateEmbedding(text);
          if (!vector) {
            console.error(
              `Embedding API failed for property_id ${property_id}`
            );
            return {
              property_id,
              success: false,
              error: "Embedding generation failed",
            };
          }

          console.log(
            `Embedding generated for property_id ${property_id}:`,
            vector.slice(0, 5),
            "..."
          );

          // 存储向量，包括更新时间
          const now = new Date().toISOString();
          const { error: upsertError } = await supabase
            .from("property_vectors")
            .upsert([
              {
                property_id: property_id,
                embedding: vector,
                updated_at: now,
              },
            ]);

          if (upsertError) {
            console.error(
              `Failed to store vector for property_id ${property_id}:`,
              upsertError.message
            );
            return { property_id, success: false, error: upsertError.message };
          }

          console.log(
            `Vector stored successfully for property_id ${property_id}`
          );
          return { property_id, success: true };
        } catch (error) {
          console.error(`Error processing property_id ${property_id}:`, error);
          return {
            property_id,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    // 统计成功/失败数
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    console.log(
      `Vectorization completed: ${successCount} success, ${failedCount} failed`
    );

    return NextResponse.json({
      success: true,
      message: `Vectors stored successfully: ${successCount} success, ${failedCount} failed`,
      processed: results,
    });
  } catch (err) {
    console.error("POST Error:", (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
