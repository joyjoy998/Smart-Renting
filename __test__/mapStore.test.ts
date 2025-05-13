// __tests__/mapStore.test.ts
import useMapStore from "../src/stores/useMapStore";

describe("useMapStore actions", () => {
  beforeEach(() => {
    // Reset the store to initial values without removing actions
    useMapStore.setState({ currentInfoWindow: null, currentGeometry: null });
  });

  it("should initialize with null currentInfoWindow and currentGeometry", () => {
    const { currentInfoWindow, currentGeometry } = useMapStore.getState();
    expect(currentInfoWindow).toBeNull();
    expect(currentGeometry).toBeNull();
  });

  it("setCurrentInfoWindow should update currentInfoWindow", () => {
    const dummyInfo = { place_id: "123", name: "Test Place" } as any;
    useMapStore.getState().setCurrentInfoWindow(dummyInfo);
    expect(useMapStore.getState().currentInfoWindow).toEqual(dummyInfo);
  });

  it("setCurrentGeometry should update currentGeometry", () => {
    const dummyGeom = { lng: 10, lat: 20 };
    useMapStore.getState().setCurrentGeometry(dummyGeom);
    expect(useMapStore.getState().currentGeometry).toEqual(dummyGeom);
  });

  it("clearCurrentInfo should reset both to null", () => {
    // Set non-null values first
    useMapStore.getState().setCurrentInfoWindow({} as any);
    useMapStore.getState().setCurrentGeometry({ lng: 1, lat: 2 });

    // Clear them
    useMapStore.getState().clearCurrentInfo();

    const { currentInfoWindow, currentGeometry } = useMapStore.getState();
    expect(currentInfoWindow).toBeNull();
    expect(currentGeometry).toBeNull();
  });
});
