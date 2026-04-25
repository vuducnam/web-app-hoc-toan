import { describe, it, expect } from "vitest";
import { subLargeNumbers } from "@/lib/generators/arithmetic/sub-large-numbers";

const SK = "g4-sub-large-numbers";

describe("sub-large-numbers generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = subLargeNumbers.generate(p);
      const q2 = subLargeNumbers.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = subLargeNumbers.generate({ ...base, seed: "s1" });
      const q2 = subLargeNumbers.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1 operands are 5-digit (a >= b, no negatives)", () => {
      for (let i = 0; i < 20; i++) {
        const q = subLargeNumbers.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/^(\d+) - (\d+)/);
        expect(match).toBeTruthy();
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(10_000);
        expect(a).toBeLessThanOrEqual(99_999);
        expect(b).toBeGreaterThanOrEqual(10_000);
        expect(b).toBeLessThanOrEqual(99_999);
        expect(a).toBeGreaterThanOrEqual(b);
      }
    });

    it("D2 operands are 6-digit (a >= b)", () => {
      for (let i = 0; i < 20; i++) {
        const q = subLargeNumbers.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) - (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(100_000);
        expect(a).toBeLessThanOrEqual(999_999);
        expect(b).toBeGreaterThanOrEqual(100_000);
        expect(b).toBeLessThanOrEqual(999_999);
        expect(a).toBeGreaterThanOrEqual(b);
      }
    });

    it("D3 a is 7-digit, b is 6-digit (a >= b)", () => {
      for (let i = 0; i < 20; i++) {
        const q = subLargeNumbers.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/^(\d+) - (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(1_000_000);
        expect(a).toBeLessThanOrEqual(9_999_999);
        expect(b).toBeGreaterThanOrEqual(100_000);
        expect(b).toBeLessThanOrEqual(999_999);
        expect(a).toBeGreaterThanOrEqual(b);
      }
    });

    it("answer is always non-negative", () => {
      for (let i = 0; i < 20; i++) {
        const q = subLargeNumbers.generate({ seed: `neg-${i}`, difficulty: 1, skillKey: SK });
        expect(q.expectedAnswer as number).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer equals a - b", () => {
      for (let i = 0; i < 20; i++) {
        const q = subLargeNumbers.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) - (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(q.expectedAnswer).toBe(a - b);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = subLargeNumbers.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(subLargeNumbers.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = subLargeNumbers.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(subLargeNumbers.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects empty and non-numeric", () => {
      const q = subLargeNumbers.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(subLargeNumbers.validate("", q)).toBe(false);
      expect(subLargeNumbers.validate("abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 60 and answerFormat is numeric", () => {
      const q = subLargeNumbers.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(60);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
