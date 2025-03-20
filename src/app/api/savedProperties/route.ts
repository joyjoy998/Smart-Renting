import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("group_id");
  try {
    const { data, error } = await supabase
        .from('saved_properties')
        .select('*')
        .eq("group_id", groupId);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
} catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { status: 500 });
}
}
// POST: insert a new saved_properties record.
// Request body must include group_id and other property details
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("group_id");
  try {
     // ✅ 检查请求体是否为空
     if (!req.body) {
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }

    // ✅ 解析 JSON，避免 `SyntaxError`
    const text = await req.text(); 
    console.log("📌 请求原始数据:", text);

    const body = JSON.parse(text); // 使用 JSON.parse() 处理
    console.log("📌 解析后的数据:", body);

    // const body = await req.json();
    // console.log('body=======', body);

    if (!groupId) {
      return NextResponse.json({ error: "group_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_properties")
      .insert([{...body, group_id: groupId}]);

    if (error){
      console.error("❌ Supabase 错误:", error);  // ✅ 这里打印完整的错误信息
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ message: "房产成功保存", data }, { status: 200 });
  } catch (err) {
    console.error("❌ 服务器错误:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT: update a saved_properties record.
// Request URL must include group_id and saved_property_id
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("group_id");
  try {
    // ✅ 检查请求体是否为空
    if (!req.body) {
      return NextResponse.json({ error: "请求体缺失" }, { status: 400 });
    }

    // ✅ 解析 JSON，避免 `SyntaxError`
    const text = await req.text();
    console.log("📌 请求原始数据:", text);

    const body = JSON.parse(text); // 使用 JSON.parse() 解析数据
    console.log("📌 解析后的数据:", body);

    // ✅ 检查必须参数
    if (!groupId || !body.saved_property_id) {
      return NextResponse.json(
        { error: "group_id 和 saved_property_id 是必须的" },
        { status: 400 }
      );
    }

    // ✅ 执行 Supabase 更新操作
    const { data, error } = await supabase
      .from("saved_properties") // 目标表
      .update(body) // 仅更新请求体中提供的字段
      .eq("group_id", groupId)
      .eq("saved_property_id", body.saved_property_id);

      console.log('check========',data, error)
    // ✅ 处理 Supabase 错误
    if (error) {
      console.error("❌ Supabase update error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    // ✅ 返回成功响应
    return NextResponse.json({ message: "Property updated successfully", data }, { status: 200 });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: delete a saved_properties record.
// Request URL must include group_id and saved_property_id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("group_id");
    const placeId = searchParams.get("place_id");
    console.log('check=======',groupId,placeId);
    if (!groupId || !placeId) {
      return NextResponse.json({ error: "group_id and place_id are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("group_id", groupId)
      .eq("place_id", placeId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
