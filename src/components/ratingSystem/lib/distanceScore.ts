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

declare global {
  interface Window {
    google: typeof google;
  }
}

function isGoogleMapsLoaded(): boolean {
  return !!(
    typeof window !== "undefined" &&
    window.google &&
    window.google.maps
  );
}

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

  if (!isGoogleMapsLoaded()) {
    console.error("Google Maps API is not loaded");
    return;
  }

  const validTravelModes = ["WALKING", "DRIVING", "TRANSIT"];
  if (!validTravelModes.includes(travelMode)) {
    console.error("Invalid travelMode value: ", travelMode);
    return;
  }

  const distanceScores: Record<string, number> = {};
  const travelTimes: Record<string, number> = {};
  const distances: Record<string, number> = {};

  try {
    const service = new window.google.maps.DistanceMatrixService();
    const origins = properties.map((p) => p.address);
    const destinations = [selectedPOI.address];

    const matrixResponse =
      await new Promise<google.maps.DistanceMatrixResponse>(
        (resolve, reject) => {
          service.getDistanceMatrix(
            {
              origins,
              destinations,
              travelMode: travelMode as google.maps.TravelMode,
              unitSystem: google.maps.UnitSystem.METRIC,
            },
            (response, status) => {
              if (status === "OK" && response) {
                resolve(response);
              } else {
                reject(new Error(`Distance Matrix failed: ${status}`));
              }
            }
          );
        }
      );

    if (!matrixResponse || !matrixResponse.rows) {
      throw new Error("Invalid response from Distance Matrix");
    }

    properties.forEach((property, index) => {
      const row = matrixResponse.rows[index];
      if (!row || !row.elements || !row.elements[0]) {
        console.warn(`No data for property ${property.property_property_id}`);
        distances[property.property_property_id] = 9999;
        travelTimes[property.property_property_id] = 9999;
        return;
      }

      const element = row.elements[0];

      if (element.status === "OK" && element.distance && element.duration) {
        const distanceInKm = element.distance.value / 1000;
        const durationInSeconds = element.duration.value;

        distances[property.property_property_id] = distanceInKm;
        travelTimes[property.property_property_id] = durationInSeconds;
      } else {
        console.warn(
          `Invalid travel data for ${property.property_property_id}: ${element.status}`
        );
        distances[property.property_property_id] = 9999;
        travelTimes[property.property_property_id] = 9999;
      }
    });

    // 确保至少有一个有效的时间值
    const validTimes = Object.values(travelTimes).filter(
      (time) => time !== 9999
    );
    if (validTimes.length === 0) {
      throw new Error("No valid travel times calculated");
    }

    const maxTime = Math.max(...validTimes, 1);
    const minTime = Math.min(...validTimes);

    if (maxTime === minTime) {
      properties.forEach((property) => {
        distanceScores[property.property_property_id] = 1;
      });
    } else {
      properties.forEach((property) => {
        const propertyId = property.property_property_id;
        const time = travelTimes[propertyId];

        if (time === 9999) {
          distanceScores[propertyId] = 0; // 无效路线得分为0
        } else {
          distanceScores[propertyId] =
            1 - (time - minTime) / (maxTime - minTime);
        }
      });
    }

    setDistanceScores(distanceScores);
    setTravelTimes(travelTimes);
    setDistances(distances);
  } catch (error) {
    console.error("Error calculating distance scores:", error);

    // 设置默认值
    properties.forEach((property) => {
      const propertyId = property.property_property_id;
      distanceScores[propertyId] = 0;
      travelTimes[propertyId] = 9999;
      distances[propertyId] = 9999;
    });

    setDistanceScores(distanceScores);
    setTravelTimes(travelTimes);
    setDistances(distances);
  }
}
