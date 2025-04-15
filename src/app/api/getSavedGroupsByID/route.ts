import { NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // get group_id parameter from url
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json(
      { error: "Group ID is required" },
      { status: 400 }
    );
  }

  try {
    // validate if the group belongs to the current user
    const { data: group, error: groupError } = await supabase
      .from("saved_groups")
      .select("*")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: "Group not found or access denied" },
        { status: 404 }
      );
    }

    // get the properties of the group
    const { data: properties, error: propertiesError } = await supabase
      .from("saved_properties")
      .select("*")
      .eq("group_id", groupId);

    if (propertiesError) {
      return NextResponse.json(
        { error: propertiesError.message },
        { status: 500 }
      );
    }

    // get the POIs of the group
    const { data: pois, error: poisError } = await supabase
      .from("saved_pois")
      .select("*")
      .eq("group_id", groupId);

    if (poisError) {
      return NextResponse.json({ error: poisError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          group,
          properties: properties || [],
          pois: pois || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch group details:", error);
    return NextResponse.json(
      { error: "Failed to fetch group details" },
      { status: 500 }
    );
  }
}
