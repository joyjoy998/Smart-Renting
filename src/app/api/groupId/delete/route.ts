import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";

export async function DELETE(req: NextRequest) {
  try {
    const { group_id, user_id } = await req.json();

    if (!group_id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from("saved_groups")
      .delete()
      .eq("group_id", group_id)
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Group deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
