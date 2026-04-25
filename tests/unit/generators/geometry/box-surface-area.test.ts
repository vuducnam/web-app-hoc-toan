import { describe, it, expect } from "vitest";
import { boxSurfaceArea } from "@/lib/generators/geometry/box-surface-area";

const SK = "box-surface-area";

describe("box-surface-area generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "box-det-seed", difficulty: d, skillKey: SK };
      const q1 = boxSurfaceArea.generate(params);
      const q2 = boxSurfaceArea.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const answers = new Set(
        Array.from({ length: 10 }, (_, i) =>
          boxSurfaceArea.generate({ ...base, seed: `variety-${i}` }).expectedAnswer
        )
      );
      expect(answers.size).toBeGreaterThan(1);
    });
  });

  describe("answer format", () => {
    it.each([1, 2, 3] as const)("returns numeric format at difficulty %s", (d) => {
      const q = boxSurfaceArea.generate({ seed: "fmt", difficulty: d, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
      expect(typeof q.expectedAnswer).toBe("number");
      expect(Number.isInteger(q.expectedAnswer)).toBe(true);
    });
  });

  describe("integer answers across 20 samples per difficulty", () => {
    it.each([1, 2, 3] as const)("all answers integer at difficulty %s", (d) => {
      for (let i = 0; i < 20; i++) {
        const q = boxSurfaceArea.generate({ seed: `int-check-${d}-${i}`, difficulty: d, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThan(0);
      }
    });
  });

  describe("range constraints", () => {
    it("D1: sides in [3,8]", () => {
      for (let i = 0; i < 20; i++) {
        const q = boxSurfaceArea.generate({ seed: `range-d1-${i}`, difficulty: 1, skillKey: SK });
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        expect(nums).toHaveLength(3);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(3);
          expect(n).toBeLessThanOrEqual(8);
        }
      }
    });

    it("D2: sides in [5,15]", () => {
      for (let i = 0; i < 20; i++) {
        const q = boxSurfaceArea.generate({ seed: `range-d2-${i}`, difficulty: 2, skillKey: SK });
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        expect(nums).toHaveLength(3);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(5);
          expect(n).toBeLessThanOrEqual(15);
        }
      }
    });

    it("D3: sides in [8,20]", () => {
      for (let i = 0; i < 20; i++) {
        const q = boxSurfaceArea.generate({ seed: `range-d3-${i}`, difficulty: 3, skillKey: SK });
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        expect(nums).toHaveLength(3);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(8);
          expect(n).toBeLessThanOrEqual(20);
        }
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer = 2(ab + bc + ca)", () => {
      for (let i = 0; i < 20; i++) {
        const q = boxSurfaceArea.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        const [a, b, c] = nums;
        expect(q.expectedAnswer).toBe(2 * (a * b + b * c + c * a));
      }
    });
  });

  describe("problemText format", () => {
    it("contains Vietnamese box labels", () => {
      const q = boxSurfaceArea.generate({ seed: "txt", difficulty: 1, skillKey: SK });
      expect(q.problemText).toContain("Hình hộp chữ nhật");
      expect(q.problemText).toContain("chiều dài");
      expect(q.problemText).toContain("chiều rộng");
      expect(q.problemText).toContain("chiều cao");
      expect(q.problemText).toContain("cm²");
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = boxSurfaceArea.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(boxSurfaceArea.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects off-by-one answer", () => {
      const q = boxSurfaceArea.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(boxSurfaceArea.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = boxSurfaceArea.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(boxSurfaceArea.validate("abc", q)).toBe(false);
      expect(boxSurfaceArea.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = boxSurfaceArea.generate({ seed: "meta", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBe(60);
    });
  });
});
