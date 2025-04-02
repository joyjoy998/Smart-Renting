import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

export function usePlacesService() {
    const map = useMap();
    const placesLibrary = useMapsLibrary('places');
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    useEffect(() => {
      if (!placesLibrary || !map) return;
  
      setPlacesService(new placesLibrary.PlacesService(map));
    }, [placesLibrary, map]);
    
    return placesService;
  }


export function getPlaceDetail(service: google.maps.places.PlacesService, placeId): Promise<google.maps.places.PlaceResult> {
  return new Promise((res) => {
    service?.getDetails(
      {
        placeId,
      },
      (result: any) => {
        res(result);
      }
    );
  })
 
} 

export function nearbySearch(service: google.maps.places.PlacesService, options: google.maps.places.PlaceSearchRequest): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((res) => {
    service?.nearbySearch(
      options,
      (result: any) => {
        res(result);
      }
    );
  })
 
} 


