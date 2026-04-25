import { describe, it, expect } from "vitest";
import { placeValue6digit } from "@/lib/generators/number-sense/place-value-6digit";

const SK = "g4-place-value-6digit";

describe("place-value-6digit generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = placeValue6digit.generate(p);
      const q2 = placeValue6digit.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = placeValue6digit.generate({ ...base, seed: "s1" });
      const q2 = placeValue6digit.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range and structure constraints", () => {
    it("D1 uses 5-digit numbers (10000–99999)", () => {
      for (let i = 0; i < 20; i++) {
        const q = placeValue6digit.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        // extract number from "Trong số XXXXX,"
        const match = q.problemText.match(/Trong số (\d+),/);
        expect(match).toBeTruthy();
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(10_000);
        expect(n).toBeLessThanOrEqual(99_999);
      }
    });

    it("D2 uses 6-digit numbers (100000–999999)", () => {
      for (let i = 0; i < 20; i++) {
        const q = placeValue6digit.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/Trong số (\d+),/);
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(100_000);
        expect(n).toBeLessThanOrEqual(999_999);
      }
    });

    it("D3 uses 6-digit numbers (100000–999999)", () => {
      for (let i = 0; i < 20; i++) {
        const q = placeValue6digit.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/Trong số (\d+),/);
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(100_000);
        expect(n).toBeLessThanOrEqual(999_999);
      }
    });

    it("expectedAnswer is a power-of-10 multiple of the digit", () => {
      for (let i = 0; i < 20; i++) {
        const q = placeValue6digit.generate({ seed: `pv-${i}`, difficulty: 2, skillKey: SK });
        const ans = q.expectedAnswer as number;
        // Answer should be a multiple of 10, 100, 1000, etc. (or 0 if digit is 0, but we avoid that)
        expect(ans).toBeGreaterThan(0);
        // Must be a multiple of some power of 10
        const isPowerOf10Multiple = [1, 10, 100, 1_000, 10_000, 100_000].some(
          (p) => ans % p === 0 && ans / p < 10
        );
        expect(isPowerOf10Multiple).toBe(true);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = placeValue6digit.generate({ seed: "val-ok", difficulty: 2, skillKey: SK });
      expect(placeValue6digit.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = placeValue6digit.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(placeValue6digit.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects empty and non-numeric", () => {
      const q = placeValue6digit.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(placeValue6digit.validate("", q)).toBe(false);
      expect(placeValue6digit.validate("abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 45 and answerFormat is numeric", () => {
      const q = placeValue6digit.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(45);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
