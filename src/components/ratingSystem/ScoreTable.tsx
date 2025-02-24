import React, { useEffect, useMemo } from "react";
import { useRatingStore } from "./store/ratingStore";
import { calculateDistanceScore } from "./lib/distanceScore";
import { calculatePriceScore } from "./lib/priceScore";
import { loadSafetyScores } from "./lib/safetyScore";
import { calculateAmenitiesScore } from "./lib/amenitiesScore";
import { calculateTotalScore } from "./lib/finalScore";
import POISelector from "./ui/POISelector";
import TravelModeSelector from "./ui/TravelModeSelector";
import DownloadReportButton from "./ui/DownloadReportButton";
import SaveReportButton from "./ui/SaveReportButton";

const ScoreTable = () => {
  const {
    selectedPOI,
    travelMode,
    distanceScores,
    travelTimes,
    distances,
    properties,
    priceScores,
    safetyScores,
    amenitiesScores,
    amenitiesData,
    totalScores,
    weightConfig,
  } = useRatingStore();

  // Distance Score
  useEffect(() => {
    if (selectedPOI && properties.length > 0) {
      calculateDistanceScore(selectedPOI, travelMode, properties);
    }
  }, [selectedPOI, travelMode, properties]);

  // Price Score
  useEffect(() => {
    if (properties.length > 0) {
      calculatePriceScore();
    }
  }, [properties]);

  //safety score
  useEffect(() => {
    if (properties.length > 0) {
      loadSafetyScores();
    }
  }, [properties]);

  //amenities score
  useEffect(() => {
    if (properties.length > 0) {
      calculateAmenitiesScore();
    }
  }, [properties]);

  // 格式化便利设施数量展示
  const formatAmenitiesCounts = (propertyId: string) => {
    if (!amenitiesData[propertyId]) return "Loading...";

    const counts = [
      `🏥 ${amenitiesData[propertyId].hospital?.count || 0}`,
      `🏪 ${amenitiesData[propertyId].convenienceStore?.count || 0}`,
      `🍽️ ${amenitiesData[propertyId].restaurant?.count || 0}`,
      `💪 ${amenitiesData[propertyId].gym?.count || 0}`,
      `🌳 ${amenitiesData[propertyId].park?.count || 0}`,
    ];

    return counts.join(" | ");
  };

  // 展示详细的便利设施数量的提示框
  const getDetailedTooltip = (propertyId: string) => {
    if (!amenitiesData[propertyId]) return "";

    return `
      Hospitals: ${amenitiesData[propertyId].hospital?.count || 0}
      Stores: ${amenitiesData[propertyId].convenienceStore?.count || 0}
      Restaurants: ${amenitiesData[propertyId].restaurant?.count || 0}
      Gyms: ${amenitiesData[propertyId].gym?.count || 0}
      Parks: ${amenitiesData[propertyId].park?.count || 0}
    `;
  };

  //final score
  useEffect(() => {
    const calculateScores = async () => {
      if (properties.length > 0) {
        await calculatePriceScore();
        await loadSafetyScores();
        await calculateAmenitiesScore();
        if (selectedPOI) {
          await calculateDistanceScore(selectedPOI, travelMode, properties);
        }

        await calculateTotalScore();
      }
    };
    calculateScores();
  }, [properties, selectedPOI, weightConfig]);

  // 按总分排序的属性列表
  const sortedProperties = useMemo(() => {
    if (Object.keys(totalScores).length === 0) return properties;

    return [...properties].sort((a, b) => {
      const scoreA = totalScores[a.property_property_id] || 0;
      const scoreB = totalScores[b.property_property_id] || 0;
      return scoreB - scoreA; // 从高到低排序
    });
  }, [properties, totalScores]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">🏠 Property</th>
            <th className="p-2">📍 Location</th>
            <th className="p-2">💰 Price</th>
            <th className="p-2">🏚️ Layout</th>
            <th className="p-2">
              🚶 Distance To
              <POISelector />
            </th>
            <th className="p-2">
              🕒 Travel Time <TravelModeSelector />
            </th>
            <th className="p-2">🏪 Amenities (3km)</th>
            <th className="p-2">🛡 Safety Score</th>
            <th className="p-2">⭐ Total Score</th>
            <th className="p-2">📏 Distance Score</th>
            <th className="p-2">💰 Price Score</th>
            <th className="p-2">🏪 Amenities Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedProperties.map((property) => (
            <tr key={property.property_property_id} className="border-t">
              <td className="p-2">{property.property_property_id}</td>
              <td className="p-2">{property.address}</td>
              <td className="p-2">{property.weeklyRent}/week</td>
              <th className="p-2">
                🛏️ {property.bedrooms} 🚽 {property.bathrooms} 🚘
                {property.parkingSpaces}
              </th>
              <td className="p-2">
                {selectedPOI
                  ? `${
                      distances[property.property_property_id]?.toFixed(2) ||
                      "N/A"
                    } km`
                  : "Please Select a POI"}
              </td>
              <td className="p-2">
                {selectedPOI
                  ? travelTimes[property.property_property_id] !== undefined
                    ? `${Math.floor(
                        travelTimes[property.property_property_id] / 60
                      )} min ${Math.round(
                        travelTimes[property.property_property_id] % 60
                      )} s`
                    : "N/A"
                  : ""}
              </td>

              <td
                className="p-2"
                title={getDetailedTooltip(property.property_property_id)}
              >
                {formatAmenitiesCounts(property.property_property_id)}
              </td>

              <td className="p-2">
                {safetyScores[property.property_property_id]?.toFixed(2) ||
                  "N/A"}
              </td>

              <td className="p-2 font-semibold">
                {totalScores[property.property_property_id]?.toFixed(2) ||
                  "N/A"}
              </td>

              <td className="p-2">
                {distanceScores[property.property_property_id]?.toFixed(2) ||
                  "N/A"}
              </td>

              <td className="p-2">
                {priceScores[property.property_property_id]?.toFixed(2) ||
                  "N/A"}
              </td>

              <td className="p-2">
                {amenitiesScores[property.property_property_id]?.toFixed(2) ||
                  "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <DownloadReportButton />
        <SaveReportButton />
      </div>
    </div>
  );
};

export default ScoreTable;
