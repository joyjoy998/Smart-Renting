import { useRatingStore } from "../store/ratingStore";

interface Property {
  property_property_id: string;
  address: string;
}

interface POI {
  poi_id: string;
  address: string;
}

type TravelMode = "WALKING" | "DRIVING" | "TRANSIT";

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

  if (!travelMode || !(travelMode in google.maps.TravelMode)) {
    console.error("Invalid travelMode value: ", travelMode);
    return;
  }

  const distanceScores: Record<string, number> = {};
  const travelTimes: Record<string, number> = {};
  const distances: Record<string, number> = {};

  // 获取 Google Maps Distance Matrix Service
  const service = new google.maps.DistanceMatrixService();

  const origins = properties.map((p) => p.address);
  const destinations = [selectedPOI.address];

  service.getDistanceMatrix(
    {
      origins,
      destinations,
      travelMode:
        google.maps.TravelMode[
          travelMode as keyof typeof google.maps.TravelMode
        ],
      unitSystem: google.maps.UnitSystem.METRIC,
    },
    (response, status) => {
      if (status !== "OK") {
        console.error("Error fetching distance matrix:", status);
        return;
      }

      properties.forEach((property, index) => {
        const element = response.rows[index].elements[0];

        if (element.status === "OK") {
          const distanceInKm = element.distance.value / 1000;
          const durationInMin = element.duration.value / 60;

          distances[property.property_property_id] = distanceInKm;
          travelTimes[property.property_property_id] = durationInMin;
        } else {
          console.warn(`No travel data for ${property.property_property_id}`);
          distances[property.property_property_id] = 9999;
          travelTimes[property.property_property_id] = 9999;
        }
      });

      // 计算最大行程时间（用于归一化）
      const maxTime = Math.max(...Object.values(travelTimes), 1);
      for (const propertyId in travelTimes) {
        distanceScores[propertyId] = 1 - travelTimes[propertyId] / maxTime;
      }

      setDistanceScores(distanceScores);
      setTravelTimes(travelTimes);
      setDistances(distances);
    }
  );
}
