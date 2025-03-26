"use client";

import { useMap, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { useRatingStore } from "@/stores/ratingStore";
import { useEffect, useRef } from "react";

export default function RoutePolylineLayer() {
  const map = useMap();
  const { selectedPropertyForRoute, pois, routesToPOIs, currentGroup } =
    useRatingStore();
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

  // 只显示当前组中的 POI
  const currentPOIs = pois.filter(
    (poi) => poi.user_id === currentGroup?.user_id
  );

  return (
    <>
      {/* 渲染起点 property marker */}
      <Marker
        position={{
          lat: selectedPropertyForRoute.latitude,
          lng: selectedPropertyForRoute.longitude,
        }}
        title="Selected Property"
      />

      {/* 渲染终点 POI marker */}
      {routesToPOIs.map((route) => {
        const poi = currentPOIs.find((p) => p.poi_id === route.poiId);
        if (!poi || !poi.latitude || !poi.longitude) return null;

        return (
          <>
            <Marker
              key={`marker-${route.poiId}`}
              position={{ lat: poi.latitude, lng: poi.longitude }}
              title={poi.name || "POI"}
            />

            <InfoWindow
              position={{ lat: poi.latitude, lng: poi.longitude }}
              pixelOffset={[0, -40]}
            >
              <div className="p-2 text-sm">
                <div>{poi.name}</div>
                <div>
                  {route.distanceText} / {route.durationText}
                </div>
              </div>
            </InfoWindow>
          </>
        );
      })}
    </>
  );
}
