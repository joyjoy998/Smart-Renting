import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

// GET: return all preferences of the specified user_id
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, preferences } = body;
    if (!user_id || !preferences) {
      return NextResponse.json({ error: "user_id and preferences are required" }, { status: 400 });
    }
    // construct each record to include user_id
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

// PUT: update the specified preference, require user_id and preference_type in the URL
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

// DELETE: delete the specified preference, require user_id and preference_type in the URL
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
