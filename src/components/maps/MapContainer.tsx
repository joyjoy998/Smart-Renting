"use client";

import { Map } from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import {
  GOOGLE_DARK_MAPS_ID,
  GOOGLE_LIGHT_MAPS_ID,
} from "@/lib/constants/mapId";
import Loading from "@/components/ui/Loading";
import { useTheme } from "next-themes";
import { MapContent } from "./MapContent";
import { SettingsPopup } from "@/components/sidebar/SettingsPopup";
import { getPlaceDetail, usePlacesService } from "@/hooks/map/usePlacesService";
import useMapStore from "@/stores/useMapStore";
import { geocode, useGeocoder } from "@/hooks/map/useGeocoder";

export function MapContainer() {
  const placesSerivce = usePlacesService();
  const gecoder = useGeocoder();
  const { theme, resolvedTheme } = useTheme();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div
        id="map-guide-anchor"
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          right: 60,
          bottom: 60,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      <Map
        defaultCenter={MAPS_CONFIG.defaultCenter}
        defaultZoom={MAPS_CONFIG.defaultZoom}
        mapId={theme === "dark" ? GOOGLE_DARK_MAPS_ID : GOOGLE_LIGHT_MAPS_ID}
        onClick={async (event) => {
          console.log("event=========", event);
          if (event.detail?.placeId) {
            // Call event.stop() on the event to prevent the default info window from showing.
            event.stop();
            const detail = await getPlaceDetail(
              placesSerivce!,
              event.detail.placeId
            );
            setCurrentGeometry(event.detail.latLng);

            setCurrentInfoWindow(detail);
          } else {
            console.log(
              "getplaceDetail==================",
              event.detail.latLng && gecoder
            );
            if (event.detail.latLng && gecoder) {
              const result = await geocode(gecoder, event.detail.latLng);
              if (result) {
                const detail = await getPlaceDetail(
                  placesSerivce!,
                  result.place_id
                );
                console.log("detail==========", detail);
                setCurrentGeometry({
                  lat: result?.geometry?.location.lat()!,
                  lng: result?.geometry?.location.lng()!,
                });
                setCurrentInfoWindow(detail);
              }
            }
          }
        }}
        gestureHandling="greedy"
        fullscreenControl={false}
        keyboardShortcuts={false}
        zoomControl={true}
        mapTypeControl={false}
        scaleControl={true}
        streetViewControl={true}
        rotateControl={true}
        minZoom={0}
        maxZoom={30}
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
