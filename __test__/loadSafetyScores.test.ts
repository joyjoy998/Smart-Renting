import { loadSafetyScores } from "../src/components/ratingSystem/lib/safetyScore";
import { useRatingStore } from "../src/stores/ratingStore";

describe("loadSafetyScores", () => {
  let originalConsoleWarn: typeof console.warn;

  beforeAll(() => {
    originalConsoleWarn = console.warn;
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  it("当 properties 为空时，发出警告并不调用 setSafetyScores", () => {
    const mockSet = jest.fn();
    jest.spyOn(useRatingStore, "getState").mockReturnValue({
      properties: [],
      setSafetyScores: mockSet,
    } as any);

    loadSafetyScores();
    expect(console.warn).toHaveBeenCalledWith(
      "No properties available for safety scoring."
    );
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("当有 properties 时，按安全分数映射并调用 setSafetyScores", () => {
    const mockSet = jest.fn();
    const properties = [
      { property_property_id: "p1", address: "Addr1", safetyScore: 0.9 },
      { property_property_id: "p2", address: "Addr2", safetyScore: 0 },
      {
        property_property_id: "p3",
        address: "Addr3",
        safetyScore: undefined as any,
      },
    ];
    jest.spyOn(useRatingStore, "getState").mockReturnValue({
      properties,
      setSafetyScores: mockSet,
    } as any);

    loadSafetyScores();
    expect(mockSet).toHaveBeenCalledWith({
      p1: 0.9,
      p2: 0.4,
      p3: 0.4,
    });
  });
});
