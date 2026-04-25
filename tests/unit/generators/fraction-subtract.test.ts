import { describe, it, expect } from "vitest";
import { fractionSubtract } from "@/lib/generators/fractions/fraction-subtract";

describe("fraction-subtract generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "fs-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fraction-subtract" };
      const q1 = fractionSubtract.generate(params);
      const q2 = fractionSubtract.generate(params);

      expect(q1.expectedAnswer).toEqual(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionSubtract.generate({ seed: "fs-valid", difficulty: 1, skillKey: "fraction-subtract" });
      const answerStr = `${q.expectedAnswer.num}/${q.expectedAnswer.den}`;
      expect(fractionSubtract.validate(answerStr, q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = fractionSubtract.generate({ seed: "fs-invalid", difficulty: 2, skillKey: "fraction-subtract" });
      expect(fractionSubtract.validate("0/1", q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns fraction format", () => {
      const q = fractionSubtract.generate({ seed: "fs-fmt", difficulty: 1, skillKey: "fraction-subtract" });
      expect(q.answerFormat).toBe("fraction");
      expect(q.expectedAnswer).toHaveProperty("num");
      expect(q.expectedAnswer).toHaveProperty("den");
    });
  });
});
