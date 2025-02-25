import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

// GET: return all saved_properties records for a given user_id
// utilize the saved_groups relationship to filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }
    // 假设关系已经在 Supabase 中设置，此处使用 dot notation
    const { data, error } = await supabase
      .from("saved_properties")
      .select("*, saved_groups(user_id)")
      .eq("saved_groups.user_id", userId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: insert a new saved_properties record.
// Request body must include group_id and other property details
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.group_id) {
      return NextResponse.json({ error: "group_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_properties")
      .insert([body]);
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT: update a saved_properties record.
// Request URL must include group_id and saved_property_id
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("group_id");
    const savedPropertyId = searchParams.get("saved_property_id");
    if (!groupId || !savedPropertyId) {
      return NextResponse.json({ error: "group_id and saved_property_id are required" }, { status: 400 });
    }
    const body = await req.json();
    const { data, error } = await supabase
      .from("saved_properties")
      .update(body)
      .eq("group_id", groupId)
      .eq("saved_property_id", savedPropertyId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: delete a saved_properties record.
// Request URL must include group_id and saved_property_id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("group_id");
    const savedPropertyId = searchParams.get("saved_property_id");
    if (!groupId || !savedPropertyId) {
      return NextResponse.json({ error: "group_id and saved_property_id are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("group_id", groupId)
      .eq("saved_property_id", savedPropertyId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
