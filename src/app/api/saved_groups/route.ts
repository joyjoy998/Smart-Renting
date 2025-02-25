import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

// GET: retrieve all saved_groups records for a given user_id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_groups")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: insert a new saved_groups record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, group_name } = body;
    if (!user_id || !group_name) {
      return NextResponse.json({ error: "user_id and group_name are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_groups")
      .insert([{ user_id, group_name }]);
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT: update a saved_groups record, requires user_id and group_id in the URL
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const groupId = searchParams.get("group_id");
    if (!userId || !groupId) {
      return NextResponse.json({ error: "user_id and group_id are required" }, { status: 400 });
    }
    const body = await req.json();
    const { data, error } = await supabase
      .from("saved_groups")
      .update(body)
      .eq("user_id", userId)
      .eq("group_id", groupId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: delete a saved_groups record, requires user_id and group_id in the URL
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const groupId = searchParams.get("group_id");
    if (!userId || !groupId) {
      return NextResponse.json({ error: "user_id and group_id are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("saved_groups")
      .delete()
      .eq("user_id", userId)
      .eq("group_id", groupId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
