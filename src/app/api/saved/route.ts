// src/app/api/saved/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // 假设你通过请求头传入 user_id 或解析 auth token，此处简化为查询所有 saved_groups
    // 实际上应使用: .eq("user_id", auth.uid()::text)
    const { data, error } = await supabase
      .from("saved_groups")
      .select(`
        group_id,
        group_name,
        created_at,
        saved_pois (
          poi_id,
          note,
          created_at
        ),
        saved_properties (
          property_id,
          note,
          created_at
        )
      `);
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
