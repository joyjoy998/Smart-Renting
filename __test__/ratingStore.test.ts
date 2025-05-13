// __tests__/ratingStore.test.ts
// 测试 useRatingStore 中的 state 和 actions
import { useRatingStore } from "../src/stores/ratingStore";
import { usePreferencesStore } from "../src/stores/usePreferencesStore";

describe("useRatingStore basic functionality", () => {
  beforeEach(() => {
    // reset store to initial state
    useRatingStore.setState(useRatingStore.getState(), true);
  });

  it("should have correct initial state", () => {
    const state = useRatingStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.properties).toEqual([]);
    expect(state.pois).toEqual([]);
    expect(state.selectedPOI).toBeNull();
    expect(state.travelMode).toBe("WALKING");
    expect(state.distanceScores).toEqual({});
    expect(state.weightConfig).toEqual({
      distance: 0.5,
      price: 0.5,
      neighborhood_safety: 0.5,
      amenity: 0.5,
    });
  });

  it("setters should update state correctly", () => {
    const store = useRatingStore.getState();
    store.setSelectedPOI({ poi_id: "x", address: "", name: "" });
    expect(useRatingStore.getState().selectedPOI).toEqual({
      poi_id: "x",
      address: "",
      name: "",
    });

    store.setTravelMode("DRIVING");
    expect(useRatingStore.getState().travelMode).toBe("DRIVING");

    store.setDistanceScores({ a: 1 });
    expect(useRatingStore.getState().distanceScores).toEqual({ a: 1 });

    store.updateWeight("price", 0.8);
    expect(useRatingStore.getState().weightConfig.price).toBe(0.8);
  });

  it("syncWithPreferences sets weightConfig from preferences store", () => {
    // mock preferences
    jest.spyOn(usePreferencesStore, "getState").mockReturnValue({
      preferences: {
        distance: 0.2,
        price: 0.3,
        neighborhoodSafety: 0.4,
        amenity: 0.6,
      },
    } as any);

    useRatingStore.getState().syncWithPreferences();
    expect(useRatingStore.getState().weightConfig).toEqual({
      distance: 0.2,
      price: 0.3,
      neighborhood_safety: 0.4,
      amenity: 0.6,
    });
  });

  it("getTravelTimeForPropertyAndPOI and getDistanceForPropertyAndPOI should return correct values", () => {
    const store = useRatingStore.getState();
    store.setTravelTimes({ p1_poi1: 123 });
    expect(store.getTravelTimeForPropertyAndPOI("p1", "poi1")).toBe(123);

    store.setDistances({ p2_poi2: 456 });
    expect(store.getDistanceForPropertyAndPOI("p2", "poi2")).toBe(456);
  });
});
