import { describe, it, expect } from "vitest";
import { fractionCompare } from "@/lib/generators/fractions/fraction-compare";

describe("fraction-compare generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "fc-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fraction-compare" };
      expect(fractionCompare.generate(params)).toEqual(fractionCompare.generate(params));
    });
  });

  describe("answer format", () => {
    it("returns multiple-choice with 3 choices", () => {
      const q = fractionCompare.generate({ seed: "fc-fmt", difficulty: 1, skillKey: "fraction-compare" });
      expect(q.answerFormat).toBe("multiple-choice");
      expect(q.choices).toEqual(["<", "=", ">"]);
    });

    it("expectedAnswer is one of the choices", () => {
      for (let i = 0; i < 10; i++) {
        const q = fractionCompare.generate({ seed: `fc-choice-${i}`, difficulty: (((i % 3) + 1) as 1 | 2 | 3), skillKey: "fraction-compare" });
        expect(["<", "=", ">"]).toContain(q.expectedAnswer);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionCompare.generate({ seed: "fc-valid", difficulty: 1, skillKey: "fraction-compare" });
      expect(fractionCompare.validate(q.expectedAnswer as string, q)).toBe(true);
    });

    it("rejects wrong symbol", () => {
      const q = fractionCompare.generate({ seed: "fc-wrong", difficulty: 1, skillKey: "fraction-compare" });
      const wrong = (q.expectedAnswer as string) === "<" ? ">" : "<";
      expect(fractionCompare.validate(wrong, q)).toBe(false);
    });

    it("rejects invalid input", () => {
      const q = fractionCompare.generate({ seed: "fc-bad", difficulty: 1, skillKey: "fraction-compare" });
      expect(fractionCompare.validate("", q)).toBe(false);
      expect(fractionCompare.validate("!=", q)).toBe(false);
    });
  });

  describe("D3 equal case", () => {
    it("produces = answer for some D3 seeds", () => {
      const results = Array.from({ length: 20 }, (_, i) =>
        fractionCompare.generate({ seed: `fc-d3-${i}`, difficulty: 3, skillKey: "fraction-compare" })
      );
      const hasEqual = results.some((q) => q.expectedAnswer === "=");
      expect(hasEqual).toBe(true);
    });
  });
});
