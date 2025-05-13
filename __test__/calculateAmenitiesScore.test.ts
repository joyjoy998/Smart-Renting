// __tests__/calculateAmenitiesScore.test.ts
import { calculateAmenitiesScore } from "../src/components/ratingSystem/lib/amenitiesScore";
import { useRatingStore } from "../src/stores/ratingStore";

type StoreState = {
  properties: Array<{
    property_property_id: string;
    latitude: number;
    longitude: number;
  }>;
  setAmenitiesScores: jest.Mock;
  setAmenitiesData: jest.Mock;
};

describe("calculateAmenitiesScore", () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("When the property coordinates are invalid, skip the fetch and assign a default score", async () => {
    // 1. Mock zustand store
    const mockState: StoreState = {
      properties: [{ property_property_id: "p1", latitude: 0, longitude: 0 }],
      setAmenitiesScores: jest.fn(),
      setAmenitiesData: jest.fn(),
    };
    jest.spyOn(useRatingStore, "getState").mockReturnValue(mockState as any);

    // 2. Call
    const result = await calculateAmenitiesScore();

    // 3. 断言
    expect(mockState.setAmenitiesScores).toHaveBeenCalledWith({ p1: 0.4 });
    expect(result.scores).toEqual({ p1: 0.4 });
  });

  it("Normal process: fetch returns data, calculates and normalizes", async () => {
    const fakeData = {
      hospital: { count: 10, places: [] },
      convenienceStore: { count: 20, places: [] },
      restaurant: { count: 30, places: [] },
      gym: { count: 5, places: [] },
      park: { count: 2, places: [] },
    };
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData),
    } as any);

    // Mock store with two properties for对比
    const mockState: StoreState = {
      properties: [
        { property_property_id: "p1", latitude: 1, longitude: 2 },
        { property_property_id: "p2", latitude: 3, longitude: 4 },
      ],
      setAmenitiesScores: jest.fn(),
      setAmenitiesData: jest.fn(),
    };
    jest.spyOn(useRatingStore, "getState").mockReturnValue(mockState as any);

    const result = await calculateAmenitiesScore();

    // 应当调用一次 fetch
    expect(global.fetch).toHaveBeenCalledTimes(2);
    // setAmenitiesData 里应该保存原始数据
    expect(mockState.setAmenitiesData).toHaveBeenCalledWith({
      p1: fakeData,
      p2: fakeData,
    });
    // 返回的分数对象 keys 与 properties 一致
    expect(Object.keys(result.scores)).toEqual(["p1", "p2"]);
    // 每个 score 都在 [0.4,1] 之间
    Object.values(result.scores).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0.4);
      expect(v).toBeLessThanOrEqual(1.0);
    });
  });

  it("Fetch failed branch, return the lowest score", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    const mockState: StoreState = {
      properties: [{ property_property_id: "p3", latitude: 1, longitude: 2 }],
      setAmenitiesScores: jest.fn(),
      setAmenitiesData: jest.fn(),
    };
    jest.spyOn(useRatingStore, "getState").mockReturnValue(mockState as any);

    const result = await calculateAmenitiesScore();

    expect(mockState.setAmenitiesScores).toHaveBeenCalledWith({ p3: 0.4 });
    expect(result.scores.p3).toBe(0.4);
  });
});
