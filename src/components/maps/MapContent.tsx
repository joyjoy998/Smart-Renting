import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import { UserLocationMarker } from "./UserLocationMarker";

export function MapContent() {
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
