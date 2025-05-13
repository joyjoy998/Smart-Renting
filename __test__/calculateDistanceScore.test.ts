// __tests__/calculateDistanceScore.test.ts
import axios from "axios";
import { calculateDistanceScore } from "../src/components/ratingSystem/lib/distanceScore";
import { useRatingStore } from "../src/stores/ratingStore";

jest.mock("axios");
const mockedPost = axios.post as jest.Mock;

// 定义用于模拟的 routes 数据
const fakeRoutes = [
  { propertyId: "prop1", distanceMeters: 1000, duration: "600s" },
  { propertyId: "prop2", distanceMeters: 500, duration: "300s" },
];

type Store = {
  pois: Array<any>;
  setDistanceScores: jest.Mock;
  setTravelTimes: jest.Mock;
  setDistances: jest.Mock;
};

describe("calculateDistanceScore", () => {
  let originalConsoleWarn: typeof console.warn;
  beforeAll(() => {
    originalConsoleWarn = console.warn;
    console.warn = jest.fn();
  });
  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  it("当 pois 或 properties 为空时，直接返回 undefined 并 warning", async () => {
    jest.spyOn(useRatingStore, "getState").mockReturnValue({ pois: [] } as any);

    const result = await calculateDistanceScore(null, "WALKING", []);
    expect(result).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      "No POIs or no properties available."
    );
  });

  it("正常流程：mock axios 返回 routes，验证副作用和返回值", async () => {
    // 模拟 axios.post 返回预定义的 fakeRoutes
    mockedPost.mockResolvedValue({ data: { routes: fakeRoutes } });

    const mockStore: Store = {
      pois: [
        {
          poi_id: "poi1",
          address: "A",
          latitude: 1,
          longitude: 1,
          name: "X",
          type: "Work",
        },
      ],
      setDistanceScores: jest.fn(),
      setTravelTimes: jest.fn(),
      setDistances: jest.fn(),
    };
    jest.spyOn(useRatingStore, "getState").mockReturnValue({
      pois: mockStore.pois,
      setDistanceScores: mockStore.setDistanceScores,
      setTravelTimes: mockStore.setTravelTimes,
      setDistances: mockStore.setDistances,
    } as any);

    const properties = [
      {
        property_property_id: "prop1",
        address: "A",
        latitude: 1,
        longitude: 1,
      },
      {
        property_property_id: "prop2",
        address: "B",
        latitude: 1,
        longitude: 1,
      },
    ];

    const result = await calculateDistanceScore(null, "DRIVING", properties);

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockStore.setTravelTimes).toHaveBeenCalled();
    expect(mockStore.setDistances).toHaveBeenCalled();
    expect(mockStore.setDistanceScores).toHaveBeenCalled();

    expect(result).toHaveProperty("distanceScores");
    expect(Object.keys(result!.distanceScores)).toEqual(["prop1", "prop2"]);
    Object.values(result!.distanceScores).forEach((v: number) => {
      expect(v).toBeGreaterThanOrEqual(0.3);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  it("当所有 routes 为空时跳过", async () => {
    // 模拟 axios.post 返回空 routes
    mockedPost.mockResolvedValue({ data: { routes: [] } });

    const mockStore: Store = {
      pois: [
        {
          poi_id: "poi1",
          address: "A",
          latitude: 1,
          longitude: 1,
          name: "X",
          type: "Work",
        },
      ],
      setDistanceScores: jest.fn(),
      setTravelTimes: jest.fn(),
      setDistances: jest.fn(),
    };
    jest.spyOn(useRatingStore, "getState").mockReturnValue({
      pois: mockStore.pois,
      setDistanceScores: mockStore.setDistanceScores,
      setTravelTimes: mockStore.setTravelTimes,
      setDistances: mockStore.setDistances,
    } as any);

    const properties = [
      { property_property_id: "p", address: "A", latitude: 1, longitude: 1 },
    ];
    const result = await calculateDistanceScore(null, "TRANSIT", properties);

    expect(mockStore.setDistanceScores).toHaveBeenCalled();
  });
});
