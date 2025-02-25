import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

// GET: return  all saved_pois records for a given user_id
// utilize the saved_groups relationship to filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_pois")
      .select("*, saved_groups(user_id)")
      .eq("saved_groups.user_id", userId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: insert a new saved_pois record
// Request body must include group_id and other details
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.group_id) {
      return NextResponse.json({ error: "group_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_pois")
      .insert([body]);
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT: update a saved_pois record
// Request URL must include group_id and saved_poi_id
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("group_id");
    const savedPoiId = searchParams.get("saved_poi_id");
    if (!groupId || !savedPoiId) {
      return NextResponse.json({ error: "group_id and saved_poi_id are required" }, { status: 400 });
    }
    const body = await req.json();
    const { data, error } = await supabase
      .from("saved_pois")
      .update(body)
      .eq("group_id", groupId)
      .eq("saved_poi_id", savedPoiId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: delete a saved_pois record
// Request URL must include group_id and saved_poi_id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("group_id");
    const savedPoiId = searchParams.get("saved_poi_id");
    if (!groupId || !savedPoiId) {
      return NextResponse.json({ error: "group_id and saved_poi_id are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_pois")
      .delete()
      .eq("group_id", groupId)
      .eq("saved_poi_id", savedPoiId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
