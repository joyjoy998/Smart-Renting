"client";
import { useEffect, useMemo, useState } from "react";
import { AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import { UserLocationMarker } from "./UserLocationMarker";
import PropertyInfoWindow from "@/components/infoWindow/InfoWindow";
import useMapStore from "@/stores/useMapStore";
import useSavedDataStore from "@/stores/useSavedData";
import { House } from "lucide-react";
import { getPlaceDetail, usePlacesService } from "@/hooks/map/usePlacesService";
import { geocode, useGeocoder } from "@/hooks/map/useGeocoder";
import PropertyMarker from "./PropertyMarker";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import HouseIcon from "@mui/icons-material/House";
import { blue, green, red } from "@mui/material/colors";
import { Badge, Popover, Tooltip } from "@mui/material";
export type PropertyInfo =
  | (google.maps.places.PlaceResult & {
      image?: string;
      address?: string;

      savedPoi: any;
      savedProperty: any;
      placeId?: string;
    })
  | null;
export function MapContent() {
  const map = useMap();
  const placesSerivce = usePlacesService();
  const gecoder = useGeocoder();
  const currentInfoWindow = useMapStore.use.currentInfoWindow();
  const currentGeometry = useMapStore.use.currentGeometry();
  const clearCurrentInfo = useMapStore.use.clearCurrentInfo();
  const savedPois = useSavedDataStore.use.savedPois();
  const savedProperties = useSavedDataStore.use.savedProperties();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();

  const [userLocation, setUserLocation] = useState(MAPS_CONFIG.defaultCenter);

  const [dataFromApi, setDataFromApi] = useState<any>({});
  const currentPropertyData: PropertyInfo = useMemo(() => {
    if (!currentInfoWindow) {
      return null;
    }
    console.log("currentInfoWindow===========", currentInfoWindow);
    const currentPlaceId = currentInfoWindow?.place_id;
    const matchedPoi = savedPois?.find(
      (poi) => poi.place_id === currentPlaceId
    );
    const matchedProperty = savedProperties?.find(
      (property) => property.place_id === currentPlaceId
    );

    return {
      ...currentInfoWindow,
      image: currentInfoWindow?.photos?.[0]?.getUrl() || "",
      address: currentInfoWindow?.formatted_address,
      isSavedPoi: !!matchedPoi,
      isSavedProperty: !!matchedProperty,
      savedPoi: matchedPoi,
      savedProperty: matchedProperty,
      placeId: currentInfoWindow.place_id,
    };
  }, [currentInfoWindow, savedPois, savedProperties]);

  const properties = [
    {
      id: "ChIJwRwoOAAPE2sRQJjb0-BQKms111",
      position: { lat: -34.397, lng: 150.644 },
      price: "260",
    },
    {
      id: "ChIJwRwoOAAPE2sRQJjb0-BQKms",
      position: { lat: -33.8688, lng: 151.2093 },
      price: "260",
    },
  ];
  const createPriceMarker = (price: string) => {
    const svg = `
      <svg width="90" height="50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 45 L30 35 H70 Q85 35 85 20 Q85 5 70 5 H20 Q5 5 5 20 Q5 35 20 35 Z"
          fill="white" stroke="#ccc" stroke-width="2"/>
        <text x="50%" y="55%" font-size="16" font-family="Arial" fill="black" text-anchor="middle" dominant-baseline="middle">
          $${price}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
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
  console.log("currentGeometry====", currentGeometry);
  return (
    <>
      <UserLocationMarker position={userLocation} />

      {currentGeometry && <AdvancedMarker position={currentGeometry} />}

      {savedProperties?.map((property, index) => (
        <PropertyMarker property={property}>
          <Badge
            badgeContent={property.weekly_rent}
            color="primary"
            max={10000}
          >
            <HouseIcon
              id={property.place_id}
              sx={{ color: blue[400] }}
              fontSize="large"
            />
          </Badge>
        </PropertyMarker>
      ))}
      {savedPois?.map((property, index) => (
        <PropertyMarker property={property}>
          <FavoriteRoundedIcon sx={{ color: red[400] }} fontSize="large" />
        </PropertyMarker>
      ))}

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
