"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MAPS_CONFIG } from "@/lib/maps/constants";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

export default function MapComponent() {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds(
      MAPS_CONFIG.defaultCenter
    );
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Map cannot be loaded right now, sorry.
          </h2>
          <p className="mt-2 text-gray-600">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={MAPS_CONFIG.defaultCenter}
      zoom={MAPS_CONFIG.defaultZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={MAPS_CONFIG.mapOptions}
    >
      <Marker position={MAPS_CONFIG.defaultCenter} />
    </GoogleMap>
  );
}
