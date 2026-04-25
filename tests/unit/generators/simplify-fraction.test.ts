import { describe, it, expect } from "vitest";
import { simplifyFraction } from "@/lib/generators/fractions/simplify-fraction";

describe("simplify-fraction generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "simp-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "simplify-fraction" };
      const q1 = simplifyFraction.generate(params);
      const q2 = simplifyFraction.generate(params);

      expect(q1.expectedAnswer).toEqual(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer in reduced form", () => {
      const q = simplifyFraction.generate({ seed: "simp-valid", difficulty: 1, skillKey: "simplify-fraction" });
      const answerStr = `${q.expectedAnswer.num}/${q.expectedAnswer.den}`;
      expect(simplifyFraction.validate(answerStr, q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = simplifyFraction.generate({ seed: "simp-invalid", difficulty: 2, skillKey: "simplify-fraction" });
      expect(simplifyFraction.validate("1/2", q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns fraction format with metadata", () => {
      const q = simplifyFraction.generate({ seed: "simp-fmt", difficulty: 1, skillKey: "simplify-fraction" });
      expect(q.answerFormat).toBe("fraction");
      expect(q.expectedAnswer).toHaveProperty("num");
      expect(q.expectedAnswer).toHaveProperty("den");
      expect(q.metadata.difficulty).toBe(1);
    });
  });
});
