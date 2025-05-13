import {
  calculateSingleAmenityScore,
  normalizeScoreWithFloor,
  applyLogarithmicCompression,
} from "../src/components/ratingSystem/lib/amenitiesScore";

describe("calculateSingleAmenityScore", () => {
  it("When count is 0, return a low score close to 0", () => {
    const score = calculateSingleAmenityScore(0, 20);
    expect(score).toBeLessThan(0.1);
  });

  it("score never exceeds 1", () => {
    expect(calculateSingleAmenityScore(1000, 10)).toBeLessThanOrEqual(1);
  });
});

describe("normalizeScoreWithFloor", () => {
  it("When max===min, return default value", () => {
    expect(normalizeScoreWithFloor(5, 5, 5)).toBe(0.7);
  });

  it("Normal scaling to floor-ceiling range", () => {
    // rawScore=5,min=0,max=10,floor=0.4,ceiling=1
    const norm = normalizeScoreWithFloor(5, 0, 10, 0.4, 1);
    expect(norm).toBeCloseTo(0.4 + (0.6 * 5) / 10, 5);
  });
});

describe("applyLogarithmicCompression", () => {
  it("Empty objects return directly", () => {
    const obj = applyLogarithmicCompression({});
    expect(obj).toEqual({});
  });

  it("No change when range < 0.1", () => {
    const scores = { a: 0.5, b: 0.55 };
    expect(applyLogarithmicCompression(scores)).toEqual(scores);
  });

  it("Log-compress a set of scores and normalize them", () => {
    const scores = { p1: 0.4, p2: 1.0, p3: 0.7 };
    const result = applyLogarithmicCompression(scores);
    // 验证所有值都在 [0.4,1]
    Object.values(result).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0.4);
      expect(v).toBeLessThanOrEqual(1.0);
    });
    // 验证不同key 得到不同值
    expect(result.p1).not.toEqual(result.p2);
  });
});
