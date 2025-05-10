"client";
import dynamic from "next/dynamic";
const RoutePolylineLayer = dynamic(
  () => import("@/components/maps/RoutePolylineLayer"),
  {
    ssr: false,
    loading: () => null,
  }
);

import { use, useEffect, useMemo, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import { UserLocationMarker } from "./UserLocationMarker";
import PropertyInfoWindow from "@/components/InfoWindow/InfoWindow";
import useMapStore from "@/stores/useMapStore";
import useSavedDataStore, { SavedPropertyProps } from "@/stores/useSavedData";
import PropertyMarker from "./PropertyMarker";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import HouseIcon from "@mui/icons-material/House";
import { blue, green, orange, red, yellow } from "@mui/material/colors";
import { Badge } from "@mui/material";
import { useMapLocationStore } from "@/stores/useMapLocationStore";

export type PropertyInfo =
  | (google.maps.places.PlaceResult & {
      image?: string;
      address?: string;
      savedPoi?: any;
      savedProperty?: SavedPropertyProps;
      placeId?: string;
      weekly_rent?: number;
    })
  | null;

export function MapContent() {
  const map = useMap();
  const { setMapLocation, mapLocation } = useMapLocationStore();
  const currentInfoWindow = useMapStore.use.currentInfoWindow();
  const currentGeometry = useMapStore.use.currentGeometry();
  const clearCurrentInfo = useMapStore.use.clearCurrentInfo();
  const savedPois = useSavedDataStore.use.savedPois();
  const savedProperties = useSavedDataStore.use.savedProperties();
  const properties = useSavedDataStore.use.properties();

  const allProperties = useMemo(() => {
    return [...(savedProperties || []), ...(properties || [])];
  }, [savedProperties, properties]); //combine all the properties

  const visibleProperties = useMemo(() => {
    if (map) {
      const bounds = map.getBounds();
      return bounds
        ? allProperties
            .filter((place) => {
              const lat = place.latitude;
              const lng = place.longitude;
              return bounds?.contains(new google.maps.LatLng(lat, lng));
            })
            ?.slice(0, 50)
        : allProperties?.slice(0, 100);
    }
  }, [mapLocation]);
  useEffect(() => {
    if (map) {
      const idleListener = map.addListener("idle", () => {
        const center = map.getCenter();
        // console.log("latitude=====", center?.lat());
        // console.log("longitude=====", center?.lng());
        if (center) {
          setMapLocation({ lat: center.lat(), lng: center.lng() });
        }
      });
      return () => {
        idleListener.remove();
      };
    }
  }, [map, setMapLocation]);

  useEffect(() => {
    if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        try {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (pos) {
            map.panTo(pos);
            map.setZoom(15);
          } else {
            map.panTo(MAPS_CONFIG.defaultCenter);
            map.setZoom(15);
          }
        } catch (err) {
          console.error("Error updating map with location:", err);
        }
      });
    }
  }, [map]);

  const currentPropertyData: PropertyInfo = useMemo(() => {
    if (!currentInfoWindow) {
      return null;
    }
    // console.log("currentInfoWindow===========", currentInfoWindow);
    const currentPlaceId = currentInfoWindow?.place_id;
    const matchedPoi = savedPois?.find(
      (poi) => poi.place_id === currentPlaceId
    );

    const matchedProperty = allProperties?.find(
      (property) => property.place_id === currentPlaceId
    );

    return {
      ...currentInfoWindow,
      place_id: currentInfoWindow.place_id,
      name: currentInfoWindow.name,
      geometry: currentInfoWindow.geometry,
      types: currentInfoWindow.types,
      utc_offset_minutes: currentInfoWindow.utc_offset_minutes,
      image:
        matchedProperty?.photo?.[0] ||
        currentInfoWindow?.photos?.[0]?.getUrl() ||
        "",
      address: currentInfoWindow?.formatted_address,
      isSavedPoi: !!matchedPoi,
      isSavedProperty: !!matchedProperty,
      savedPoi: matchedPoi,
      savedProperty: matchedProperty,
    };
  }, [currentInfoWindow, savedPois, savedProperties]);

  // console.log("currentGeometry====", currentGeometry);
  return (
    <>
      <RoutePolylineLayer />

      {currentGeometry &&
        typeof currentGeometry.lat === "number" &&
        typeof currentGeometry.lng === "number" && (
          <AdvancedMarker position={currentGeometry} />
        )}

      {visibleProperties?.map((property, index) => {
        const matchedSaved = savedProperties?.find(
          (saved) => saved.place_id === property.place_id
        );

        const weeklyRent =
          (matchedSaved as PropertyInfo)?.weekly_rent ??
          (property as { weekly_rent?: number })?.weekly_rent ??
          0;

        const isSaved = !!matchedSaved;

        return (
          <PropertyMarker
            property={property}
            key={`${property.place_id}-${index}`}
          >
            <Badge badgeContent={weeklyRent} color="primary" max={10000}>
              <HouseIcon
                id={property.place_id}
                sx={{ color: isSaved ? orange[400] : blue[400] }}
                fontSize="large"
              />
            </Badge>
          </PropertyMarker>
        );
      })}
      {savedPois?.map((property) => {
        return (
          <PropertyMarker property={property} key={property.saved_poi_id}>
            <FavoriteRoundedIcon sx={{ color: red[400] }} fontSize="large" />
          </PropertyMarker>
        );
      })}

      {!!currentPropertyData && !!currentGeometry && (
        <PropertyInfoWindow
          position={currentGeometry}
          onClose={() => {
            clearCurrentInfo();
          }}
          placeData={currentPropertyData}
        />
      )}
    </>
  );
}
