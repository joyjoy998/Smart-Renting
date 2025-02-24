// src/app/api/pois/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("poi_markers")
      .select("*");
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
