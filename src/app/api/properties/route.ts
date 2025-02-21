import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";

// 处理 GET 请求，获取所有房源数据
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase.from("properties").select("*");
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

