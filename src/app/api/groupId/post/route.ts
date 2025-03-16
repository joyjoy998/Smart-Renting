import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { group_name } = await req.json();

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
          user_id: user.id,
          group_name: group_name,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Failed to create group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
