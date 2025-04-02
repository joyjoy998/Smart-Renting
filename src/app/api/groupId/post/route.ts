import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";

export async function POST(req: NextRequest) {
  const { group_name, user_id } = await req.json();

  if (!group_name) {
    return NextResponse.json(
      { error: "Group name is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("saved_groups")
      .insert([
        {
          user_id: user_id,
          group_name: group_name,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, data: data.map(({ user_id, ...rest }) => rest) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
