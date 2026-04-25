import { describe, it, expect } from "vitest";
import { decimalSubtract } from "@/lib/generators/decimals/decimal-subtract";

describe("decimal-subtract generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "ds-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-subtract" };
      const q1 = decimalSubtract.generate(params);
      const q2 = decimalSubtract.generate(params);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("answer format", () => {
    it("returns decimal format with number answer", () => {
      const q = decimalSubtract.generate({ seed: "ds-fmt", difficulty: 1, skillKey: "decimal-subtract" });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });

  describe("invariants", () => {
    it("answer is always >= 0", () => {
      for (let i = 0; i < 15; i++) {
        const q = decimalSubtract.generate({ seed: `ds-inv-${i}`, difficulty: (((i % 3) + 1) as 1 | 2 | 3), skillKey: "decimal-subtract" });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(0);
      }
    });

    it("problemText contains subtraction sign", () => {
      const q = decimalSubtract.generate({ seed: "ds-text", difficulty: 1, skillKey: "decimal-subtract" });
      expect(q.problemText).toContain("-");
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = decimalSubtract.generate({ seed: "ds-valid", difficulty: 1, skillKey: "decimal-subtract" });
      expect(decimalSubtract.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts Vietnamese comma notation", () => {
      const q = decimalSubtract.generate({ seed: "ds-comma", difficulty: 1, skillKey: "decimal-subtract" });
      const vnStr = String(q.expectedAnswer).replace(".", ",");
      expect(decimalSubtract.validate(vnStr, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = decimalSubtract.generate({ seed: "ds-wrong", difficulty: 2, skillKey: "decimal-subtract" });
      expect(decimalSubtract.validate(String(q.expectedAnswer + 1), q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = decimalSubtract.generate({ seed: "ds-bad", difficulty: 1, skillKey: "decimal-subtract" });
      expect(decimalSubtract.validate("", q)).toBe(false);
      expect(decimalSubtract.validate("abc", q)).toBe(false);
    });
  });
});
