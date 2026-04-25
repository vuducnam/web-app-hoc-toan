import { describe, it, expect } from "vitest";
import { fractionConcept } from "@/lib/generators/fractions/fraction-concept";

describe("fraction-concept generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "fconcept-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fraction-concept" };
      expect(fractionConcept.generate(params)).toEqual(fractionConcept.generate(params));
    });
  });

  describe("answer format", () => {
    it("returns fraction answerFormat", () => {
      const q = fractionConcept.generate({ seed: "fconcept-fmt", difficulty: 1, skillKey: "fraction-concept" });
      expect(q.answerFormat).toBe("fraction");
      expect(q.expectedAnswer).toHaveProperty("num");
      expect(q.expectedAnswer).toHaveProperty("den");
    });
  });

  describe("D1 — proper fraction", () => {
    it("num < den for all D1 questions", () => {
      for (let i = 0; i < 10; i++) {
        const q = fractionConcept.generate({ seed: `fconcept-d1-${i}`, difficulty: 1, skillKey: "fraction-concept" });
        expect(q.expectedAnswer.num).toBeLessThan(q.expectedAnswer.den);
      }
    });
  });

  describe("D2 — improper fraction", () => {
    it("num > den for all D2 questions", () => {
      for (let i = 0; i < 10; i++) {
        const q = fractionConcept.generate({ seed: `fconcept-d2-${i}`, difficulty: 2, skillKey: "fraction-concept" });
        expect(q.expectedAnswer.num).toBeGreaterThan(q.expectedAnswer.den);
      }
    });
  });

  describe("D3 — word problem", () => {
    it("answer is 1/b for word problem", () => {
      for (let i = 0; i < 5; i++) {
        const q = fractionConcept.generate({ seed: `fconcept-d3-${i}`, difficulty: 3, skillKey: "fraction-concept" });
        expect(q.expectedAnswer.num).toBe(1);
        expect(q.expectedAnswer.den).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionConcept.generate({ seed: "fconcept-valid", difficulty: 1, skillKey: "fraction-concept" });
      expect(fractionConcept.validate(`${q.expectedAnswer.num}/${q.expectedAnswer.den}`, q)).toBe(true);
    });

    it("accepts equivalent fraction", () => {
      const q = fractionConcept.generate({ seed: "fconcept-equiv", difficulty: 1, skillKey: "fraction-concept" });
      const { num, den } = q.expectedAnswer;
      expect(fractionConcept.validate(`${num * 2}/${den * 2}`, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = fractionConcept.generate({ seed: "fconcept-wrong", difficulty: 1, skillKey: "fraction-concept" });
      expect(fractionConcept.validate("7/99", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = fractionConcept.generate({ seed: "fconcept-bad", difficulty: 1, skillKey: "fraction-concept" });
      expect(fractionConcept.validate("", q)).toBe(false);
      expect(fractionConcept.validate("abc", q)).toBe(false);
    });
  });
});
