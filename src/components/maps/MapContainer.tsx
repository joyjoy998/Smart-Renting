"use client";

import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import Loading from "@/components/loading/Loading";
import { useTheme } from "next-themes";

function useUserLocation() {
  const [location, setLocation] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(error.message);
          setLocation(MAPS_CONFIG.defaultCenter); // 失败时使用默认位置
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLocation(MAPS_CONFIG.defaultCenter);
    }
  }, []);

  return { location, error };
}

// UserLocationMarker component to handle the user's location marker
function UserLocationMarker({
  position,
}: {
  position: google.maps.LatLngLiteral;
}) {
  return (
    <AdvancedMarker position={position}>
      <Pin
        background={"#3B82F6"} // Tailwind blue-500
        borderColor={"#1D4ED8"} // Tailwind blue-700
        glyphColor={"#FFFFFF"}
        scale={1.2}
      />
    </AdvancedMarker>
  );
}

// MapContent component to handle map state and markers
function MapContent() {
  const map = useMap();
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>(
    MAPS_CONFIG.defaultCenter
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);

          // Update map center and zoom if map is available
          if (map) {
            map.panTo(pos);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [map]);

  return <UserLocationMarker position={userLocation} />;
}

export function MapContainer() {
  const [isError, setIsError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const { location, error } = useUserLocation();

  useEffect(() => {
    setIsThemeChanging(true);
    const timer = setTimeout(() => {
      setIsThemeChanging(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [theme, resolvedTheme]);

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
          <div style={{ width: "100%", height: "100vh" }}>
            <Map
              defaultCenter={MAPS_CONFIG.defaultCenter}
              defaultZoom={MAPS_CONFIG.defaultZoom}
              mapId={
                theme === "dark"
                  ? process.env.NEXT_PUBLIC_GOOGLE_DARK_MAPS_ID
                  : process.env.NEXT_PUBLIC_GOOGLE_LIGHT_MAPS_ID
              }
              gestureHandling="greedy"
              fullscreenControl={false}
              keyboardShortcuts={false}
              zoomControl={true}
              mapTypeControl={false}
              scaleControl={true}
              streetViewControl={true}
              rotateControl={true}
              minZoom={3} // Min zoom level
              maxZoom={18} // Max zoom level
              restriction={{
                latLngBounds: {
                  north: 85, // North Pole
                  south: -85, // South Pole
                  west: -180, // Westest
                  east: 180, // Eastest
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
