import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Connect to Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
}

// Define the recommended property type
interface Recommendation {
  property_id: number;
  final_score: number;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Retrieve user_id and group_id
    // let user_id: string | null = searchParams.get("user_id");
    // let group_id: string | null = searchParams.get("group_id");
    // TEST CASES
    // 1. USER WITHOUT POI AND PROPERTIES
    // let user_id: string | null = "54c42037-3403-4d21-9320-aa97188fece2";
    // let group_id: string | null = "";

    // 2. USER WITH POI AND PROPERTIES
    let user_id: string | null = "3926f78e-942f-4f10-a21f-0ee28b7b7767";
    let group_id: string | null = "1";

    // 3. USER WITH POI NO PROPERTIES
    // let user_id: string | null = "11e084ab-9aa5-4117-90b1-e234b8dae1a7";
    // let group_id: string | null = "3";

    // 4. USER WITH PROPERTIES NO POI
    // let user_id: string | null = "55d178e0-77bc-4f51-8c43-5b61c8713ca8";
    // let group_id: string | null = "5";

    // Validate user_id
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

    let recommendedProperties: any[] = [];

    // **If group_id is empty, return all properties**
    if (!group_id || group_id.trim() === "") {
      console.warn(
        "No group_id provided, user has no marked POI or properties. Returning all listings."
      );

      // Fetch all properties
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
      // **Convert group_id to number safely**
      const parsedGroupId = parseInt(group_id, 10);
      if (isNaN(parsedGroupId)) {
        console.error("Invalid group_id format, must be a number.");
        return NextResponse.json(
          { success: false, error: "Invalid group_id format." },
          { status: 400 }
        );
      }

      console.log("Calling stored procedure recommend_properties_for_user...");

      // **Call stored procedure for recommendations**
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

      if (!recommendedData || recommendedData.length === 0) {
        console.warn("⚠️ No recommendations found for this user.");
        return NextResponse.json({
          success: true,
          recommended_properties: [],
          message: "No recommendations found",
        });
      }

      // **Extract property IDs from recommendation results**
      const propertyIds: number[] = recommendedData.map(
        (item: Recommendation) => item.property_id
      );

      // **Fetch complete property details**
      const { data: propertyDetails, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .in("property_id", propertyIds);

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

      // **Merge recommendation scores into property details**
      recommendedProperties = recommendedData.map(
        (recommendation: Recommendation) => {
          const property = propertyDetails.find(
            (p: Property) => p.property_id === recommendation.property_id
          );
          return {
            ...property,
            final_score: recommendation.final_score,
          };
        }
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
