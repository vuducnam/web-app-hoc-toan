import { describe, it, expect } from "vitest";
import { sixDigitNumbers } from "@/lib/generators/number-sense/6-digit-numbers";

const SK = "g4-6-digit-numbers";

describe("6-digit-numbers generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = sixDigitNumbers.generate(p);
      const q2 = sixDigitNumbers.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = sixDigitNumbers.generate({ ...base, seed: "s1" });
      const q2 = sixDigitNumbers.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1 answers in [100000, 199999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = sixDigitNumbers.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(100_000);
        expect(q.expectedAnswer).toBeLessThanOrEqual(199_999);
      }
    });

    it("D2 answers in [100000, 999999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = sixDigitNumbers.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(100_000);
        expect(q.expectedAnswer).toBeLessThanOrEqual(999_999);
      }
    });

    it("D3 answers in [100000, 999999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = sixDigitNumbers.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(100_000);
        expect(q.expectedAnswer).toBeLessThanOrEqual(999_999);
      }
    });

    it("D3 answers have at least one zero in middle positions", () => {
      for (let i = 0; i < 20; i++) {
        const q = sixDigitNumbers.generate({ seed: `d3z-${i}`, difficulty: 3, skillKey: SK });
        const n = q.expectedAnswer as number;
        // Check positions 1-4 (ones, tens, hundreds, thousands, ten-thousands excluding lead)
        const digits = String(n).split("").map(Number);
        // digits[0] = lead (non-zero); check digits[1..4] for at least one zero
        const middleHasZero = digits.slice(1, 5).some((d) => d === 0);
        expect(middleHasZero).toBe(true);
      }
    });
  });

  describe("problem text format", () => {
    it("starts with 'Viết số:'", () => {
      const q = sixDigitNumbers.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.problemText).toMatch(/^Viết số:/);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = sixDigitNumbers.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(sixDigitNumbers.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = sixDigitNumbers.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(sixDigitNumbers.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects empty and non-numeric", () => {
      const q = sixDigitNumbers.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(sixDigitNumbers.validate("", q)).toBe(false);
      expect(sixDigitNumbers.validate("abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 45", () => {
      const q = sixDigitNumbers.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(45);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
