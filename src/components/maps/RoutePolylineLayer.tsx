"use client";

import { useMap, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { useRatingStore } from "@/stores/ratingStore";
import { useEffect, useRef } from "react";
import { handleChangeTravelMode } from "@/lib/routeDisplayHelpers";

export default function RoutePolylineLayer() {
  const getModeIcon = (mode: "DRIVING" | "WALKING" | "TRANSIT") => {
    switch (mode) {
      case "WALKING":
        return "🚶";
      case "DRIVING":
        return "🚗";
      case "TRANSIT":
        return "🚌";
      default:
        return "🚗";
    }
  };

  const map = useMap();
  const {
    selectedPropertyForRoute,
    pois,
    routesToPOIs,
    currentGroup,
    travelMode,
  } = useRatingStore();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    // Clear existing polylines
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    if (!map || !selectedPropertyForRoute || !routesToPOIs.length) return;

    // Create new polylines
    routesToPOIs.forEach((route) => {
      const polyline = new google.maps.Polyline({
        path: route.polylinePath,
        strokeColor: "#3367D6",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map,
      });
      polylinesRef.current.push(polyline);
    });

    return () => {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    };
  }, [map, selectedPropertyForRoute, routesToPOIs]);

  if (!map || !selectedPropertyForRoute || !routesToPOIs.length) return null;

  console.log(routesToPOIs);

  return (
    <>
      {/* render origin property marker */}
      <Marker
        position={{
          lat: selectedPropertyForRoute.latitude,
          lng: selectedPropertyForRoute.longitude,
        }}
        title="Selected Property"
        key="selected-property-marker"
      />

      {/* render destination POI marker */}
      {routesToPOIs.map((route) => {
        const poi = pois.find((p) => p.poi_id === route.poiId);
        if (!poi || !poi.latitude || !poi.longitude || !route.polylinePath)
          return null;

        const midIndex = Math.floor(route.polylinePath.length / 2);
        const midPoint = route.polylinePath[midIndex];

        return (
          <>
            <InfoWindow
              position={{ lat: poi.latitude, lng: poi.longitude }}
              pixelOffset={[0, -20]}
              key={`info-${route.poiId}`}
            >
              <div className="text-xs rounded-md text-gray-700 w-35">
                <div className="flex flex-col items-center">
                  <span className="font-medium">{poi.name}</span>
                  <span className="font-medium">
                    {getModeIcon(travelMode)} {route.durationText} /{" "}
                    {route.distanceText}
                  </span>
                  <span className="flex gap-1 mt-1">
                    {["WALKING", "DRIVING", "TRANSIT"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleChangeTravelMode(mode as any)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          travelMode === mode
                            ? "bg-blue-100 text-blue-600 border-blue-300"
                            : "bg-white text-gray-500 border-gray-200"
                        } hover:bg-blue-50`}
                      >
                        {getModeIcon(mode as any)}
                      </button>
                    ))}
                  </span>
                </div>
              </div>
            </InfoWindow>
          </>
        );
      })}
    </>
  );
}
