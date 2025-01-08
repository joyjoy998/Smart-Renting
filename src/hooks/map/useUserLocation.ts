import { useState, useEffect } from "react";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";

export function useUserLocation() {
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
          setLocation(MAPS_CONFIG.defaultCenter);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLocation(MAPS_CONFIG.defaultCenter);
    }
  }, []);

  return { location, error };
}
