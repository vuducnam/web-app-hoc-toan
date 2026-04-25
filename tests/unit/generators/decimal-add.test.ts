import { describe, it, expect } from "vitest";
import { decimalAdd } from "@/lib/generators/decimals/decimal-add";

describe("decimal-add generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "da-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-add" };
      const q1 = decimalAdd.generate(params);
      const q2 = decimalAdd.generate(params);

      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = decimalAdd.generate({ seed: "da-valid", difficulty: 1, skillKey: "decimal-add" });
      expect(decimalAdd.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = decimalAdd.generate({ seed: "da-invalid", difficulty: 2, skillKey: "decimal-add" });
      expect(decimalAdd.validate((q.expectedAnswer + 0.1).toString(), q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns decimal format", () => {
      const q = decimalAdd.generate({ seed: "da-fmt", difficulty: 1, skillKey: "decimal-add" });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });
});
