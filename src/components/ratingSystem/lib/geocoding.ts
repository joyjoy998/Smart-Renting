const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * 获取地址的经纬度
 * @param address - 需要转换的地址
 * @returns { lat: number, lng: number } or null
 */
export async function getLatLng(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const cacheKey = `geocode_${encodeURIComponent(address)}`;
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) return JSON.parse(cachedData);

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      localStorage.setItem(cacheKey, JSON.stringify(location));
      return location;
    } else {
      console.error("Geocoding failed:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return null;
  }
}
