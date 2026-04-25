import { describe, it, expect } from "vitest";
import { multiplyDividePowers10 } from "@/lib/generators/arithmetic/multiply-divide-powers-10";

const SK = "g4-multiply-divide-powers-10";

describe("multiply-divide-powers-10 generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = multiplyDividePowers10.generate(p);
      const q2 = multiplyDividePowers10.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = multiplyDividePowers10.generate({ ...base, seed: "s1" });
      const q2 = multiplyDividePowers10.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("D1 constraints", () => {
    it("D1 uses × operator with power 10 or 100, base in [2,99]", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiplyDividePowers10.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/^(\d+) (×|÷) (\d+)/);
        expect(match).toBeTruthy();
        const base = parseInt(match![1], 10);
        const op = match![2];
        const power = parseInt(match![3], 10);
        expect(op).toBe("×");
        expect([10, 100]).toContain(power);
        expect(base).toBeGreaterThanOrEqual(2);
        expect(base).toBeLessThanOrEqual(99);
      }
    });
  });

  describe("D2 constraints", () => {
    it("D2 uses × 1000 or ÷ 10, division is exact", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiplyDividePowers10.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) (×|÷) (\d+)/);
        expect(match).toBeTruthy();
        const base = parseInt(match![1], 10);
        const op = match![2];
        const power = parseInt(match![3], 10);
        if (op === "×") {
          expect(power).toBe(1_000);
        } else {
          expect(power).toBe(10);
          expect(base % 10).toBe(0); // exact division
        }
      }
    });
  });

  describe("D3 constraints", () => {
    it("D3 uses powers from {10, 100, 1000}, division is exact", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiplyDividePowers10.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/^(\d+) (×|÷) (\d+)/);
        expect(match).toBeTruthy();
        const base = parseInt(match![1], 10);
        const op = match![2];
        const power = parseInt(match![3], 10);
        expect([10, 100, 1_000]).toContain(power);
        if (op === "÷") {
          expect(base % power).toBe(0); // exact division
        }
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer matches operation result", () => {
      for (let i = 0; i < 20; i++) {
        const q = multiplyDividePowers10.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/^(\d+) (×|÷) (\d+)/);
        const base = parseInt(match![1], 10);
        const op = match![2];
        const power = parseInt(match![3], 10);
        const expected = op === "×" ? base * power : base / power;
        expect(q.expectedAnswer).toBe(expected);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = multiplyDividePowers10.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(multiplyDividePowers10.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = multiplyDividePowers10.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(multiplyDividePowers10.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects empty and non-numeric", () => {
      const q = multiplyDividePowers10.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(multiplyDividePowers10.validate("", q)).toBe(false);
      expect(multiplyDividePowers10.validate("abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 30 and answerFormat is numeric", () => {
      const q = multiplyDividePowers10.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(30);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
