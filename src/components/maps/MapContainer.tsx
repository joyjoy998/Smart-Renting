"use client";

import { useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import {
  GOOGLE_DARK_MAPS_ID,
  GOOGLE_LIGHT_MAPS_ID,
} from "@/lib/constants/mapId";
import Loading from "@/components/ui/Loading";
import { useTheme } from "next-themes";
import { useUserLocation } from "@/hooks/map/useUserLocation";
import { MapContent } from "./MapContent";
import { SettingsPopup } from "@/components/sidebar/SettingsPopup";
import { usePlacesService } from "@/hooks/map/usePlacesService";
import MapSeachBox from "./MapSeachBox";

export function MapContainer() {
  const [isError, setIsError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const { location, error } = useUserLocation();


  if (!location && !error) {
    return <Loading />;
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Map
        defaultCenter={MAPS_CONFIG.defaultCenter}
        defaultZoom={MAPS_CONFIG.defaultZoom}
        mapId={theme === "dark" ? GOOGLE_DARK_MAPS_ID : GOOGLE_LIGHT_MAPS_ID}
        gestureHandling="greedy"
        fullscreenControl={false}
        keyboardShortcuts={false}
        zoomControl={true}
        mapTypeControl={false}
        scaleControl={true}
        streetViewControl={true}
        rotateControl={true}
        minZoom={3}
        maxZoom={18}
        restriction={{
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180,
          },
          strictBounds: true,
        }}
      >
        <MapContent />
        <SettingsPopup />
      </Map>
    </div>
  );
}
