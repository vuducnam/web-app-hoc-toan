import { describe, it, expect } from "vitest";
import { divide1Digit } from "@/lib/generators/arithmetic/divide-1-digit";

const SK = "g4-divide-1-digit";

describe("divide-1-digit generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = divide1Digit.generate(p);
      const q2 = divide1Digit.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = divide1Digit.generate({ ...base, seed: "s1" });
      const q2 = divide1Digit.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1: 2-digit ÷ 1-digit, exact division (no remainder)", () => {
      for (let i = 0; i < 20; i++) {
        const q = divide1Digit.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/^(\d+) ÷ (\d+)/);
        expect(match).toBeTruthy();
        const dividend = parseInt(match![1], 10);
        const divisor = parseInt(match![2], 10);
        expect(dividend).toBeGreaterThanOrEqual(20);  // min quotient(10) × min divisor(2)
        expect(dividend).toBeLessThanOrEqual(891);    // max quotient(99) × max divisor(9)
        expect(divisor).toBeGreaterThanOrEqual(2);
        expect(divisor).toBeLessThanOrEqual(9);
        expect(dividend % divisor).toBe(0);          // exact division
      }
    });

    it("D2: 3-digit ÷ 1-digit, exact division", () => {
      for (let i = 0; i < 20; i++) {
        const q = divide1Digit.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) ÷ (\d+)/);
        const dividend = parseInt(match![1], 10);
        const divisor = parseInt(match![2], 10);
        expect(dividend).toBeGreaterThanOrEqual(200); // min quotient(100) × min divisor(2)
        expect(dividend).toBeLessThanOrEqual(8_991);  // max quotient(999) × max divisor(9)
        expect(divisor).toBeGreaterThanOrEqual(2);
        expect(divisor).toBeLessThanOrEqual(9);
        expect(dividend % divisor).toBe(0);
      }
    });

    it("D3: 4-digit dividend, divisor in [2,9]", () => {
      for (let i = 0; i < 20; i++) {
        const q = divide1Digit.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/^(\d+) ÷ (\d+)/);
        const dividend = parseInt(match![1], 10);
        const divisor = parseInt(match![2], 10);
        expect(dividend).toBeGreaterThanOrEqual(1_000);
        expect(dividend).toBeLessThanOrEqual(9_999);
        expect(divisor).toBeGreaterThanOrEqual(2);
        expect(divisor).toBeLessThanOrEqual(9);
      }
    });
  });

  describe("D3 remainder behaviour", () => {
    it("expectedAnswer is integer quotient (floor division)", () => {
      for (let i = 0; i < 20; i++) {
        const q = divide1Digit.generate({ seed: `d3r-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/^(\d+) ÷ (\d+)/);
        const dividend = parseInt(match![1], 10);
        const divisor = parseInt(match![2], 10);
        expect(q.expectedAnswer).toBe(Math.floor(dividend / divisor));
      }
    });
  });

  describe("validation", () => {
    it("accepts correct numeric answer", () => {
      const q = divide1Digit.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(divide1Digit.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts 'quotient dư remainder' form for D3", () => {
      for (let i = 0; i < 30; i++) {
        const q = divide1Digit.generate({ seed: `du-${i}`, difficulty: 3, skillKey: SK });
        const meta = q.metadata as typeof q.metadata & { remainder: number };
        const quotient = q.expectedAnswer as number;
        const remainder = meta.remainder;
        // Always accept plain quotient
        expect(divide1Digit.validate(String(quotient), q)).toBe(true);
        // If remainder is non-zero, test "dư" form
        if (remainder > 0) {
          expect(divide1Digit.validate(`${quotient} dư ${remainder}`, q)).toBe(true);
          // Wrong remainder should fail
          expect(divide1Digit.validate(`${quotient} dư ${remainder + 1}`, q)).toBe(false);
        }
      }
    });

    it("rejects wrong quotient in 'dư' form", () => {
      const q = divide1Digit.generate({ seed: "du-wrong-q", difficulty: 3, skillKey: SK });
      const meta = q.metadata as typeof q.metadata & { remainder: number };
      const wrongQ = (q.expectedAnswer as number) + 1;
      expect(divide1Digit.validate(`${wrongQ} dư ${meta.remainder}`, q)).toBe(false);
    });

    it("rejects wrong plain answer", () => {
      const q = divide1Digit.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(divide1Digit.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects empty and garbage", () => {
      const q = divide1Digit.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(divide1Digit.validate("", q)).toBe(false);
      expect(divide1Digit.validate("abc", q)).toBe(false);
      expect(divide1Digit.validate("12 dư abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 60 and answerFormat is numeric", () => {
      const q = divide1Digit.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(60);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
