// just to test read and write permissions for table properties in supabase
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

async function testSupabaseReadWrite() {
  console.log("Starting Supabase read-write test...");

  // 获取环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Supabase configuration missing");
    console.error(
      "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Role Key: ${supabaseServiceKey.substring(0, 5)}...`);

  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 步骤 1: 读取一条记录
    console.log("\nSTEP 1: Reading a record from properties table...");
    const { data: property, error: readError } = await supabase
      .from("properties")
      .select("*")
      .limit(1)
      .single();

    if (readError) {
      console.error("Error reading data:", readError);
      process.exit(1);
    }

    if (!property) {
      console.error("No records found in properties table");
      process.exit(1);
    }

    console.log(`Successfully read property ID: ${property.property_id}`);
    console.log("Current data:", JSON.stringify(property, null, 2));

    let fieldToModify = "parking_spaces";

    const originalValue = property[fieldToModify];
    const newValue =
      typeof originalValue === "number"
        ? originalValue + 1
        : originalValue === null
        ? 1
        : originalValue;

    console.log(
      `\nWill modify field '${fieldToModify}' from '${originalValue}' to '${newValue}'`
    );

    console.log(`\nSTEP 2: Modifying property ID: ${property.property_id}...`);
    const { error: updateError } = await supabase
      .from("properties")
      .update({ [fieldToModify]: newValue })
      .eq("property_id", property.property_id);

    if (updateError) {
      console.error("Error updating data:", updateError);
      process.exit(1);
    }

    console.log(
      `Successfully updated field '${fieldToModify}' to '${newValue}'`
    );

    console.log(`\nSTEP 3: Verifying update...`);
    const { data: updatedProperty, error: verifyError } = await supabase
      .from("properties")
      .select("*")
      .eq("property_id", property.property_id)
      .single();

    if (verifyError) {
      console.error("Error verifying update:", verifyError);
      process.exit(1);
    }

    console.log(
      `Verification: field '${fieldToModify}' is now '${updatedProperty[fieldToModify]}'`
    );

    console.log(
      `\nSTEP 4: Reverting field back to original value '${originalValue}'...`
    );
    const { error: revertError } = await supabase
      .from("properties")
      .update({ [fieldToModify]: originalValue })
      .eq("property_id", property.property_id);

    if (revertError) {
      console.error("Error reverting data:", revertError);
      process.exit(1);
    }

    console.log(
      `Successfully reverted field '${fieldToModify}' back to '${originalValue}'`
    );

    console.log(`\nSTEP 5: Verifying reversion...`);
    const { data: revertedProperty, error: revertVerifyError } = await supabase
      .from("properties")
      .select("*")
      .eq("property_id", property.property_id)
      .single();

    if (revertVerifyError) {
      console.error("Error verifying reversion:", revertVerifyError);
      process.exit(1);
    }

    console.log(
      `Final verification: field '${fieldToModify}' is now back to '${revertedProperty[fieldToModify]}'`
    );

    console.log("\n✅ TEST COMPLETED SUCCESSFULLY");
    console.log(
      "This confirms that your Service Role Key has both read and write permissions for the properties table."
    );
  } catch (error) {
    console.error("Unexpected error during test:", error);
    process.exit(1);
  }
}

// 执行测试
testSupabaseReadWrite();
