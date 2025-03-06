// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";

// GET: return all properties, public accessible
export async function GET(req: NextRequest) {
  try {
    // properties 表允许 public 查询
    const { data, error } = await supabase.from("properties").select("*");
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: insert a new property, only admin can insert
export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { data, error } = await supabase.from("properties").insert([body]);
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT: update a property, only admin can update, property_id is required in URL
export async function PUT(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) { // get ADMIN_SECRET from Vercel "Environment Variables" and paste it in .env.local file
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");
    if (!propertyId) {
      return NextResponse.json({ error: "property_id is required" }, { status: 400 });
    }
    const body = await req.json();
    const { data, error } = await supabase
      .from("properties")
      .update(body)
      .eq("property_id", propertyId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: delete a property, only admin can delete, property_id is required in URL
export async function DELETE(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");
    if (!propertyId) {
      return NextResponse.json({ error: "property_id is required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("properties")
      .delete()
      .eq("property_id", propertyId);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
