import { describe, it, expect } from "vitest";
import { fractionCommonDenominator } from "@/lib/generators/fractions/fraction-common-denominator";

describe("fraction-common-denominator generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "fcd-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fraction-common-denominator" };
      const q1 = fractionCommonDenominator.generate(params);
      const q2 = fractionCommonDenominator.generate(params);

      expect(q1.expectedAnswer).toEqual(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionCommonDenominator.generate({ seed: "fcd-valid", difficulty: 1, skillKey: "fraction-common-denominator" });
      expect(fractionCommonDenominator.validate(q.expectedAnswer, q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = fractionCommonDenominator.generate({ seed: "fcd-invalid", difficulty: 2, skillKey: "fraction-common-denominator" });
      expect(fractionCommonDenominator.validate("1/1,1/1", q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns text format (JSON string)", () => {
      const q = fractionCommonDenominator.generate({ seed: "fcd-fmt", difficulty: 1, skillKey: "fraction-common-denominator" });
      expect(q.answerFormat).toBe("text");
      expect(typeof q.expectedAnswer).toBe("string");
      // expectedAnswer should be in "num/den,num/den" format
      expect(q.expectedAnswer).toMatch(/^\d+\/\d+,\d+\/\d+$/);
    });
  });
});
