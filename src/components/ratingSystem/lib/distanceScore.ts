import { useRatingStore } from "../store/ratingStore";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const BASE_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";

interface Property {
  property_property_id: string;
  address: string;
}

interface POI {
  poi_id: string;
  address: string;
}

type TravelMode = "walking" | "driving" | "transit";

/**
 * 计算选定 POI 的行程时间和距离，并计算距离分数
 * @param selectedPOI 用户选择的 POI
 * @param travelMode 用户选择的交通方式（步行、驾车、公共交通）
 * @param properties 用户标记的房源列表
 */
export async function calculateDistanceScore(
  selectedPOI: POI,
  travelMode: TravelMode,
  properties: Property[]
) {
  const { setDistanceScores, setTravelTimes, setDistances } =
    useRatingStore.getState();

  if (!selectedPOI || properties.length === 0) {
    console.warn("No POI selected or no properties available.");
    return;
  }

  const distanceScores: Record<string, number> = {};
  const travelTimes: Record<string, number> = {};
  const distances: Record<string, number> = {};

  const poiAddress = selectedPOI.address;

  for (const property of properties) {
    const propertyAddress = property.address;
    const url = `${BASE_URL}?origins=${encodeURIComponent(
      propertyAddress
    )}&destinations=${encodeURIComponent(
      poiAddress
    )}&mode=${travelMode}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const distanceInMeters = data.rows[0].elements[0].distance.value;
        const durationInSeconds = data.rows[0].elements[0].duration.value;

        const distanceInKm = distanceInMeters / 1000; // 转换为公里
        const durationInMin = durationInSeconds / 60; // 转换为分钟

        distances[property.property_property_id] = distanceInKm;
        travelTimes[property.property_property_id] = durationInMin;
      } else {
        console.warn(`No travel data for ${property.property_property_id}`);
        distances[property.property_property_id] = 9999;
        travelTimes[property.property_property_id] = 9999;
      }
    } catch (error) {
      console.error("Error fetching travel time:", error);
      distances[property.property_property_id] = 9999;
      travelTimes[property.property_property_id] = 9999;
    }
  }

  // 计算最大行程时间（用于归一化）
  const maxTime = Math.max(...Object.values(travelTimes));
  for (const propertyId in travelTimes) {
    distanceScores[propertyId] = 1 - travelTimes[propertyId] / maxTime; // 归一化计算
  }

  setDistanceScores(distanceScores);
  setTravelTimes(travelTimes);
  setDistances(distances);
}
