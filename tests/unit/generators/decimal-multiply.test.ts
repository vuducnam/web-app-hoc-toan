import { describe, it, expect } from "vitest";
import { decimalMultiply } from "@/lib/generators/decimals/decimal-multiply";

describe("decimal-multiply generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "dm-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-multiply" };
      const q1 = decimalMultiply.generate(params);
      const q2 = decimalMultiply.generate(params);

      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = decimalMultiply.generate({ seed: "dm-valid", difficulty: 1, skillKey: "decimal-multiply" });
      expect(decimalMultiply.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = decimalMultiply.generate({ seed: "dm-invalid", difficulty: 2, skillKey: "decimal-multiply" });
      expect(decimalMultiply.validate("0", q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns decimal format", () => {
      const q = decimalMultiply.generate({ seed: "dm-fmt", difficulty: 1, skillKey: "decimal-multiply" });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });
});
