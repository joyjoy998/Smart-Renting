/*
this file is used to update lat&lng data of properties

to update lat&lng data for new properties 
run "npm run geocode" in your terminal
*/

import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runGeocode() {
  try {
    console.log("Starting geocoding process...");
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    const response = await fetch(`${BASE_URL}/api/getPropertyGeo`);

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    const result = (await response.json()) as Record<string, any>;

    if (result.message === "No properties need geocoding") {
      console.log(
        "No properties need geocoding. All properties already have latitude and longitude."
      );
      return;
    }

    console.log("\nGeocoding process completed:");
    console.log(`Total properties: ${result.total}`);
    console.log(`Successfully geocoded: ${result.success}`);
    console.log(`Failed: ${result.error}`);

    if (result.resultsFile) {
      console.log(`Detailed results saved to: ${result.resultsFile}`);
    }
  } catch (error) {
    console.error("Error running geocoding process:", (error as Error).message);
    process.exit(1);
  }
}

runGeocode();
