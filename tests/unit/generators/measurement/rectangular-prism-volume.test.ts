import { describe, it, expect } from "vitest";
import { rectangularPrismVolume } from "@/lib/generators/measurement/rectangular-prism-volume";

const SK = "rectangular-prism-volume";

describe("rectangular-prism-volume generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "vol-prism-seed", difficulty: d, skillKey: SK };
      const q1 = rectangularPrismVolume.generate(params);
      const q2 = rectangularPrismVolume.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = rectangularPrismVolume.generate({ ...base, seed: "s1" });
      const q2 = rectangularPrismVolume.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("difficulty constraints", () => {
    it("D1 sides in [2,9]", () => {
      for (let i = 0; i < 20; i++) {
        const q = rectangularPrismVolume.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        // Extract three dimension values from problemText
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        expect(nums).toHaveLength(3);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(2);
          expect(n).toBeLessThanOrEqual(9);
        }
      }
    });

    it("D2 sides in [5,15]", () => {
      for (let i = 0; i < 20; i++) {
        const q = rectangularPrismVolume.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        expect(nums).toHaveLength(3);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(5);
          expect(n).toBeLessThanOrEqual(15);
        }
      }
    });

    it("D3 sides in [10,25]", () => {
      for (let i = 0; i < 20; i++) {
        const q = rectangularPrismVolume.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        expect(nums).toHaveLength(3);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(10);
          expect(n).toBeLessThanOrEqual(25);
        }
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer equals a × b × c", () => {
      for (let i = 0; i < 20; i++) {
        const q = rectangularPrismVolume.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const nums = [...q.problemText.matchAll(/(\d+) cm/g)].map((m) => parseInt(m[1], 10));
        const computed = nums[0] * nums[1] * nums[2];
        expect(q.expectedAnswer).toBe(computed);
      }
    });
  });

  describe("problemText format", () => {
    it("contains Vietnamese dimension labels and V = ? cm³", () => {
      const q = rectangularPrismVolume.generate({ seed: "txt", difficulty: 1, skillKey: SK });
      expect(q.problemText).toContain("chiều dài");
      expect(q.problemText).toContain("chiều rộng");
      expect(q.problemText).toContain("chiều cao");
      expect(q.problemText).toContain("V = ? cm³");
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = rectangularPrismVolume.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(rectangularPrismVolume.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects off-by-one answer", () => {
      const q = rectangularPrismVolume.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(rectangularPrismVolume.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = rectangularPrismVolume.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(rectangularPrismVolume.validate("abc", q)).toBe(false);
      expect(rectangularPrismVolume.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = rectangularPrismVolume.generate({ seed: "meta", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBeGreaterThan(0);
    });
  });
});
