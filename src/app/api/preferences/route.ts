import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

// GET: 返回指定 user_id 的所有偏好记录
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: 插入当前用户的一组偏好数据
// 请求体示例：
// {
//   "user_id": "clrk_abc123",
//   "preferences": [
//      { "preference_type": "distance", "weight": 0.8, "preference_order": 1 },
//      { "preference_type": "price", "weight": 0.6, "preference_order": 2 },
//      { "preference_type": "amenity", "weight": 0.7, "preference_order": 3 },
//      { "preference_type": "neighborhood_safety", "weight": 0.9, "preference_order": 4 }
//   ]
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, preferences } = body;
    if (!user_id || !preferences) {
      return NextResponse.json({ error: "user_id and preferences are required" }, { status: 400 });
    }
    // 构造每一条记录都带上 user_id
    const preferencesToInsert = preferences.map((pref: any) => ({
      ...pref,
      user_id
    }));
    const { data, error } = await supabase
      .from("user_preferences")
      .insert(preferencesToInsert);
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT: 更新指定偏好，要求 URL 中有 user_id 和 preference_type 参数
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const preferenceType = searchParams.get("preference_type");
    if (!userId || !preferenceType) {
      return NextResponse.json({ error: "user_id and preference_type are required" }, { status: 400 });
    }
    const body = await req.json();
    const { data, error } = await supabase
      .from("user_preferences")
      .update(body)
      .eq("user_id", userId)
      .eq("preference_type", preferenceType);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: 删除指定偏好，要求 URL 中有 user_id 和 preference_type 参数
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const preferenceType = searchParams.get("preference_type");
    if (!userId || !preferenceType) {
      return NextResponse.json({ error: "user_id and preference_type are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("user_preferences")
      .delete()
      .eq("user_id", userId)
      .eq("preference_type", preferenceType);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
