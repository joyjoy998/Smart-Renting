// __tests__/ratingService.test.ts
import * as service from "../src/services/ratingService";

describe("fetchUserPreferences", () => {
  let originalFetch: typeof global.fetch;
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalFetch = global.fetch;
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
  });

  it("returns JSON when response.ok is true", async () => {
    const mockData = [{ key: "value" }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    } as any);

    const result = await service.fetchUserPreferences("user1");
    expect(global.fetch).toHaveBeenCalledWith("/api/preferences?user_id=user1");
    expect(result).toEqual(mockData);
  });

  it("logs error and returns [] when response.ok is false", async () => {
    const errorData = { error: "Not Found" };
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue(errorData),
    } as any);

    const result = await service.fetchUserPreferences("user2");
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching user preferences:",
      expect.any(Error)
    );
    expect(result).toEqual([]);
  });

  it("logs error and returns [] on fetch rejection", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network Error"));

    const result = await service.fetchUserPreferences("user3");
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching user preferences:",
      expect.any(Error)
    );
    expect(result).toEqual([]);
  });
});

describe("fetchGroupRatingData", () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("returns defaults when group is null or undefined", async () => {
    const result = await service.fetchGroupRatingData({} as any);
    expect(result).toEqual({
      group: null,
      properties: [],
      pois: [],
      preferences: [],
    });
  });

  it("fetches preferences and merges into result", async () => {
    const mockPrefs = [{ theme: "dark" }];
    // stub fetch to simulate fetchUserPreferences
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockPrefs),
    } as any);

    const input = {
      group: { user_id: "u1", name: "Group1" },
      properties: [1, 2],
      pois: [3, 4],
    } as any;
    const result = await service.fetchGroupRatingData(input);

    expect(result).toEqual({
      ...input,
      preferences: mockPrefs,
    });
  });
});
