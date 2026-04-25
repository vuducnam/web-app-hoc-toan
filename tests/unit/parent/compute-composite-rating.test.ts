import { describe, it, expect } from "vitest";
import { computeCompositeRating, masteryLevelToInt, stdDev } from "@/lib/parent/compute-composite-rating";

describe("computeCompositeRating", () => {
  describe("formula components", () => {
    it("returns 0 when all inputs are 0", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 0,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      // accuracy=0, daysActive=0, consistency=20*(1/1)=20, mastery=0 → 20
      expect(rating).toBe(20);
    });

    it("returns 100 when all inputs are perfect", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 1, // 40 points
        uniqueActiveDays: 7, // 20 points
        stddevMinutes: 0, // 20 points (perfect consistency)
        sumMasteryLevel: 9, // 20 points (3 skills × MASTERED)
        skillCount: 3,
      });

      // accuracy=40, daysActive=20, consistency=20, mastery=20 → 100
      expect(rating).toBe(100);
    });
  });

  describe("accuracy component (40 points max)", () => {
    it("contributes 40 points at 100% accuracy", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 1,
        uniqueActiveDays: 0,
        stddevMinutes: 100, // high stddev → low consistency
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      // accuracy=40 + consistency~0 ≈ 40
      expect(rating).toBeGreaterThanOrEqual(40);
      expect(rating).toBeLessThanOrEqual(42); // allow rounding
    });

    it("clamps accuracy at 0 and 40", () => {
      const low = computeCompositeRating({
        accuracyRatio: -1, // should clamp to 0
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      const high = computeCompositeRating({
        accuracyRatio: 2, // should clamp to 1
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      expect(low).toBeLessThan(5); // mostly consistency
      expect(high).toBeGreaterThanOrEqual(40);
    });
  });

  describe("daysActive component (20 points max)", () => {
    it("contributes 0 points at 0 active days", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      // daysActive=0 + consistency~0 ≈ 0-1
      expect(rating).toBeLessThan(2);
    });

    it("contributes 20 points at 7 active days", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 7,
        stddevMinutes: 100,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      // daysActive=20 + consistency~0 ≈ 20
      expect(rating).toBeGreaterThanOrEqual(19);
      expect(rating).toBeLessThanOrEqual(22);
    });

    it("clamps days at 0-7", () => {
      const tooHigh = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 14, // should clamp to 7
        stddevMinutes: 100,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      expect(tooHigh).toBeGreaterThanOrEqual(19);
      expect(tooHigh).toBeLessThanOrEqual(22);
    });
  });

  describe("consistency component (20 points max)", () => {
    it("contributes 20 points at stddev=0 (perfect consistency)", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 0,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      // consistency=20*(1/(1+0))=20
      expect(rating).toBe(20);
    });

    it("decreases as stddev increases", () => {
      const low = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 1,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      const high = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      expect(low).toBeGreaterThan(high);
      expect(high).toBeLessThan(2);
    });

    it("handles negative stddev by treating as 0", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: -10, // should be treated as 0
        sumMasteryLevel: 0,
        skillCount: 1,
      });

      expect(rating).toBe(20); // consistency=20
    });
  });

  describe("mastery component (20 points max)", () => {
    it("contributes 20 points when all skills are MASTERED (3 level each)", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 9, // 3 skills × MASTERED(3)
        skillCount: 3,
      });

      // mastery=20*(9/(3*3))=20
      expect(rating).toBeGreaterThanOrEqual(19);
      expect(rating).toBeLessThanOrEqual(21);
    });

    it("contributes 0 when no skills are started", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 0,
        skillCount: 3,
      });

      // mastery=0
      expect(rating).toBeLessThan(2);
    });

    it("handles single skill correctly", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 3, // single skill MASTERED
        skillCount: 1,
      });

      // mastery=20*(3/(1*3))=20
      expect(rating).toBeGreaterThanOrEqual(19);
      expect(rating).toBeLessThanOrEqual(21);
    });

    it("clamps mastery at 0 and 20", () => {
      const tooHigh = computeCompositeRating({
        accuracyRatio: 0,
        uniqueActiveDays: 0,
        stddevMinutes: 100,
        sumMasteryLevel: 100, // way beyond max
        skillCount: 1,
      });

      expect(tooHigh).toBeGreaterThanOrEqual(19);
      expect(tooHigh).toBeLessThanOrEqual(21);
    });
  });

  describe("rounding", () => {
    it("rounds to nearest integer", () => {
      const rating = computeCompositeRating({
        accuracyRatio: 0.5,
        uniqueActiveDays: 3,
        stddevMinutes: 5,
        sumMasteryLevel: 2,
        skillCount: 2,
      });

      expect(Number.isInteger(rating)).toBe(true);
      expect(rating).toBeGreaterThanOrEqual(0);
      expect(rating).toBeLessThanOrEqual(100);
    });
  });
});

describe("masteryLevelToInt", () => {
  it("maps NOT_STARTED to 0", () => {
    expect(masteryLevelToInt("NOT_STARTED")).toBe(0);
  });

  it("maps FAMILIAR to 1", () => {
    expect(masteryLevelToInt("FAMILIAR")).toBe(1);
  });

  it("maps PROFICIENT to 2", () => {
    expect(masteryLevelToInt("PROFICIENT")).toBe(2);
  });

  it("maps MASTERED to 3", () => {
    expect(masteryLevelToInt("MASTERED")).toBe(3);
  });

  it("defaults unknown levels to 0", () => {
    expect(masteryLevelToInt("UNKNOWN")).toBe(0);
  });
});

describe("stdDev", () => {
  it("returns 0 for empty array", () => {
    expect(stdDev([])).toBe(0);
  });

  it("returns 0 for single element", () => {
    expect(stdDev([5])).toBe(0);
  });

  it("calculates stddev correctly for uniform array", () => {
    const dev = stdDev([5, 5, 5, 5]);
    expect(dev).toBe(0);
  });

  it("calculates stddev for varied array", () => {
    // [1, 2, 3, 4, 5] → mean=3, variance=2, stddev=√2≈1.414
    const dev = stdDev([1, 2, 3, 4, 5]);
    expect(dev).toBeCloseTo(1.414, 2);
  });

  it("handles negative values", () => {
    const dev = stdDev([-5, -3, -1, 1, 3, 5]);
    expect(dev).toBeGreaterThan(0);
  });
});
