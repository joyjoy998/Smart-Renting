import { NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { data: groups, error: groupError } = await supabase
      .from("saved_groups")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: { groups: groups || [] },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
