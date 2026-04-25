import { describe, it, expect } from "vitest";
import { addLargeNumbers } from "@/lib/generators/arithmetic/add-large-numbers";

const SK = "g4-add-large-numbers";

describe("add-large-numbers generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = addLargeNumbers.generate(p);
      const q2 = addLargeNumbers.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = addLargeNumbers.generate({ ...base, seed: "s1" });
      const q2 = addLargeNumbers.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1 operands are 5-digit [10000, 99999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = addLargeNumbers.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/^(\d+) \+ (\d+)/);
        expect(match).toBeTruthy();
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(10_000);
        expect(a).toBeLessThanOrEqual(99_999);
        expect(b).toBeGreaterThanOrEqual(10_000);
        expect(b).toBeLessThanOrEqual(99_999);
      }
    });

    it("D2 operands are 6-digit [100000, 999999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = addLargeNumbers.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) \+ (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(100_000);
        expect(a).toBeLessThanOrEqual(999_999);
        expect(b).toBeGreaterThanOrEqual(100_000);
        expect(b).toBeLessThanOrEqual(999_999);
      }
    });

    it("D3 a is 7-digit, b is 5-digit (mismatched widths)", () => {
      for (let i = 0; i < 20; i++) {
        const q = addLargeNumbers.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/^(\d+) \+ (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(1_000_000);
        expect(a).toBeLessThanOrEqual(9_999_999);
        expect(b).toBeGreaterThanOrEqual(10_000);
        expect(b).toBeLessThanOrEqual(99_999);
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer equals a + b", () => {
      for (let i = 0; i < 20; i++) {
        const q = addLargeNumbers.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) \+ (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(q.expectedAnswer).toBe(a + b);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = addLargeNumbers.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(addLargeNumbers.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = addLargeNumbers.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(addLargeNumbers.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects empty and non-numeric", () => {
      const q = addLargeNumbers.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(addLargeNumbers.validate("", q)).toBe(false);
      expect(addLargeNumbers.validate("abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 60 and answerFormat is numeric", () => {
      const q = addLargeNumbers.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(60);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
