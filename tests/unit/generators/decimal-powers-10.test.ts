import { describe, it, expect } from "vitest";
import { decimalPowers10 } from "@/lib/generators/decimals/decimal-powers-10";

describe("decimal-powers-10 generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "dp10-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-powers-10" };
      const q1 = decimalPowers10.generate(params);
      const q2 = decimalPowers10.generate(params);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("answer format", () => {
    it("returns decimal format with number answer", () => {
      const q = decimalPowers10.generate({ seed: "dp10-fmt", difficulty: 1, skillKey: "decimal-powers-10" });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
      expect(Number.isFinite(q.expectedAnswer)).toBe(true);
    });
  });

  describe("D1 — multiply by 10 or 100", () => {
    it("answer is larger than operand", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalPowers10.generate({ seed: `dp10-d1-${i}`, difficulty: 1, skillKey: "decimal-powers-10" });
        expect(q.expectedAnswer).toBeGreaterThan(0);
        expect(q.problemText).toContain("×");
      }
    });
  });

  describe("D2 — divide by 10 or 100", () => {
    it("answer is smaller than a 2-digit number", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalPowers10.generate({ seed: `dp10-d2-${i}`, difficulty: 2, skillKey: "decimal-powers-10" });
        expect(q.expectedAnswer).toBeGreaterThan(0);
        expect(q.problemText).toContain("÷");
      }
    });
  });

  describe("D3 — × 0,1 / × 0,01 / ÷ 1000", () => {
    it("produces variety of operators over 20 seeds", () => {
      const texts = new Set(
        Array.from({ length: 20 }, (_, i) =>
          decimalPowers10.generate({ seed: `dp10-d3-${i}`, difficulty: 3, skillKey: "decimal-powers-10" }).problemText
        )
      );
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = decimalPowers10.generate({ seed: "dp10-valid", difficulty: 1, skillKey: "decimal-powers-10" });
      expect(decimalPowers10.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts Vietnamese comma notation", () => {
      const q = decimalPowers10.generate({ seed: "dp10-comma", difficulty: 2, skillKey: "decimal-powers-10" });
      const vnStr = String(q.expectedAnswer).replace(".", ",");
      expect(decimalPowers10.validate(vnStr, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = decimalPowers10.generate({ seed: "dp10-wrong", difficulty: 1, skillKey: "decimal-powers-10" });
      expect(decimalPowers10.validate("999", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = decimalPowers10.generate({ seed: "dp10-bad", difficulty: 1, skillKey: "decimal-powers-10" });
      expect(decimalPowers10.validate("", q)).toBe(false);
      expect(decimalPowers10.validate("abc", q)).toBe(false);
    });
  });
});
