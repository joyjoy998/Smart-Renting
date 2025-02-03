const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * 获取两个坐标间的行程时间
 * @param origin - { lat, lng }
 * @param destination - { lat, lng }
 * @param mode - "walking" | "driving" | "transit"
 * @returns 出行时间（分钟）
 */
export async function getTravelTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: "driving" | "walking" | "transit"
): Promise<number | null> {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (
      data.status === "OK" &&
      data.rows.length > 0 &&
      data.rows[0].elements.length > 0
    ) {
      return data.rows[0].elements[0].duration.value / 60; // 返回分钟数
    } else {
      console.error("Distance Matrix API failed:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching travel time:", error);
    return null;
  }
}
