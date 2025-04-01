import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";

export async function PUT(req: NextRequest) {
  const { group_id, group_name, user_id } = await req.json();

  if (!group_id || !group_name) {
    return NextResponse.json(
      { error: "Group ID and name are required" },
      { status: 400 }
    );
  }
  try {
    const { data, error } = await supabase
      .from("saved_groups")
      .update({ group_name: group_name })
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, data: data.map(({ user_id, ...rest }) => rest) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}
