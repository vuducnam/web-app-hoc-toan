import { describe, it, expect } from "vitest";
import { percentOfWhole } from "@/lib/generators/percent/percent-of-whole";

describe("percent-of-whole generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "pow-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "percent-of-whole" };
      const q1 = percentOfWhole.generate(params);
      const q2 = percentOfWhole.generate(params);

      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = percentOfWhole.generate({ seed: "pow-valid", difficulty: 1, skillKey: "percent-of-whole" });
      expect(percentOfWhole.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = percentOfWhole.generate({ seed: "pow-invalid", difficulty: 2, skillKey: "percent-of-whole" });
      expect(percentOfWhole.validate("0", q)).toBe(false);
    });
  });

  describe("answer format", () => {
    it("returns numeric format", () => {
      const q = percentOfWhole.generate({ seed: "pow-fmt", difficulty: 1, skillKey: "percent-of-whole" });
      expect(q.answerFormat).toBe("numeric");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });
});
