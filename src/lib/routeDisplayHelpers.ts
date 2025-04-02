import { useRouteStore } from "@/stores/useRouteStore";
import { useGroupIdStore } from "@/stores/useGroupStore";
import * as polyline from "@mapbox/polyline";

interface Property {
  latitude: number;
  longitude: number;
  group_id?: string | number;
  [key: string]: any;
}

let lastLoadedGroupId: string | null = null;

export const handleShowRoutesToPOIs = async (property: Property) => {
  const {
    travelMode,
    setSelectedPropertyForRoute,
    setRoutesToPOIs,
    setPois,
    setVisiblePOIs,
  } = useRouteStore.getState();

  const groupId =
    property.group_id || useGroupIdStore.getState().currentGroupId;

  if (!groupId) {
    console.error("No group ID available");
    return;
  }

  try {
    const groupResponse = await fetch(
      `/api/getSavedGroupsByID?groupId=${groupId}`
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

    const mappedPois = groupData.pois.map((poi: any) => ({
      poi_id: poi.saved_poi_id.toString(),
      name: poi.name,
      latitude: poi.latitude,
      longitude: poi.longitude,
      place_id: poi.place_id,
    }));

    setPois(mappedPois);
    console.log("Mapped POIs:", mappedPois);
    setVisiblePOIs(mappedPois.map((poi) => poi.poi_id));
    console.log(
      "Set visible POIs:",
      mappedPois.map((poi) => poi.poi_id)
    );

    setSelectedPropertyForRoute({
      ...property,
      property_id:
        property.property_id || property.saved_property_id || "unknown",
      address: property.address || "",
      group_id: groupId.toString(),
    });

    const routesResponse = await fetch("/api/getRouteToPOIs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        property: {
          latitude: property.latitude,
          longitude: property.longitude,
        },
        pois: groupData.pois.map((poi: any) => ({
          poi_id: poi.saved_poi_id.toString(),
          latitude: poi.latitude,
          longitude: poi.longitude,
        })),
        travelMode,
      }),
    });

    const routesResult = await routesResponse.json();

    if (!routesResponse.ok || !routesResult.routes) {
      console.error("Failed to fetch routes to POIs", routesResult.error);
      return;
    }

    const decodedRoutes = routesResult.routes.map((route: any) => {
      const decoded = polyline.decode(route.polyline);
      const polylinePath = decoded.map((coords) => {
        if (coords.length >= 2) {
          return { lat: coords[0], lng: coords[1] };
        }
        return { lat: 0, lng: 0 };
      });

      return {
        ...route,
        poiId: (route.poiId || route.poi_id)?.toString(),
        polylinePath,
      };
    });

    setRoutesToPOIs(decodedRoutes);
    console.log("Decoded routes:", decodedRoutes);
  } catch (err) {
    console.error("handleShowRoutesToPOIs error:", err);
  }
};

export const handleChangeTravelMode = async (
  newMode: "DRIVING" | "WALKING" | "TRANSIT"
) => {
  const store = useRouteStore.getState();
  const selectedProperty = store.selectedPropertyForRoute;

  if (!selectedProperty) return;

  store.setTravelMode(newMode);
  await handleShowRoutesToPOIs(selectedProperty);
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
