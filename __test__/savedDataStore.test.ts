// __tests__/savedDataStore.test.ts
import useSavedDataStore from "../src/stores/useSavedData";

describe("useSavedDataStore", () => {
  beforeEach(() => {
    // Reset state to defaults without overwriting actions
    useSavedDataStore.setState({
      savedPois: [],
      properties: [],
      savedProperties: [],
    });
  });

  it("should initialize with empty arrays", () => {
    const state = useSavedDataStore.getState();
    expect(state.savedPois).toEqual([]);
    expect(state.properties).toEqual([]);
    expect(state.savedProperties).toEqual([]);
  });

  it("setSavedPois should update savedPois", () => {
    const pois = [{ poi_id: "1", name: "A", latitude: 0, longitude: 0 } as any];
    useSavedDataStore.getState().setSavedPois(pois);
    expect(useSavedDataStore.getState().savedPois).toEqual(pois);
  });

  it("setProperties should update properties", () => {
    const props = [
      {
        saved_property_id: 1,
        group_id: 2,
        property_id: "p",
        place_id: "x",
        street: "",
        suburb: "",
        state: "",
        postcode: "",
        weekly_rent: 100,
        bedrooms: 1,
        bathrooms: 1,
        parking_spaces: 1,
        property_type: null,
        photo: [],
        latitude: 0,
        longitude: 0,
        created_at: "",
        safety_score: 0,
        note: null,
        category: null,
      } as any,
    ];
    useSavedDataStore.getState().setProperties(props);
    expect(useSavedDataStore.getState().properties).toEqual(props);
  });

  it("setSavedProperties should update savedProperties", () => {
    const savedProps = [
      {
        saved_property_id: 3,
        group_id: 4,
        property_id: "q",
        place_id: "y",
        street: "",
        suburb: "",
        state: "",
        postcode: "",
        weekly_rent: 200,
        bedrooms: 2,
        bathrooms: 2,
        parking_spaces: 2,
        property_type: null,
        photo: [],
        latitude: 1,
        longitude: 1,
        created_at: "",
        safety_score: 0.5,
        note: null,
        category: null,
      } as any,
    ];
    useSavedDataStore.getState().setSavedProperties(savedProps);
    expect(useSavedDataStore.getState().savedProperties).toEqual(savedProps);
  });
});
