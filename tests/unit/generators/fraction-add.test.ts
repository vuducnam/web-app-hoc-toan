import { describe, it, expect } from "vitest";
import { fractionAdd } from "@/lib/generators/fractions/fraction-add";

describe("fraction-add generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "fa-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fraction-add" };
      const q1 = fractionAdd.generate(params);
      const q2 = fractionAdd.generate(params);

      expect(q1.expectedAnswer).toEqual(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionAdd.generate({ seed: "fa-valid", difficulty: 1, skillKey: "fraction-add" });
      const answerStr = `${q.expectedAnswer.num}/${q.expectedAnswer.den}`;
      expect(fractionAdd.validate(answerStr, q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = fractionAdd.generate({ seed: "fa-invalid", difficulty: 2, skillKey: "fraction-add" });
      expect(fractionAdd.validate("0/1", q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns fraction format", () => {
      const q = fractionAdd.generate({ seed: "fa-fmt", difficulty: 1, skillKey: "fraction-add" });
      expect(q.answerFormat).toBe("fraction");
      expect(q.expectedAnswer).toHaveProperty("num");
      expect(q.expectedAnswer).toHaveProperty("den");
    });
  });
});
