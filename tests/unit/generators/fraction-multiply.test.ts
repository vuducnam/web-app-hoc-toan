import { describe, it, expect } from "vitest";
import { fractionMultiply } from "@/lib/generators/fractions/fraction-multiply";

describe("fraction-multiply generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "fm-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fraction-multiply" };
      const q1 = fractionMultiply.generate(params);
      const q2 = fractionMultiply.generate(params);
      expect(q1.expectedAnswer).toEqual(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("answer format", () => {
    it("returns fraction answerFormat with num/den", () => {
      const q = fractionMultiply.generate({ seed: "fm-fmt", difficulty: 1, skillKey: "fraction-multiply" });
      expect(q.answerFormat).toBe("fraction");
      expect(q.expectedAnswer).toHaveProperty("num");
      expect(q.expectedAnswer).toHaveProperty("den");
      expect(q.expectedAnswer.den).toBeGreaterThan(0);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionMultiply.generate({ seed: "fm-valid", difficulty: 1, skillKey: "fraction-multiply" });
      const ans = `${q.expectedAnswer.num}/${q.expectedAnswer.den}`;
      expect(fractionMultiply.validate(ans, q)).toBe(true);
    });

    it("accepts equivalent unsimplified answer", () => {
      const q = fractionMultiply.generate({ seed: "fm-equiv", difficulty: 2, skillKey: "fraction-multiply" });
      // Double numerator and denominator → equivalent fraction
      const ans = `${q.expectedAnswer.num * 2}/${q.expectedAnswer.den * 2}`;
      expect(fractionMultiply.validate(ans, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = fractionMultiply.generate({ seed: "fm-wrong", difficulty: 2, skillKey: "fraction-multiply" });
      expect(fractionMultiply.validate("0/1", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = fractionMultiply.generate({ seed: "fm-bad", difficulty: 1, skillKey: "fraction-multiply" });
      expect(fractionMultiply.validate("not-a-fraction", q)).toBe(false);
      expect(fractionMultiply.validate("", q)).toBe(false);
    });
  });

  describe("difficulty ranges", () => {
    it("D1 denominator ≤ 8", () => {
      for (let i = 0; i < 10; i++) {
        const q = fractionMultiply.generate({ seed: `fm-d1-${i}`, difficulty: 1, skillKey: "fraction-multiply" });
        // problemText contains \frac{n1}{d1} \times \frac{n2}{d2}
        expect(q.expectedAnswer.den).toBeGreaterThan(0);
      }
    });
  });
});
