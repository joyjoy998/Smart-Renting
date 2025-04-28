import { NextResponse } from "next/server";
import { supabase } from "@/database/supabaseClient";
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const email = user.emailAddresses[0]?.emailAddress;
  const userId = user.id;

  try {
    // check if the user exists in the database
    const { data, error } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      const { error: lastSignInError } = await supabase
        .from("users")
        .update({ last_sign_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (lastSignInError) {
        return NextResponse.json(
          { error: lastSignInError.message },
          { status: 500 }
        );
      }
      // if the user exists, return a success response
      return NextResponse.json(
        { success: true, message: "User already exists" },
        { status: 200 }
      );
    }
    // if the user does not exist, insert them
    const { error: insertUserError } = await supabase
      .from("users")
      .insert([{ user_id: userId, email, username: email }]);

    if (insertUserError) {
      return NextResponse.json(
        { error: insertUserError.message, details: insertUserError.details },
        { status: 500 }
      );
    } else {
      const { error: insertGroupError } = await supabase
        .from("saved_groups")
        .insert([
          {
            user_id: userId,
            group_name: "Archive 1",
          },
        ]);
      if (insertGroupError) {
        return NextResponse.json(
          { error: insertGroupError.message },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { success: true, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ error: "Error checking user" }, { status: 500 });
  }
}
