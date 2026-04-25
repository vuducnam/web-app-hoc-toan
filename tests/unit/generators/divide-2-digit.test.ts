import { describe, it, expect } from "vitest";
import { divide2Digit } from "@/lib/generators/arithmetic/divide-2-digit";

describe("divide-2-digit generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "div-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "divide-2-digit" };
      const q1 = divide2Digit.generate(params);
      const q2 = divide2Digit.generate(params);

      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = divide2Digit.generate({ seed: "div-valid", difficulty: 1, skillKey: "divide-2-digit" });
      expect(divide2Digit.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = divide2Digit.generate({ seed: "div-invalid", difficulty: 2, skillKey: "divide-2-digit" });
      expect(divide2Digit.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns numeric format", () => {
      const q = divide2Digit.generate({ seed: "div-fmt", difficulty: 1, skillKey: "divide-2-digit" });
      expect(q.answerFormat).toBe("numeric");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });
});
