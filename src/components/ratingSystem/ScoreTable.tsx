import React, { useEffect, useMemo, useState } from "react";
import { useRatingStore } from "@/stores/ratingStore";
import { calculateDistanceScore } from "./lib/distanceScore";
import { calculatePriceScore } from "./lib/priceScore";
import { loadSafetyScores } from "./lib/safetyScore";
import { calculateAmenitiesScore } from "./lib/amenitiesScore";
import { calculateTotalScore } from "./lib/finalScore";
import TravelModeSelector from "./TravelModeSelector";
import StarRating from "./StarRating";
import useMapStore from "@/stores/useMapStore";
import { useGroupSelectorStore } from "@/stores/useGroupSelectorStore";
import { getPlaceDetail, usePlacesService } from "@/hooks/map/usePlacesService";
import { geocode, useGeocoder } from "@/hooks/map/useGeocoder";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface PropertyToPOIDistance {
  property: any;
  poi: any;
  distance?: number;
  travelTime?: number;
}

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
    travelMode,
    distanceScores,
    travelTimes,
    distances,
    properties,
    pois,
    priceScores,
    safetyScores,
    amenitiesScores,
    amenitiesData,
    totalScores,
    weightConfig,
    loadData,
    setOpen: setRatingOpen,
  } = useRatingStore();

  useEffect(() => {
    // Load rating data if needed
    if (properties.length === 0 || pois.length === 0) {
      loadData();
    }

    const calculateAllDistanceScores = async () => {
      if (properties.length > 0 && pois.length > 0) {
        for (const poi of pois) {
          await calculateDistanceScore(poi, travelMode, properties);
        }
        await calculateTotalScore();
      }
    };

    calculateAllDistanceScores();
  }, [properties, pois, travelMode]);

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

    return (
      <>
        {counts.map((item, index) => (
          <React.Fragment key={index}>
            {item}
            {index < counts.length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
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
        await calculateTotalScore();
      }
    };
    calculateScores();
  }, [properties, weightConfig]);

  const sortedProperties = useMemo(() => {
    if (Object.keys(totalScores).length === 0) return properties;

    return [...properties].sort((a, b) => {
      const scoreA = totalScores[a.property_property_id] || 0;
      const scoreB = totalScores[b.property_property_id] || 0;
      return scoreB - scoreA;
    });
  }, [properties, totalScores]);

  const propertyPOICombinations = useMemo(() => {
    if (!sortedProperties.length || !pois.length) return [];

    const combinations: PropertyToPOIDistance[] = [];

    sortedProperties.forEach((property) => {
      pois.forEach((poi) => {
        const propertyId = property.property_property_id;
        const poiId = poi.poi_id;
        const distanceKey = `${propertyId}_${poiId}`;

        combinations.push({
          property,
          poi,
          distance: distances[distanceKey],
          travelTime: travelTimes[distanceKey],
        });
      });
    });

    return combinations;
  }, [sortedProperties, pois, distances, travelTimes]);

  const toggleDetails = (propertyId: string | number) => {
    setShowDetails((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  const getScoreDetailsTooltip = (propertyId: string | number) => {
    return `
      Safety: ${safetyScores[propertyId]?.toFixed(1) || "N/A"} 
      Distance: ${distanceScores[propertyId]?.toFixed(1) || "N/A"} 
      Price: ${priceScores[propertyId]?.toFixed(1) || "N/A"} 
      Amenities: ${amenitiesScores[propertyId]?.toFixed(1) || "N/A"}
    `;
  };

  const handlePropertyClick = async (property: any) => {
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

  const handlePOIClick = async (poi: any) => {
    if (poi && poi.latitude && poi.longitude) {
      const latLng = {
        lat: poi.latitude,
        lng: poi.longitude,
      };
      setCurrentGeometry(latLng);
      if (poi.place_id) {
        if (placesService) {
          const detail = await getPlaceDetail(placesService, poi.place_id);
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
    }
  };

  const formatTravelTime = (seconds?: number) => {
    if (seconds === undefined) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes} min ${remainingSeconds} s`;
  };

  const renderPropertyCell = (property: any, isFirstInGroup: boolean) => {
    if (!isFirstInGroup) return null;
    return (
      <td
        rowSpan={pois.length}
        className={cn(
          "p-2 border-r cursor-pointer",
          isDark ? "border-gray-700" : "border-gray-300"
        )}
        onClick={() => handlePropertyClick(property)}
      >
        <div className="flex flex-col items-start">
          <span
            className="text-sm truncate max-w-[150px]"
            title={property.address}
          >
            {property.address}
          </span>
        </div>
      </td>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse",
          isDark ? "border border-gray-700" : "border border-gray-300"
        )}
      >
        <thead>
          <tr
            className={cn(isDark ? "bg-gray-800 text-gray-100" : "bg-gray-200")}
          >
            <th className="p-2 w-1/16">🏠 Property</th>
            <th className="p-2 w-1/16">💰 Price</th>
            <th className="p-2 w-2/16">🏚️ Layout</th>
            <th className="p-2 w-2/16">
              🏪 Amenities
              <p className="text-xs">(counts within 3km)</p>
            </th>
            <th className="p-2 w-2/16">📍 POI</th>
            <th className="p-2 w-2/16">🚶 Distance</th>
            <th className="p-2 w-2/16 relative">
              🕒 Travel Time
              <div className="mt-1 w-full truncate">
                <TravelModeSelector />
              </div>
            </th>

            <th className="p-2 w-2/16">⭐ Score</th>
          </tr>
        </thead>
        <tbody>
          {propertyPOICombinations.map((combo, index) => {
            const property = combo.property;
            const poi = combo.poi;
            const propertyId = property.property_property_id;
            const poiId = poi.poi_id;
            const isFirstPOIForProperty = index % pois.length === 0;

            return (
              <tr
                key={`${propertyId}_${poiId}`}
                className={cn(
                  "border-t",
                  isFirstPOIForProperty ? "border-t-2 border-t-blue-500" : "",
                  isDark
                    ? "hover:bg-gray-700 border-gray-700 text-gray-200"
                    : "hover:bg-gray-50 border-gray-300"
                )}
              >
                {renderPropertyCell(property, isFirstPOIForProperty)}

                {isFirstPOIForProperty && (
                  <td
                    rowSpan={pois.length}
                    className={cn(
                      "p-2 border-r",
                      isDark ? "border-gray-700" : "border-gray-300"
                    )}
                  >
                    ${property.weeklyRent}/w
                  </td>
                )}

                {isFirstPOIForProperty && (
                  <td
                    rowSpan={pois.length}
                    className={cn(
                      "p-2 border-r",
                      isDark ? "border-gray-700" : "border-gray-300"
                    )}
                  >
                    🛏️ {property.bedrooms} <br />
                    🚽 {property.bathrooms}
                    <br /> 🚘 {property.parkingSpaces}
                  </td>
                )}

                {isFirstPOIForProperty && (
                  <td
                    rowSpan={pois.length}
                    className={cn(
                      "p-2 border-r",
                      isDark ? "border-gray-700" : "border-gray-300"
                    )}
                    title={getDetailedTooltip(propertyId)}
                  >
                    {formatAmenitiesCounts(propertyId)}
                  </td>
                )}

                <td
                  className={cn(
                    "p-2 border-r cursor-pointer",
                    isDark ? "border-gray-700" : "border-gray-300"
                  )}
                  onClick={() => handlePOIClick(poi)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{poi.name}</span>
                    <span className="text-xs text-gray-500">{poi.type}</span>
                  </div>
                </td>

                <td
                  className={cn(
                    "p-2 border-r",
                    isDark ? "border-gray-700" : "border-gray-300"
                  )}
                >
                  {combo.distance !== undefined
                    ? `${combo.distance.toFixed(2)} km`
                    : "N/A"}
                </td>

                <td
                  className={cn(
                    "p-2 border-r",
                    isDark ? "border-gray-700" : "border-gray-300"
                  )}
                >
                  {formatTravelTime(combo.travelTime)}
                </td>

                {isFirstPOIForProperty && (
                  <td
                    rowSpan={pois.length}
                    className={cn(
                      "p-2 relative",
                      isDark ? "border-gray-700" : "border-gray-300"
                    )}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <div
                          className={cn(
                            "text-lg font-bold",
                            isDark && "text-white"
                          )}
                        >
                          {totalScores[propertyId]?.toFixed(2) || "N/A"}
                        </div>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDetails(propertyId);
                            }}
                            className={cn(
                              "text-xs rounded px-2 py-1 inline-block",
                              isDark
                                ? "text-blue-300 border border-blue-500 hover:bg-blue-900/30"
                                : "text-blue-500 border border-blue-300 hover:bg-blue-50"
                            )}
                            title={getScoreDetailsTooltip(propertyId)}
                          >
                            {showDetails[propertyId] ? "Close" : "Details"}
                          </button>

                          {showDetails[propertyId] && (
                            <div
                              className={cn(
                                "absolute z-10 right-0 mt-1 p-2 rounded shadow-lg w-52",
                                isDark
                                  ? "bg-gray-800 border border-gray-700"
                                  : "bg-white border border-gray-200"
                              )}
                            >
                              <div className="space-y-2">
                                <div
                                  className={cn(
                                    "flex items-center justify-between p-1 rounded",
                                    isDark ? "bg-gray-700" : "bg-gray-100"
                                  )}
                                >
                                  <span>🛡 Safety:</span>
                                  <span className="font-medium">
                                    {safetyScores[propertyId]?.toFixed(2) ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "flex items-center justify-between p-1 rounded",
                                    isDark ? "bg-gray-700" : "bg-gray-100"
                                  )}
                                >
                                  <span>📏 Distance:</span>
                                  <span className="font-medium">
                                    {distanceScores[propertyId]?.toFixed(2) ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "flex items-center justify-between p-1 rounded",
                                    isDark ? "bg-gray-700" : "bg-gray-100"
                                  )}
                                >
                                  <span>💰 Price:</span>
                                  <span className="font-medium">
                                    {priceScores[propertyId]?.toFixed(2) ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "flex items-center justify-between p-1 rounded",
                                    isDark ? "bg-gray-700" : "bg-gray-100"
                                  )}
                                >
                                  <span>🏪 Amenities:</span>
                                  <span className="font-medium">
                                    {amenitiesScores[propertyId]?.toFixed(2) ||
                                      "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <StarRating totalScore={totalScores[propertyId]} />
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreTable;
