import React, { useEffect } from "react";
import { useRatingStore } from "./store/ratingStore";
import { calculateDistanceScore } from "./lib/distanceScore";
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
  } = useRatingStore();

  useEffect(() => {
    if (selectedPOI && properties.length > 0) {
      calculateDistanceScore(selectedPOI, travelMode, properties);
    }
  }, [selectedPOI, travelMode, properties]);

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
            <th className="p-2">🛡 Safety</th>
            <th className="p-2">⭐ Total Score</th>
            <th className="p-2">📏 Distance Score</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.property_property_id} className="border-t">
              <td className="p-2">🏠 {property.property_property_id}</td>
              <td className="p-2">📍 {property.address}</td>
              <td className="p-2">💰 {property.weeklyRent}/week</td>
              <th className="p-2">
                🛏️{property.bedrooms} 🚽{property.bathrooms} 🚘
                {property.parkingSpaces}
              </th>
              <td className="p-2">
                {selectedPOI
                  ? `🚶 ${
                      distances[property.property_property_id]?.toFixed(2) ||
                      "N/A"
                    } km`
                  : "📍 Select a POI"}
              </td>
              <td className="p-2">
                {selectedPOI
                  ? `🕒 ${
                      travelTimes[property.property_property_id]?.toFixed(2) ||
                      "N/A"
                    } min`
                  : "🕒 Select a POI"}
              </td>
              <td className="p-2">🏪 Dynamic Amenities</td>
              <td className="p-2">🛡 Dynamic Safety Score</td>
              <td className="p-2 font-semibold">⭐ Dynamic Total Score</td>
              <td className="p-2">
                📏{" "}
                {distanceScores[property.property_property_id]?.toFixed(2) ||
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
