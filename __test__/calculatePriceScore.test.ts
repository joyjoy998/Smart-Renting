// __tests__/calculatePriceScore.test.ts
import { calculatePriceScore } from "../src/components/ratingSystem/lib/priceScore";
import { useRatingStore } from "../src/stores/ratingStore";

describe("calculatePriceScore", () => {
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleLog: typeof console.log;

  beforeAll(() => {
    originalConsoleWarn = console.warn;
    originalConsoleLog = console.log;
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  it("when properties is empty, should warn and not call setPriceScores", () => {
    const mockSet = jest.fn();
    jest.spyOn(useRatingStore, "getState").mockReturnValue({
      properties: [],
      setPriceScores: mockSet,
    } as any);

    calculatePriceScore();

    expect(console.warn).toHaveBeenCalledWith(
      "No properties available for price scoring."
    );
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("with single property, min === max => score = 0.8", () => {
    const mockSet = jest.fn();
    const properties = [
      {
        property_property_id: "p1",
        address: "Addr1",
        bedrooms: 1,
        bathrooms: 1,
        parkingSpaces: 1,
        weeklyRent: 100,
      },
    ];

    jest.spyOn(useRatingStore, "getState").mockReturnValue({
      properties,
      setPriceScores: mockSet,
    } as any);

    calculatePriceScore();

    expect(mockSet).toHaveBeenCalledWith({ p1: 0.8 });
  });

  it("with multiple properties, computes correct scores", () => {
    const mockSet = jest.fn();
    const properties = [
      {
        property_property_id: "p1",
        address: "A",
        bedrooms: 1,
        bathrooms: 1,
        parkingSpaces: 1,
        weeklyRent: 100,
      },
      {
        property_property_id: "p2",
        address: "B",
        bedrooms: 2,
        bathrooms: 2,
        parkingSpaces: 2,
        weeklyRent: 200,
      },
    ];

    jest.spyOn(useRatingStore, "getState").mockReturnValue({
      properties,
      setPriceScores: mockSet,
    } as any);

    calculatePriceScore();

    // adjustedPrices: p1 => 100/2=50; p2 => 200/3.5≈57.14
    // min=50, max≈57.14 => p1 score=1.0, p2 score=0.4
    expect(mockSet).toHaveBeenCalledWith({ p1: 1.0, p2: 0.4 });
  });
});
