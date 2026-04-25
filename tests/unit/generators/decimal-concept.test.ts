import { describe, it, expect } from "vitest";
import { decimalConcept } from "@/lib/generators/decimals/decimal-concept";

describe("decimal-concept generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "dconcept-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-concept" };
      const q1 = decimalConcept.generate(params);
      const q2 = decimalConcept.generate(params);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("answer format", () => {
    it("returns decimal format with number answer", () => {
      const q = decimalConcept.generate({ seed: "dconcept-fmt", difficulty: 1, skillKey: "decimal-concept" });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });

  describe("D1 — fraction /10", () => {
    it("answer is between 0 and 1 exclusive", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalConcept.generate({ seed: `dconcept-d1-${i}`, difficulty: 1, skillKey: "decimal-concept" });
        expect(q.expectedAnswer).toBeGreaterThan(0);
        expect(q.expectedAnswer).toBeLessThan(1);
        expect(q.problemText).toContain("/10");
      }
    });
  });

  describe("D2 — fraction /100", () => {
    it("answer is between 0 and 1 exclusive", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalConcept.generate({ seed: `dconcept-d2-${i}`, difficulty: 2, skillKey: "decimal-concept" });
        expect(q.expectedAnswer).toBeGreaterThan(0);
        expect(q.expectedAnswer).toBeLessThan(1);
        expect(q.problemText).toContain("/100");
      }
    });
  });

  describe("D3 — mixed form", () => {
    it("answer is >= 1 (whole + fractional part)", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalConcept.generate({ seed: `dconcept-d3-${i}`, difficulty: 3, skillKey: "decimal-concept" });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(1);
        expect(q.problemText).toContain("và");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = decimalConcept.generate({ seed: "dconcept-valid", difficulty: 1, skillKey: "decimal-concept" });
      expect(decimalConcept.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts Vietnamese comma notation", () => {
      const q = decimalConcept.generate({ seed: "dconcept-comma", difficulty: 1, skillKey: "decimal-concept" });
      const vnStr = String(q.expectedAnswer).replace(".", ",");
      expect(decimalConcept.validate(vnStr, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = decimalConcept.generate({ seed: "dconcept-wrong", difficulty: 2, skillKey: "decimal-concept" });
      expect(decimalConcept.validate("99", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = decimalConcept.generate({ seed: "dconcept-bad", difficulty: 1, skillKey: "decimal-concept" });
      expect(decimalConcept.validate("", q)).toBe(false);
      expect(decimalConcept.validate("abc", q)).toBe(false);
    });
  });
});
