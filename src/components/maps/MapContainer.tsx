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
import { usePlacesService } from "@/hooks/map/usePlacesService";
import { SearchBox } from "../home/SearchBox";

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
    <>
      {(isLoaded || isThemeChanging) && <Loading />}
      {isError ? (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">
              Map cannot be loaded right now, sorry.
            </h2>
            <p className="mt-2 text-gray-600">{isError}</p>
          </div>
        </div>
      ) : (
        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
          libraries={["places"]}
          onError={(error: unknown) => {
            if (error instanceof Error) {
              setIsError(error.message);
            } else {
              setIsError(String(error));
            }
            setIsLoaded(false);
          }}
          onLoad={() => setIsLoaded(false)}
        >
          <div style={{ width: "100%", height: "100vh", position: "relative" }}>
            <SearchBox />
            <Map
              defaultCenter={MAPS_CONFIG.defaultCenter}
              defaultZoom={MAPS_CONFIG.defaultZoom}
              mapId={
                theme === "dark" ? GOOGLE_DARK_MAPS_ID : GOOGLE_LIGHT_MAPS_ID
              }
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
            </Map>
          </div>
        </APIProvider>
      )}
    </>
  );
}
