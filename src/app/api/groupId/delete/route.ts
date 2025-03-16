import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";
import { currentUser } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("saved_groups")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);

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
