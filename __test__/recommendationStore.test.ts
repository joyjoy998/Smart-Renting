import { useRecommendationStore } from "../src/stores/useRecommendationStore";

describe("useRecommendationStore", () => {
  beforeEach(() => {
    // Reset store state
    useRecommendationStore.setState({
      isRecommendationOpen: false,
      recommendedProperties: [],
      currentGroupId: null,
    });
  });

  it("initial state should be correct", () => {
    const state = useRecommendationStore.getState();
    expect(state.isRecommendationOpen).toBe(false);
    expect(state.recommendedProperties).toEqual([]);
    expect(state.currentGroupId).toBeNull();
  });

  it("toggleRecommendation should invert isRecommendationOpen", () => {
    const { toggleRecommendation } = useRecommendationStore.getState();
    toggleRecommendation();
    expect(useRecommendationStore.getState().isRecommendationOpen).toBe(true);
    toggleRecommendation();
    expect(useRecommendationStore.getState().isRecommendationOpen).toBe(false);
  });

  it("setOpen should set isRecommendationOpen accordingly", () => {
    const { setOpen } = useRecommendationStore.getState();
    setOpen(true);
    expect(useRecommendationStore.getState().isRecommendationOpen).toBe(true);
    setOpen(false);
    expect(useRecommendationStore.getState().isRecommendationOpen).toBe(false);
  });

  describe("fetchRecommendations", () => {
    let consoleErrorSpy: jest.SpyInstance;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      originalFetch = global.fetch;
    });
    afterEach(() => {
      consoleErrorSpy.mockRestore();
      global.fetch = originalFetch;
    });

    it("should fetch and update store on success with map params", async () => {
      const fakeProps = [{ id: 1 }, { id: 2 }];
      const mockResponse = { success: true, recommended_properties: fakeProps };
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          json: () => Promise.resolve(mockResponse),
        } as any);

      // call without page argument (code supports 6 args)
      await useRecommendationStore
        .getState()
        .fetchRecommendations("user1", 5, 100, 200, 37.5, 122.0);

      const expectedUrl =
        "/api/recommendProperties?user_id=user1&group_id=5&min_budget=100&max_budget=200&mapLat=37.5&mapLng=122";
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
      const state = useRecommendationStore.getState();
      expect(state.recommendedProperties).toEqual(fakeProps);
      expect(state.currentGroupId).toBe(5);
    });

    it("should log error and not update on failure response", async () => {
      const mockResponse = { success: false, error: "fail" };
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          json: () => Promise.resolve(mockResponse),
        } as any);

      await useRecommendationStore.getState().fetchRecommendations("user2", 10);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(useRecommendationStore.getState().recommendedProperties).toEqual(
        []
      );
      expect(useRecommendationStore.getState().currentGroupId).toBeNull();
    });

    it("should log error on fetch exception", async () => {
      const error = new Error("Network");
      global.fetch = jest.fn().mockRejectedValue(error);

      await useRecommendationStore
        .getState()
        .fetchRecommendations("user3", null);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
