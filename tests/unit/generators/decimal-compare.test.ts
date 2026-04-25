import { describe, it, expect } from "vitest";
import { decimalCompare } from "@/lib/generators/decimals/decimal-compare";

describe("decimal-compare generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "dc-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-compare" };
      expect(decimalCompare.generate(params)).toEqual(decimalCompare.generate(params));
    });
  });

  describe("answer format", () => {
    it("returns multiple-choice with 3 choices", () => {
      const q = decimalCompare.generate({ seed: "dc-fmt", difficulty: 1, skillKey: "decimal-compare" });
      expect(q.answerFormat).toBe("multiple-choice");
      expect(q.choices).toEqual(["<", "=", ">"]);
    });

    it("expectedAnswer is always one of the choices", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalCompare.generate({ seed: `dc-choice-${i}`, difficulty: (((i % 3) + 1) as 1 | 2 | 3), skillKey: "decimal-compare" });
        expect(["<", "=", ">"]).toContain(q.expectedAnswer);
      }
    });
  });

  describe("D2 equal case", () => {
    it("produces = for trailing-zero pairs (0,5 vs 0,50)", () => {
      const results = Array.from({ length: 20 }, (_, i) =>
        decimalCompare.generate({ seed: `dc-d2-${i}`, difficulty: 2, skillKey: "decimal-compare" })
      );
      const hasEqual = results.some((q) => q.expectedAnswer === "=");
      expect(hasEqual).toBe(true);
    });
  });

  describe("D3 equal case", () => {
    it("produces = answer for some D3 seeds", () => {
      const results = Array.from({ length: 20 }, (_, i) =>
        decimalCompare.generate({ seed: `dc-d3-${i}`, difficulty: 3, skillKey: "decimal-compare" })
      );
      expect(results.some((q) => q.expectedAnswer === "=")).toBe(true);
    });
  });

  describe("validation", () => {
    it("accepts correct symbol", () => {
      const q = decimalCompare.generate({ seed: "dc-valid", difficulty: 1, skillKey: "decimal-compare" });
      expect(decimalCompare.validate(q.expectedAnswer as string, q)).toBe(true);
    });

    it("rejects wrong symbol", () => {
      const q = decimalCompare.generate({ seed: "dc-wrong", difficulty: 1, skillKey: "decimal-compare" });
      const wrong = (q.expectedAnswer as string) === "<" ? ">" : "<";
      expect(decimalCompare.validate(wrong, q)).toBe(false);
    });

    it("rejects invalid input", () => {
      const q = decimalCompare.generate({ seed: "dc-bad", difficulty: 1, skillKey: "decimal-compare" });
      expect(decimalCompare.validate("", q)).toBe(false);
      expect(decimalCompare.validate("!=", q)).toBe(false);
    });
  });
});
