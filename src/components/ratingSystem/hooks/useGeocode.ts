import { useEffect, useState } from "react";
import { getLatLng } from "@/components/ratingSystem/lib/geocoding";
import { useLocationStore } from "@/components/ratingSystem/store/locationStore";
import propertiesData from "@/components/ratingSystem/mockData//property.json";
import poisData from "@/components/ratingSystem/mockData/poi-u1.json";

export function useGeocodeData() {
  const { setProperties, setPOIs } = useLocationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGeocodes() {
      setLoading(true);

      // 处理房源
      const updatedProperties = await Promise.all(
        propertiesData.map(async (property) => {
          const coords = await getLatLng(property.address);
          return { ...property, location: coords || { lat: 0, lng: 0 } };
        })
      );

      // 处理 POI
      const updatedPOIs = await Promise.all(
        poisData.map(async (poi) => {
          const coords = await getLatLng(poi.address);
          return { ...poi, location: coords || { lat: 0, lng: 0 } };
        })
      );

      setProperties(updatedProperties);
      setPOIs(updatedPOIs);
      setLoading(false);
    }

    fetchGeocodes();
  }, []);

  return { loading };
}
