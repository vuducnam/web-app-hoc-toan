import { describe, it, expect } from "vitest";
import { fractionDivide } from "@/lib/generators/fractions/fraction-divide";

describe("fraction-divide generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "fd-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fraction-divide" };
      expect(fractionDivide.generate(params)).toEqual(fractionDivide.generate(params));
    });
  });

  describe("answer format", () => {
    it("returns fraction answerFormat", () => {
      const q = fractionDivide.generate({ seed: "fd-fmt", difficulty: 1, skillKey: "fraction-divide" });
      expect(q.answerFormat).toBe("fraction");
      expect(q.expectedAnswer).toHaveProperty("num");
      expect(q.expectedAnswer).toHaveProperty("den");
      expect(q.expectedAnswer.den).toBeGreaterThan(0);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionDivide.generate({ seed: "fd-valid", difficulty: 1, skillKey: "fraction-divide" });
      expect(fractionDivide.validate(`${q.expectedAnswer.num}/${q.expectedAnswer.den}`, q)).toBe(true);
    });

    it("accepts equivalent unsimplified answer", () => {
      const q = fractionDivide.generate({ seed: "fd-equiv", difficulty: 2, skillKey: "fraction-divide" });
      const ans = `${q.expectedAnswer.num * 3}/${q.expectedAnswer.den * 3}`;
      expect(fractionDivide.validate(ans, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = fractionDivide.generate({ seed: "fd-wrong", difficulty: 1, skillKey: "fraction-divide" });
      expect(fractionDivide.validate("0/1", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = fractionDivide.generate({ seed: "fd-bad", difficulty: 1, skillKey: "fraction-divide" });
      expect(fractionDivide.validate("abc", q)).toBe(false);
      expect(fractionDivide.validate("", q)).toBe(false);
    });
  });

  describe("invariants", () => {
    it("denominator is always positive", () => {
      for (let i = 0; i < 15; i++) {
        const q = fractionDivide.generate({ seed: `fd-inv-${i}`, difficulty: (((i % 3) + 1) as 1 | 2 | 3), skillKey: "fraction-divide" });
        expect(q.expectedAnswer.den).toBeGreaterThan(0);
      }
    });
  });
});
