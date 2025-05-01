import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";

async function triggerVectorization(placeId: string) {
  try {
    console.log(`🔄 Triggering vectorization for place_id: ${placeId}`);

    const response = await fetch("/api/vectorizeUserProperties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place_id: placeId }),
    });

    const result = await response.json();
    console.log(`✅ Vectorization result:`, result);
    return result;
  } catch (error) {
    console.error(
      `❌ Failed to trigger vectorization for place_id ${placeId}:`,
      error
    );

    return { success: false, error: (error as Error).message };
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

    // const body = await req.json();
    // console.log('body=======', body);

    if (!groupId) {
      return NextResponse.json(
        { error: "group_id is required" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("saved_properties")
      .insert([{ ...body, group_id: groupId }]);

    if (error) {
      console.error("❌ Supabase error:", error); // ✅ print the full error information
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }
    // save the property successfully and trigger vectorization
    if (body.place_id) {
      triggerVectorization(body.place_id).catch((err) =>
        console.error(
          `❌ Vectorization error for place_id ${body.place_id}:`,
          err
        )
      );
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

    // execute Supabase update operation
    const { data, error } = await supabase
      .from("saved_properties") // target table
      .update(body) // update only the fields provided in the request body
      .eq("group_id", groupId)
      .eq("saved_property_id", body.saved_property_id);

    console.log("check========", data, error);
    // handle Supabase error
    if (error) {
      console.error("❌ Supabase update error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }
    if (body.place_id) {
      // if place_id is provided, trigger vectorization
      triggerVectorization(body.place_id).catch((err) =>
        console.error(
          `❌ Vectorization error for place_id ${body.place_id}:`,
          err
        )
      );
    }
    // return success response
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

    // 删除操作前，如果有 place_id，先保存它用于后续删除向量
    const placeIdToDelete = placeId;

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

    // if placeIdToDelete is provided, delete the corresponding vector
    if (placeIdToDelete) {
      try {
        console.log(`🗑️ Deleting vector for place_id: ${placeIdToDelete}`);
        const vectorDeleteResponse = await supabase
          .from("user_property_vectors")
          .delete()
          .eq("place_id", placeIdToDelete);

        if (vectorDeleteResponse.error) {
          console.error(
            `❌ Failed to delete vector for place_id ${placeIdToDelete}:`,
            vectorDeleteResponse.error
          );
        } else {
          console.log(`✅ Vector deleted for place_id ${placeIdToDelete}`);
        }
      } catch (vectorError) {
        console.error(
          `❌ Error deleting vector for place_id ${placeIdToDelete}:`,
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
