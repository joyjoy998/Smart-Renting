import { useRatingStore } from "@/stores/ratingStore";
import polyline from "@mapbox/polyline";

interface Property {
  property_property_id: string;
  group_id: number;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

export const handleShowRoutesToPOIs = async (property: Property) => {
  const { loadData, travelMode, setSelectedPropertyForRoute, setRoutesToPOIs } =
    useRatingStore.getState();

  try {
    const groupResponse = await fetch(
      `/api/getSavedGroupsByID?groupId=${property.group_id}`
    );

    if (!groupResponse.ok) {
      console.error("Failed to fetch group info for this property");
      return;
    }

    const groupDataResult = await groupResponse.json();
    const groupData = groupDataResult.data;

    if (!groupData?.pois || groupData.pois.length === 0) {
      alert("No POIs found in this group. Please add POIs first.");
      return;
    }

    const propertyAddress = `${property.street}, ${property.suburb}, ${property.state} ${property.postcode}`;
    if (!propertyAddress || propertyAddress.includes("undefined")) {
      console.error("Invalid property address");
      return;
    }

    await loadData(groupData);
    setSelectedPropertyForRoute(property);

    /*  console.log("🚀 Request payload:", {
      property: { address: propertyAddress },
      pois: groupData.pois.map((poi: any) => ({
        poi_id: poi.saved_poi_id.toString(),
        address: `${poi.street}, ${poi.suburb}, ${poi.state} ${poi.postcode}`,
      })),
      travelMode,
    }); */

    const routesResponse = await fetch("/api/getRouteToPOIs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        property: { address: propertyAddress },
        pois: groupData.pois.map((poi: any) => ({
          poi_id: poi.saved_poi_id.toString(),
          address: `${poi.street}, ${poi.suburb}, ${poi.state} ${poi.postcode}`,
        })),
        travelMode,
      }),
    });

    const routesResult = await routesResponse.json();
    console.log(routesResult);
    if (!routesResponse.ok || !routesResult.routes) {
      console.error("Failed to fetch routes to POIs", routesResult.error);
      return;
    }

    const decodedRoutes = routesResult.routes.map((route: any) => ({
      ...route,
      polylinePath: polyline
        .decode(route.polyline)
        .map(([lat, lng]: [number, number]) => ({ lat, lng })),
    }));

    setRoutesToPOIs(decodedRoutes);
  } catch (err) {
    console.error("handleShowRoutesToPOIsFromProperty error:", err);
  }
};

/* export const TestButton = async () => {
  const testProperty = {
    address: "1600 Amphitheatre Parkway, Mountain View, CA",
  };

  const testPOIs = [
    { poi_id: "1", address: "1 Infinite Loop, Cupertino, CA" },
    { poi_id: "2", address: "Apple Park Way, Cupertino, CA" },
  ];

  const travelMode = "DRIVING";

  const response = await fetch("/api/getRouteToPOIs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      property: testProperty,
      pois: testPOIs,
      travelMode,
    }),
  });

  const result = await response.json();
  console.log("Routes API result:", result);
};*/
