import { describe, it, expect } from "vitest";
import { decimalRounding } from "@/lib/generators/decimals/decimal-rounding";

describe("decimal-rounding generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "dr-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "decimal-rounding" };
      const q1 = decimalRounding.generate(params);
      const q2 = decimalRounding.generate(params);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("answer format", () => {
    it("returns decimal format", () => {
      const q = decimalRounding.generate({ seed: "dr-fmt", difficulty: 1, skillKey: "decimal-rounding" });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });

  describe("D1 — round to integer", () => {
    it("answer has no decimal part", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalRounding.generate({ seed: `dr-d1-${i}`, difficulty: 1, skillKey: "decimal-rounding" });
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.problemText).toContain("hàng đơn vị");
      }
    });
  });

  describe("D2 — round to 1 dp", () => {
    it("answer has at most 1 decimal place", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalRounding.generate({ seed: `dr-d2-${i}`, difficulty: 2, skillKey: "decimal-rounding" });
        const decimalPart = String(q.expectedAnswer).split(".")[1] ?? "";
        expect(decimalPart.length).toBeLessThanOrEqual(1);
        expect(q.problemText).toContain("hàng phần mười");
      }
    });
  });

  describe("D3 — round to 2 dp", () => {
    it("answer has at most 2 decimal places", () => {
      for (let i = 0; i < 10; i++) {
        const q = decimalRounding.generate({ seed: `dr-d3-${i}`, difficulty: 3, skillKey: "decimal-rounding" });
        const decimalPart = String(q.expectedAnswer).split(".")[1] ?? "";
        expect(decimalPart.length).toBeLessThanOrEqual(2);
        expect(q.problemText).toContain("hàng phần trăm");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = decimalRounding.generate({ seed: "dr-valid", difficulty: 2, skillKey: "decimal-rounding" });
      expect(decimalRounding.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts Vietnamese comma notation", () => {
      const q = decimalRounding.generate({ seed: "dr-comma", difficulty: 2, skillKey: "decimal-rounding" });
      const vnStr = String(q.expectedAnswer).replace(".", ",");
      expect(decimalRounding.validate(vnStr, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = decimalRounding.generate({ seed: "dr-wrong", difficulty: 2, skillKey: "decimal-rounding" });
      expect(decimalRounding.validate(String(q.expectedAnswer + 1), q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = decimalRounding.generate({ seed: "dr-bad", difficulty: 1, skillKey: "decimal-rounding" });
      expect(decimalRounding.validate("", q)).toBe(false);
      expect(decimalRounding.validate("abc", q)).toBe(false);
    });
  });
});
