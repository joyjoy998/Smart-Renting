// src/app/api/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // 根据实际情况，获取认证信息，例如：
    // const token = req.headers.get('Authorization');
    // 或者从 cookie 中解析 user_id 等。此处简化处理：
    const { data, error } = await supabase.from("user_preferences").select("*");
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
