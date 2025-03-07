import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Connect to Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define Property type
// Define Property type
interface Property {
  property_id: number;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  weekly_rent: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  property_type: string;
  safety_score: number;
  photo: string[];
}

// Define the recommended property type
interface Recommendation {
  property_id: number;
  final_score: number;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const user_id = searchParams.get("user_id");
    const group_id = searchParams.get("group_id");
    const min_budget = searchParams.get("min_budget");
    const max_budget = searchParams.get("max_budget");
    // let user_id: string | null = searchParams.get("user_id");
    // let group_id: string | null = searchParams.get("group_id");

    // TEST CASES
    // 1. USER WITHOUT POI AND PROPERTIES
    // const user_id: string | null = "user2";
    // const group_id: string | null = "";
    // 2. USER WITH POI AND PROPERTIES
    // const user_id: string | null = "user1";
    // const group_id: string | null = "1";

    // 3. USER WITH POI NO PROPERTIES
    // const user_id: string | null = "user4";
    // const group_id: string | null = "3";
    // const min_budget = "";
    // const max_budget = "600";

    // 4. USER WITH PROPERTIES NO POI
    // const user_id: string | null = "user3";
    // const group_id: string | null = "5";

    // check user_id existence
    if (!user_id) {
      console.error("user_id is required.");
      return NextResponse.json(
        { success: false, error: "user_id is required." },
        { status: 400 }
      );
    }

    console.log("user_id:", user_id);
    console.log(
      "group_id:",
      group_id ?? "NULL (User has no marked POI or properties)"
    );
    console.log(
      "Budget Range:",
      min_budget ? `Min: $${min_budget}` : "No Min",
      max_budget ? `Max: $${max_budget}` : "No Max"
    );

    let recommendedProperties: any[] = [];

    // if group_id is null return all properties
    if (!group_id || group_id.trim() === "") {
      console.warn(
        "No group_id provided, user has no marked POI or properties. Returning all listings."
      );

      // get all properties
      const { data: allProperties, error: allPropertiesError } = await supabase
        .from("properties")
        .select("*");

      if (allPropertiesError) {
        console.error(
          "Failed to fetch all properties:",
          allPropertiesError.message
        );
        return NextResponse.json(
          { success: false, error: allPropertiesError.message },
          { status: 500 }
        );
      }

      recommendedProperties = allProperties;
    } else {
      // transform group_id to int
      const parsedGroupId = parseInt(group_id, 10);
      if (isNaN(parsedGroupId)) {
        console.error("Invalid group_id format, must be a number.");
        return NextResponse.json(
          { success: false, error: "Invalid group_id format." },
          { status: 400 }
        );
      }

      // check whether the group_id belongs to  user_id
      const { data: groupCheck, error: groupCheckError } = await supabase
        .from("saved_groups")
        .select("group_id")
        .eq("group_id", parsedGroupId)
        .eq("user_id", user_id)
        .single();

      if (groupCheckError && groupCheckError.code !== "PGRST116") {
        console.error(
          "Failed to validate group ownership:",
          groupCheckError.message
        );
        return NextResponse.json(
          { success: false, error: groupCheckError.message },
          { status: 500 }
        );
      }

      if (!groupCheck) {
        console.error(
          "The specified group_id does not belong to this user_id."
        );
        return NextResponse.json(
          {
            success: false,
            error: "The specified group_id does not belong to this user_id.",
          },
          { status: 403 }
        );
      }

      console.log("Calling stored procedure recommend_properties_for_user...");

      // call supabase function to get recommendation
      const { data: recommendedData, error: recommendError } =
        await supabase.rpc("recommend_properties_for_user", {
          user_id: user_id,
          group_id: parsedGroupId,
        });

      if (recommendError) {
        console.error(
          "Failed to fetch recommendations:",
          recommendError.message
        );
        return NextResponse.json(
          { success: false, error: recommendError.message },
          { status: 500 }
        );
      }

      console.log("Recommended property IDs:", recommendedData);

      const recommendedDataTyped: Recommendation[] = recommendedData || [];

      if (!recommendedDataTyped.length) {
        console.warn("⚠️ No recommendations found for this user.");
        return NextResponse.json({
          success: true,
          recommended_properties: [],
          message: "No recommendations found",
        });
      }

      //extract property id from recommendation result
      let propertyIds: number[] = recommendedDataTyped.map(
        (item: Recommendation) => item.property_id
      );

      // get detailed info from properties table
      let query = supabase
        .from("properties")
        .select("*")
        .in("property_id", propertyIds);

      // for users who marked poi only apply budget filter
      const isOnlyPOIUser = await supabase
        .from("saved_properties")
        .select("property_id")
        .eq("group_id", parsedGroupId)
        .limit(1);

      if (isOnlyPOIUser.data?.length === 0) {
        if (min_budget)
          query = query.gte("weekly_rent", parseFloat(min_budget));
        if (max_budget)
          query = query.lte("weekly_rent", parseFloat(max_budget));
      }

      const { data: propertyDetails, error: propertyError } = await query;

      if (propertyError) {
        console.error(
          "Failed to fetch property details:",
          propertyError.message
        );
        return NextResponse.json(
          { success: false, error: propertyError.message },
          { status: 500 }
        );
      }

      console.log("Property details fetched:", propertyDetails);

      // merge final score to the result
      recommendedProperties = propertyDetails.map((property) => ({
        ...property,
        final_score:
          recommendedDataTyped.find(
            (r) => r.property_id === property.property_id
          )?.final_score ?? 0,
      }));

      // sort final score desc
      recommendedProperties.sort(
        (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)
      );
    }

    return NextResponse.json({
      success: true,
      recommended_properties: recommendedProperties,
    });
  } catch (err) {
    console.error("API Error:", (err as Error).message);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
