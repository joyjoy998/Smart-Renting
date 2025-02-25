// src/app/api/pois/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

// only allow requests with valid admin secret
// get ADMIN_SECRET from Vercel "Environment Variables" and pste it in your .env.local file
const isAdmin = (req: NextRequest): boolean => {
  const adminSecret = req.headers.get("x-admin-secret");
  return adminSecret === process.env.ADMIN_SECRET;
};

// GET: get all POI data, public accessible
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase.from("poi_markers").select("*");
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


// POST: insert new POI data. Only allow admin to insert.
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    // body should contain all necessary fields, such as name, category, street, suburb, state, postcode, latitude, longitude, photo, etc
    const { data, error } = await supabase.from("poi_markers").insert([body]);
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// PUT: update POI data. Only allow admin to update. URL should contain poi_id parameter.
export async function PUT(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const poiId = searchParams.get("poi_id");
    if (!poiId) {
      return NextResponse.json({ error: "poi_id is required" }, { status: 400 });
    }
    const body = await req.json();
    const { data, error } = await supabase
      .from("poi_markers")
      .update(body)
      .eq("poi_id", poiId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: delete POI data. Only allow admin to delete. URL should contain poi_id parameter.
export async function DELETE(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const poiId = searchParams.get("poi_id");
    if (!poiId) {
      return NextResponse.json({ error: "poi_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("poi_markers")
      .delete()
      .eq("poi_id", poiId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
