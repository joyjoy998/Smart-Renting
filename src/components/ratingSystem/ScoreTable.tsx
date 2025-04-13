import React, { useEffect, useMemo, useState } from "react";
import { useRatingStore } from "@/stores/ratingStore";
import { calculateDistanceScore } from "./lib/distanceScore";
import { calculatePriceScore } from "./lib/priceScore";
import { loadSafetyScores } from "./lib/safetyScore";
import { calculateAmenitiesScore } from "./lib/amenitiesScore";
import { calculateTotalScore } from "./lib/finalScore";
import POISelector from "./POISelector";
import TravelModeSelector from "./TravelModeSelector";
import useMapStore from "@/stores/useMapStore";
import { useGroupSelectorStore } from "@/stores/useGroupSelectorStore";
import { getPlaceDetail, usePlacesService } from "@/hooks/map/usePlacesService";
import { geocode, useGeocoder } from "@/hooks/map/useGeocoder";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const ScoreTable = () => {
  const [showDetails, setShowDetails] = useState<
    Record<string | number, boolean>
  >({});

  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();
  const { setOpen: setGroupSelectorOpen } = useGroupSelectorStore();
  const placesService = usePlacesService();
  const geocoder = useGeocoder();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    setOpen: setRatingOpen,
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

  const formatAmenitiesCounts = (propertyId: string | number) => {
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

  // display the detailed number of amenities of each category
  const getDetailedTooltip = (propertyId: string | number) => {
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

  // rank the properties descending
  const sortedProperties = useMemo(() => {
    if (Object.keys(totalScores).length === 0) return properties;

    return [...properties].sort((a, b) => {
      const scoreA = totalScores[a.property_property_id] || 0;
      const scoreB = totalScores[b.property_property_id] || 0;
      return scoreB - scoreA;
    });
  }, [properties, totalScores]);

  const toggleDetails = (propertyId: string | number) => {
    setShowDetails((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  const handleRowClick = async (property: any) => {
    if (property && property.latitude && property.longitude) {
      const latLng = {
        lat: property.latitude,
        lng: property.longitude,
      };
      setCurrentGeometry(latLng);
      if (property.place_id) {
        if (placesService) {
          const detail = await getPlaceDetail(placesService, property.place_id);
          setCurrentInfoWindow(detail);
        }
      } else {
        if (geocoder && placesService) {
          const result = await geocode(geocoder, latLng);
          if (result) {
            const detail = await getPlaceDetail(placesService, result.place_id);
            setCurrentInfoWindow(detail);
          }
        }
      }

      setRatingOpen(false);
      setGroupSelectorOpen(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse table-fixed",
          isDark ? "border border-gray-700" : "border border-gray-300"
        )}
      >
        <thead>
          <tr
            className={cn(isDark ? "bg-gray-800 text-gray-100" : "bg-gray-200")}
          >
            <th className="p-2 w-1/16">🏠 Property</th>
            <th className="p-2 w-2/16">📍 Location</th>
            <th className="p-2 w-1/16">💰 Price</th>
            <th className="p-2 w-2/16">🏚️ Layout</th>
            <th className="p-2 w-4/16 relative">
              🚶 Distance
              <div className="mt-1 w-full truncate">
                <POISelector />
              </div>
            </th>
            <th className="p-2 w-2/16 relative">
              🕒 Travel Time
              <div className="mt-1 w-full truncate">
                <TravelModeSelector />
              </div>
            </th>
            <th className="p-2 w-2/16">🏪 Amenities</th>
            <th className="p-2 w-2/16">⭐ Total Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedProperties.map((property) => (
            <React.Fragment key={property.property_property_id}>
              <tr
                className={cn(
                  "border-t cursor-pointer",
                  isDark
                    ? "hover:bg-gray-700 border-gray-700 text-gray-200"
                    : "hover:bg-gray-50 border-gray-300"
                )}
                onClick={() => handleRowClick(property)}
              >
                <td className="p-2">{property.property_property_id}</td>
                <td className="p-2 truncate" title={property.address}>
                  {property.address}
                </td>
                <td className="p-2">${property.weeklyRent}/wk</td>
                <td className="p-2">
                  🛏️ {property.bedrooms} 🚽 {property.bathrooms} 🚘{" "}
                  {property.parkingSpaces}
                </td>
                <td className="p-2">
                  {selectedPOI
                    ? `${
                        distances[property.property_property_id]?.toFixed(2) ||
                        "N/A"
                      } km`
                    : "Select POI"}
                </td>
                <td className="p-2">
                  {selectedPOI &&
                  travelTimes[property.property_property_id] !== undefined
                    ? `${Math.floor(
                        travelTimes[property.property_property_id] / 60
                      )} min ${Math.round(
                        travelTimes[property.property_property_id] % 60
                      )} s`
                    : "N/A"}
                </td>
                <td
                  className="p-2 truncate"
                  title={getDetailedTooltip(property.property_property_id)}
                >
                  {formatAmenitiesCounts(property.property_property_id)}
                </td>
                <td className="p-2">
                  <div className="flex justify-between items-center">
                    <span
                      className={cn(
                        "text-lg",
                        isDark && "text-white font-semibold"
                      )}
                    >
                      {totalScores[property.property_property_id]?.toFixed(1) ||
                        "N/A"}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDetails(property.property_property_id);
                      }}
                      className={cn(
                        "text-xs rounded px-2 py-1 inline-block",
                        isDark
                          ? "text-blue-300 border border-blue-500 hover:bg-blue-900/30"
                          : "text-blue-500 border border-blue-300 hover:bg-blue-50"
                      )}
                    >
                      {showDetails[property.property_property_id]
                        ? "Hide"
                        : "Details"}
                    </button>
                  </div>
                </td>
              </tr>
              {showDetails[property.property_property_id] && (
                <tr className={isDark ? "bg-gray-800" : "bg-gray-100"}>
                  <td colSpan={8} className="p-2">
                    <div className="grid grid-cols-4 gap-4 p-2">
                      <div
                        className={cn(
                          "flex flex-col items-center border rounded p-2",
                          isDark
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        )}
                      >
                        <div
                          className={cn(
                            "font-semibold",
                            isDark && "text-gray-200"
                          )}
                        >
                          🛡 Safety
                        </div>
                        <div
                          className={cn(
                            "text-lg font-bold",
                            isDark && "text-white"
                          )}
                        >
                          {safetyScores[property.property_property_id]?.toFixed(
                            1
                          ) || "N/A"}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center border rounded p-2",
                          isDark
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        )}
                      >
                        <div
                          className={cn(
                            "font-semibold",
                            isDark && "text-gray-200"
                          )}
                        >
                          📏 Distance
                        </div>
                        <div
                          className={cn(
                            "text-lg font-bold",
                            isDark && "text-white"
                          )}
                        >
                          {distanceScores[
                            property.property_property_id
                          ]?.toFixed(1) || "N/A"}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center border rounded p-2",
                          isDark
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        )}
                      >
                        <div
                          className={cn(
                            "font-semibold",
                            isDark && "text-gray-200"
                          )}
                        >
                          💰 Price
                        </div>
                        <div
                          className={cn(
                            "text-lg font-bold",
                            isDark && "text-white"
                          )}
                        >
                          {priceScores[property.property_property_id]?.toFixed(
                            1
                          ) || "N/A"}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center border rounded p-2",
                          isDark
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        )}
                      >
                        <div
                          className={cn(
                            "font-semibold",
                            isDark && "text-gray-200"
                          )}
                        >
                          🏪 Amenities
                        </div>
                        <div
                          className={cn(
                            "text-lg font-bold",
                            isDark && "text-white"
                          )}
                        >
                          {amenitiesScores[
                            property.property_property_id
                          ]?.toFixed(1) || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreTable;
