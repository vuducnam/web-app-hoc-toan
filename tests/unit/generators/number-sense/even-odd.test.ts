import { describe, it, expect } from "vitest";
import { evenOdd } from "@/lib/generators/number-sense/even-odd";

const SK = "g4-even-odd";

describe("even-odd generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = evenOdd.generate(p);
      const q2 = evenOdd.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = evenOdd.generate({ ...base, seed: "s1" });
      const q2 = evenOdd.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1 numbers in [1, 99]", () => {
      for (let i = 0; i < 20; i++) {
        const q = evenOdd.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/Số (\d+)/);
        expect(match).toBeTruthy();
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(99);
      }
    });

    it("D2 numbers in [100, 9999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = evenOdd.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/Số (\d+)/);
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(100);
        expect(n).toBeLessThanOrEqual(9_999);
      }
    });

    it("D3 numbers in [10000, 999999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = evenOdd.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/Số (\d+)/);
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(10_000);
        expect(n).toBeLessThanOrEqual(999_999);
      }
    });
  });

  describe("correctness of even/odd classification", () => {
    it("expectedAnswer matches actual even/odd of the number", () => {
      for (let i = 0; i < 20; i++) {
        const q = evenOdd.generate({ seed: `class-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/Số (\d+)/);
        const n = parseInt(match![1], 10);
        const expected = n % 2 === 0 ? "Số chẵn" : "Số lẻ";
        expect(q.expectedAnswer).toBe(expected);
      }
    });
  });

  describe("choices", () => {
    it("always provides exactly 2 choices: Số chẵn and Số lẻ", () => {
      const q = evenOdd.generate({ seed: "choices-test", difficulty: 1, skillKey: SK });
      expect(q.choices).toEqual(["Số chẵn", "Số lẻ"]);
    });
  });

  describe("validation", () => {
    it("accepts correct answer (exact match)", () => {
      const q = evenOdd.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(evenOdd.validate(q.expectedAnswer as string, q)).toBe(true);
    });

    it("accepts correct answer case-insensitively", () => {
      const q = evenOdd.generate({ seed: "val-case", difficulty: 1, skillKey: SK });
      const lower = (q.expectedAnswer as string).toLowerCase();
      expect(evenOdd.validate(lower, q)).toBe(true);
    });

    it("rejects wrong choice", () => {
      const q = evenOdd.generate({ seed: "val-wrong", difficulty: 1, skillKey: SK });
      const wrong = q.expectedAnswer === "Số chẵn" ? "Số lẻ" : "Số chẵn";
      expect(evenOdd.validate(wrong, q)).toBe(false);
    });

    it("rejects empty string", () => {
      const q = evenOdd.generate({ seed: "val-empty", difficulty: 1, skillKey: SK });
      expect(evenOdd.validate("", q)).toBe(false);
    });

    it("rejects garbage", () => {
      const q = evenOdd.generate({ seed: "val-garbage", difficulty: 1, skillKey: SK });
      expect(evenOdd.validate("xyz", q)).toBe(false);
    });
  });

  describe("answer format and metadata", () => {
    it("answerFormat is multiple-choice", () => {
      const q = evenOdd.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("multiple-choice");
    });

    it("metadata fields are correct", () => {
      const q = evenOdd.generate({ seed: "meta-1", difficulty: 3, skillKey: SK });
      expect(q.metadata.difficulty).toBe(3);
      expect(q.metadata.timeEstimateSec).toBe(30);
      expect(q.metadata.skillKey).toBe(SK);
    });
  });
});
