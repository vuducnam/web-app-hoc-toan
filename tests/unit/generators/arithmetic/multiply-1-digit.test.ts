import { describe, it, expect } from "vitest";
import { multiply1Digit } from "@/lib/generators/arithmetic/multiply-1-digit";

const SK = "g4-multiply-1-digit";

describe("multiply-1-digit generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = multiply1Digit.generate(p);
      const q2 = multiply1Digit.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = multiply1Digit.generate({ ...base, seed: "s1" });
      const q2 = multiply1Digit.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1 multi-digit factor in [10,99], 1-digit in [2,9]", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiply1Digit.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/^(\d+) × (\d+)/);
        expect(match).toBeTruthy();
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(10);
        expect(a).toBeLessThanOrEqual(99);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(9);
      }
    });

    it("D2 multi-digit factor in [100,999], 1-digit in [2,9]", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiply1Digit.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) × (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(100);
        expect(a).toBeLessThanOrEqual(999);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(9);
      }
    });

    it("D3 multi-digit factor in [1000,9999], 1-digit in [2,9]", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiply1Digit.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/^(\d+) × (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(1_000);
        expect(a).toBeLessThanOrEqual(9_999);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(9);
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer equals a × b", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiply1Digit.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) × (\d+)/);
        const a = parseInt(match![1], 10);
        const b = parseInt(match![2], 10);
        expect(q.expectedAnswer).toBe(a * b);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = multiply1Digit.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(multiply1Digit.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = multiply1Digit.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(multiply1Digit.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects empty and non-numeric", () => {
      const q = multiply1Digit.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(multiply1Digit.validate("", q)).toBe(false);
      expect(multiply1Digit.validate("abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 60 and answerFormat is numeric", () => {
      const q = multiply1Digit.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(60);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
