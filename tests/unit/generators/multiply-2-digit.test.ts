import { describe, it, expect } from "vitest";
import { multiply2Digit } from "@/lib/generators/arithmetic/multiply-2-digit";

describe("multiply-2-digit generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "mult-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "multiply-2-digit" };

      const q1 = multiply2Digit.generate(params);
      const q2 = multiply2Digit.generate(params);

      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = multiply2Digit.generate({ seed: "mult-valid", difficulty: 1, skillKey: "multiply-2-digit" });
      expect(multiply2Digit.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = multiply2Digit.generate({ seed: "mult-invalid", difficulty: 2, skillKey: "multiply-2-digit" });
      expect(multiply2Digit.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });
  });

  describe("difficulty constraints", () => {
    it("difficulty 1: 2-digit × 1-digit", () => {
      for (let i = 0; i < 10; i++) {
        const q = multiply2Digit.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: "multiply-2-digit" });
        const match = q.problemText.match(/(\d+)\s*×\s*(\d+)/);
        const [, a, b] = match!;
        expect(parseInt(a, 10)).toBeGreaterThanOrEqual(10);
        expect(parseInt(a, 10)).toBeLessThanOrEqual(99);
        expect(parseInt(b, 10)).toBeGreaterThanOrEqual(2);
        expect(parseInt(b, 10)).toBeLessThanOrEqual(9);
      }
    });

    it("difficulty 2: 2-digit × 2-digit", () => {
      for (let i = 0; i < 10; i++) {
        const q = multiply2Digit.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: "multiply-2-digit" });
        const match = q.problemText.match(/(\d+)\s*×\s*(\d+)/);
        const [, a, b] = match!;
        expect(parseInt(a, 10)).toBeGreaterThanOrEqual(10);
        expect(parseInt(a, 10)).toBeLessThanOrEqual(99);
        expect(parseInt(b, 10)).toBeGreaterThanOrEqual(10);
        expect(parseInt(b, 10)).toBeLessThanOrEqual(99);
      }
    });

    it("difficulty 3: 3-digit × 2-digit", () => {
      for (let i = 0; i < 10; i++) {
        const q = multiply2Digit.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: "multiply-2-digit" });
        const match = q.problemText.match(/(\d+)\s*×\s*(\d+)/);
        const [, a, b] = match!;
        expect(parseInt(a, 10)).toBeGreaterThanOrEqual(100);
        expect(parseInt(a, 10)).toBeLessThanOrEqual(999);
        expect(parseInt(b, 10)).toBeGreaterThanOrEqual(10);
        expect(parseInt(b, 10)).toBeLessThanOrEqual(99);
      }
    });
  });

  describe("answer format", () => {
    it("returns numeric format with metadata", () => {
      const q = multiply2Digit.generate({ seed: "meta", difficulty: 2, skillKey: "multiply-2-digit" });
      expect(q.answerFormat).toBe("numeric");
      expect(typeof q.expectedAnswer).toBe("number");
      expect(q.metadata.difficulty).toBe(2);
    });
  });
});
