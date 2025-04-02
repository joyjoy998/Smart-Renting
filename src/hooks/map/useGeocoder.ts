import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { result } from 'lodash';
import React, { useEffect, useState } from 'react'

type Props = {}

export const useGeocoder = () => {
        const map = useMap();
    const placesLibrary = useMapsLibrary('places');
    const geocoding = useMapsLibrary('geocoding');
    const [gecoder, setGecoder] = useState<google.maps.Geocoder | null>(null);
    useEffect(() => {
      if (!geocoding || !map) return;
  
      setGecoder(new geocoding.Geocoder());
    }, [placesLibrary, map]);
    
    return gecoder;
}


export function geocode(gecoder: google.maps.Geocoder, latLng: any): Promise<google.maps.GeocoderResult|undefined> {
  if(!gecoder) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    gecoder?.geocode(
      { location: latLng },
      (results, status) => {
        if (status === "OK") {
          console.log("===========地址: ", results?.[0]);

          resolve(results?.[0]);
        } else {
          console.error(
            "===========Reverse Geocode 失败，原因: " + status
          );
          resolve(undefined);
        }
      }
    );
  })
}