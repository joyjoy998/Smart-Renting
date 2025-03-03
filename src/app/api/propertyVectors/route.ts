import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase 服务器端环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    // 查询表是否存在
    const { data, error } = await supabase
      .from("property_vectors")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error fetching table:", error.message);
      return NextResponse.json(
        { exists: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ exists: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { exists: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
