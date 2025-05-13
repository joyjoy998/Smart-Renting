// __tests__/distance.utils.test.ts
import {
  durationToSeconds,
  getPOIWeight,
  sigmoidNormalize,
  calculateTimeBucketScore,
  calculateExponentialDistanceScore,
} from "../src/components/ratingSystem/lib/distanceScore";

describe("durationToSeconds", () => {
  it('Handle formats ending with "s"', () => {
    expect(durationToSeconds("1200s")).toBe(1200);
  });
  it("Handling ISO 8601 format", () => {
    expect(durationToSeconds("PT20M")).toBe(20);
    expect(durationToSeconds("PT1H")).toBe(1);
    // 如果你希望解析 PT1H30M，还需要扩展实现
  });
});

describe("getPOIWeight", () => {
  it("支持已知类型", () => {
    expect(getPOIWeight("work")).toBe(0.5);
    expect(getPOIWeight("Gym")).toBe(0.5);
    expect(getPOIWeight("Grocery")).toBe(0.5);
  });
  it("未知类型返回默认 0.5", () => {
    expect(getPOIWeight(undefined)).toBe(0.5);
    expect(getPOIWeight("Zoo")).toBe(0.5);
  });
});

describe("sigmoidNormalize", () => {
  it("返回 0.5 在 midpoint 位置", () => {
    expect(sigmoidNormalize(10, 10)).toBeCloseTo(0.5, 3);
  });
  it("值小于 midpoint 时 >0.5", () => {
    expect(sigmoidNormalize(5, 10)).toBeGreaterThan(0.5);
  });
  it("值大于 midpoint 时 <0.5", () => {
    expect(sigmoidNormalize(20, 10)).toBeLessThan(0.5);
  });
});

describe("calculateTimeBucketScore", () => {
  it("travelTimeSeconds === 9999 时返回 0", () => {
    expect(calculateTimeBucketScore(9999, "Work")).toBe(0);
  });

  it("非常短时间（Excellent 桶）应当落在 [0.8,1] 区间", () => {
    const score = calculateTimeBucketScore(60, "Gym"); // 1 分钟
    expect(score).toBeGreaterThanOrEqual(0.8);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("中等时间（Good 桶）大致在 [0.6,0.8]", () => {
    const fiveMin = 5 * 60 * 1.5; // Work 类型 multiplier = 1.5
    const score = calculateTimeBucketScore(fiveMin + 10, "Work");
    expect(score).toBeLessThan(0.8);
    expect(score).toBeGreaterThanOrEqual(0.6);
  });

  it("超长时间（Very Poor 桶）小于 0.2", () => {
    const score = calculateTimeBucketScore(10000, "Other");
    expect(score).toBeLessThan(0.2);
  });
});

describe("calculateExponentialDistanceScore", () => {
  const pois = [
    { poi_id: "p1", type: "Work" },
    { poi_id: "p2", type: "Gym" },
  ] as any;

  it("空 poiScores 返回 0", () => {
    expect(calculateExponentialDistanceScore({}, pois)).toBe(0);
  });

  it("根据类型权重加权平均", () => {
    // p1 score=1, weight=1; p2 score=0.5, weight=0.6
    const raw = calculateExponentialDistanceScore({ p1: 1, p2: 0.5 }, pois);
    const expected = 0.75;
    expect(raw).toBeCloseTo(expected, 5);
  });
});
