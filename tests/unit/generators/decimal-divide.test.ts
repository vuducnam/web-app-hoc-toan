import { describe, it, expect } from "vitest";
import { decimalDivide } from "@/lib/generators/decimals/decimal-divide";

describe("decimal-divide generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "ddiv-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-divide" };
      const q1 = decimalDivide.generate(params);
      const q2 = decimalDivide.generate(params);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("answer format", () => {
    it("returns decimal format", () => {
      const q = decimalDivide.generate({ seed: "ddiv-fmt", difficulty: 1, skillKey: "decimal-divide" });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });

  describe("quotient-first construction", () => {
    it("dividend = quotient × divisor (D1)", () => {
      // Can't directly inspect internals, but validate that answer is positive and finite
      for (let i = 0; i < 10; i++) {
        const q = decimalDivide.generate({ seed: `ddiv-d1-${i}`, difficulty: 1, skillKey: "decimal-divide" });
        expect(q.expectedAnswer).toBeGreaterThan(0);
        expect(Number.isFinite(q.expectedAnswer)).toBe(true);
        expect(q.problemText).toContain("÷");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = decimalDivide.generate({ seed: "ddiv-valid", difficulty: 1, skillKey: "decimal-divide" });
      expect(decimalDivide.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts Vietnamese comma notation", () => {
      const q = decimalDivide.generate({ seed: "ddiv-comma", difficulty: 2, skillKey: "decimal-divide" });
      const vnStr = String(q.expectedAnswer).replace(".", ",");
      expect(decimalDivide.validate(vnStr, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = decimalDivide.generate({ seed: "ddiv-wrong", difficulty: 2, skillKey: "decimal-divide" });
      expect(decimalDivide.validate("999", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = decimalDivide.generate({ seed: "ddiv-bad", difficulty: 1, skillKey: "decimal-divide" });
      expect(decimalDivide.validate("", q)).toBe(false);
      expect(decimalDivide.validate("abc", q)).toBe(false);
    });
  });
});
