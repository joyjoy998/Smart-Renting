// __tests__/routeStore.test.ts
import { useRouteStore } from "../src/stores/useRouteStore";

describe("useRouteStore", () => {
  beforeEach(() => {
    // Reset only state values, keep actions intact
    useRouteStore.setState({
      travelMode: "DRIVING",
      selectedPropertyForRoute: null,
      pois: [],
      routesToPOIs: [],
      visiblePOIs: [],
    });
  });

  it("should have correct initial state", () => {
    const {
      travelMode,
      selectedPropertyForRoute,
      pois,
      routesToPOIs,
      visiblePOIs,
    } = useRouteStore.getState();

    expect(travelMode).toBe("DRIVING");
    expect(selectedPropertyForRoute).toBeNull();
    expect(pois).toEqual([]);
    expect(routesToPOIs).toEqual([]);
    expect(visiblePOIs).toEqual([]);
  });

  it("setTravelMode should update travelMode", () => {
    useRouteStore.getState().setTravelMode("WALKING");
    expect(useRouteStore.getState().travelMode).toBe("WALKING");
  });

  it("setSelectedPropertyForRoute should update selectedPropertyForRoute", () => {
    const property = { latitude: 1, longitude: 2, group_id: "1" } as any;
    useRouteStore.getState().setSelectedPropertyForRoute(property);
    expect(useRouteStore.getState().selectedPropertyForRoute).toEqual(property);
  });

  it("setPois should update pois", () => {
    const poiList = [
      { poi_id: "1", name: "A", latitude: 0, longitude: 0 } as any,
    ];
    useRouteStore.getState().setPois(poiList);
    expect(useRouteStore.getState().pois).toEqual(poiList);
  });

  it("setRoutesToPOIs should update routesToPOIs", () => {
    const routes = [
      {
        poiId: "1",
        polylinePath: [],
        durationText: "d",
        distanceText: "dist",
      } as any,
    ];
    useRouteStore.getState().setRoutesToPOIs(routes);
    expect(useRouteStore.getState().routesToPOIs).toEqual(routes);
  });

  it("setVisiblePOIs should update visiblePOIs", () => {
    const ids = ["1", "2"];
    useRouteStore.getState().setVisiblePOIs(ids);
    expect(useRouteStore.getState().visiblePOIs).toEqual(ids);
  });

  it("togglePOIVisibility should add and remove id", () => {
    const id = "x";
    // initially not visible
    expect(useRouteStore.getState().visiblePOIs).not.toContain(id);

    // toggle on
    useRouteStore.getState().togglePOIVisibility(id);
    expect(useRouteStore.getState().visiblePOIs).toContain(id);

    // toggle off
    useRouteStore.getState().togglePOIVisibility(id);
    expect(useRouteStore.getState().visiblePOIs).not.toContain(id);
  });
});
