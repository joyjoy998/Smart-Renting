"use client";

import { useMap, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { useRouteStore } from "@/stores/useRouteStore";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { handleChangeTravelMode } from "@/lib/routeDisplayHelpers";
import isEqual from "lodash.isequal";
import React from "react";

interface POI {
  poi_id: string;
  name: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  [key: string]: any;
}

interface RouteInfo {
  poiId: string;
  polylinePath: google.maps.LatLngLiteral[];
  durationText: string;
  distanceText: string;
  [key: string]: any;
}

const RoutePolylineLayer = React.memo(function RoutePolylineLayer() {
  const rawMap = useMap();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current && rawMap) {
      mapRef.current = rawMap;
      setMapReady(true);
    }
  }, [rawMap]);

  const selectedPropertyForRoute = useRouteStore(
    (state) => state.selectedPropertyForRoute
  );
  const pois = useRouteStore((state) => state.pois);
  const routesToPOIs = useRouteStore((state) => state.routesToPOIs);
  const travelMode = useRouteStore((state) => state.travelMode);
  const visiblePOIs = useRouteStore((state) => state.visiblePOIs);
  const togglePOIVisibility = useRouteStore(
    (state) => state.togglePOIVisibility
  );

  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const prevRoutesRef = useRef<RouteInfo[]>([]);
  const prevPropertyRef = useRef<typeof selectedPropertyForRoute | null>(null);
  const prevVisiblePOIsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!mapRef.current || !selectedPropertyForRoute || !routesToPOIs.length) {
      return;
    }

    const routesChanged = !isEqual(prevRoutesRef.current, routesToPOIs);
    const propertyChanged = !isEqual(
      prevPropertyRef.current,
      selectedPropertyForRoute
    );
    const visibleChanged = !isEqual(prevVisiblePOIsRef.current, visiblePOIs);

    if (!routesChanged && !propertyChanged && !visibleChanged) return;

    prevRoutesRef.current = routesToPOIs;
    prevPropertyRef.current = selectedPropertyForRoute;
    prevVisiblePOIsRef.current = visiblePOIs;

    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    routesToPOIs.forEach((route) => {
      if (!visiblePOIs.includes(route.poiId)) return;

      const polyline = new google.maps.Polyline({
        path: route.polylinePath,
        strokeColor: "#3367D6",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapRef.current!,
      });
      polylinesRef.current.push(polyline);
    });
  }, [selectedPropertyForRoute, routesToPOIs, visiblePOIs]);

  useEffect(() => {
    return () => {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
    };
  }, []);

  const getModeIcon = useCallback((mode: string) => {
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
  }, []);

  const handleTravelModeChange = useCallback((mode: string) => {
    handleChangeTravelMode(mode as any);
  }, []);

  const markerPosition = useMemo(
    () => ({
      lat: selectedPropertyForRoute?.latitude || 0,
      lng: selectedPropertyForRoute?.longitude || 0,
    }),
    [selectedPropertyForRoute?.latitude, selectedPropertyForRoute?.longitude]
  );

  const routePOIs = useMemo(() => {
    if (!routesToPOIs.length || !pois.length) return [];
    return routesToPOIs
      .map((route) => {
        const poi = pois.find(
          (p) => p.poi_id.toString() === route.poiId?.toString()
        );
        if (!poi || !route.polylinePath) return null;
        return { route, poi };
      })
      .filter(Boolean) as { route: RouteInfo; poi: POI }[];
  }, [routesToPOIs, pois]);

  if (
    !mapRef.current ||
    !selectedPropertyForRoute ||
    !routesToPOIs.length ||
    !routePOIs.length
  )
    return null;

  const InfoWindowContent = React.memo(
    ({ poi, route }: { poi: POI; route: RouteInfo }) => (
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
                onClick={() => handleTravelModeChange(mode)}
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  travelMode === mode
                    ? "bg-blue-100 text-blue-600 border-blue-300"
                    : "bg-white text-gray-500 border-gray-200"
                } hover:bg-blue-50`}
              >
                {getModeIcon(mode)}
              </button>
            ))}
          </span>
        </div>
      </div>
    )
  );

  return (
    <>
      <Marker
        position={markerPosition}
        title="Selected Property"
        key="selected-property-marker"
      />

      {routePOIs.map(({ route, poi }) => {
        if (!visiblePOIs.includes(route.poiId)) return null;

        return (
          <InfoWindow
            position={{ lat: poi.latitude, lng: poi.longitude }}
            key={`info-${route.poiId}`}
            onCloseClick={() => togglePOIVisibility(route.poiId)}
          >
            <InfoWindowContent poi={poi} route={route} />
          </InfoWindow>
        );
      })}
    </>
  );
});

export default RoutePolylineLayer;
