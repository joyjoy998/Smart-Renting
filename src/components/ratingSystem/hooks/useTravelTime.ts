import { useEffect, useState } from "react";
import { getTravelTime } from "@/components/ratingSystem/lib/distanceMatrix";
import { useLocationStore } from "@/components/ratingSystem/store/locationStore";
import { useTravelModeStore } from "@/components/ratingSystem/store/useTravelModeStore";

// POI 类型权重配置
const POI_WEIGHTS: Record<string, number> = {
  work: 1.0,
  school: 1.0,
  grocery: 0.5,
  station: 0.5,
  gym: 0.5,
  hospital: 0.2,
  other: 0.2,
};

export function useTravelTime() {
  const { properties, pois } = useLocationStore();
  const { mode } = useTravelModeStore();
  const [travelTimes, setTravelTimes] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchTravelTimes() {
      if (pois.length === 0 || properties.length === 0) return;

      const times: Record<string, any> = {};
      const computedScores: Record<string, number> = {};

      for (const property of properties) {
        let totalScore = 0;

        for (const poi of pois) {
          const time = await getTravelTime(
            property.location,
            poi.location,
            mode
          );
          if (time !== null) {
            times[`${property.property_property_id}-${poi.poi_id}`] = {
              time,
              poiType: poi.type,
            };

            // 计算得分：时间越短得分越高，重要 POI 影响更大
            const weight = POI_WEIGHTS[poi.type] || 0.5;
            totalScore += (1 / time) * weight;
          }
        }

        computedScores[property.property_property_id] = totalScore;
      }

      setTravelTimes(times);
      setScores(computedScores);
    }

    fetchTravelTimes();
  }, [mode, properties, pois]);

  return { travelTimes, scores };
}
