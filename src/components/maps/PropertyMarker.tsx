import { AdvancedMarker } from "@vis.gl/react-google-maps";
import React, { PropsWithChildren } from "react";
import { PropertyInfo } from "./MapContent";
import { getPlaceDetail, usePlacesService } from "@/hooks/map/usePlacesService";
import useMapStore from "@/stores/useMapStore";
import { geocode, useGeocoder } from "@/hooks/map/useGeocoder";

type Props = {
  property: any;
};

const PropertyMarker: React.FC<PropsWithChildren<Props>> = (props) => {
  const placesSerivce = usePlacesService();
  const gecoder = useGeocoder();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();
  const property = props.property;

  if (
    !property ||
    typeof property.latitude !== "number" ||
    typeof property.longitude !== "number"
  ) {
    console.warn("Invalid property coordinates:", property);
    return null;
  }

  // @ts-ignore
  const latLng = { lat: property?.latitude, lng: property?.longitude };
  return (
    <AdvancedMarker
      key={`${property?.place_id}`}
      position={latLng}
      onClick={async (event) => {
        // @ts-ignore
        event.stop();
        if (property?.place_id) {
          // Call event.stop() on the event to prevent the default info window from showing.
          const detail = await getPlaceDetail(
            placesSerivce!,
            property.place_id
          );
          setCurrentGeometry(latLng);

          setCurrentInfoWindow(detail);
        } else {
          if (gecoder) {
            const result = await geocode(gecoder, latLng);
            if (result) {
              const detail = await getPlaceDetail(
                placesSerivce!,
                result.place_id
              );
              setCurrentGeometry(latLng);
              setCurrentInfoWindow(detail);
            }
          }
        }
      }}
    >
      {props.children}
    </AdvancedMarker>
  );
};

export default PropertyMarker;
