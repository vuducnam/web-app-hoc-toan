import { describe, it, expect } from "vitest";
import { cylinderVolume } from "@/lib/generators/geometry/cylinder-volume";

const SK = "cylinder-volume";
const PI = 3.14;

describe("cylinder-volume generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "cyl-det-seed", difficulty: d, skillKey: SK };
      const q1 = cylinderVolume.generate(params);
      const q2 = cylinderVolume.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const answers = new Set(
        Array.from({ length: 10 }, (_, i) =>
          cylinderVolume.generate({ ...base, seed: `variety-${i}` }).expectedAnswer
        )
      );
      expect(answers.size).toBeGreaterThan(1);
    });
  });

  describe("answer format", () => {
    it.each([1, 2, 3] as const)("returns decimal format at difficulty %s", (d) => {
      const q = cylinderVolume.generate({ seed: "fmt", difficulty: d, skillKey: SK });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });

  describe("range constraints", () => {
    it("D1: r in [2,5], h in [4,10]", () => {
      for (let i = 0; i < 20; i++) {
        const q = cylinderVolume.generate({ seed: `range-d1-${i}`, difficulty: 1, skillKey: SK });
        const rMatch = q.problemText.match(/bán kính đáy (\d+) cm/);
        const hMatch = q.problemText.match(/chiều cao (\d+) cm/);
        expect(rMatch).not.toBeNull();
        expect(hMatch).not.toBeNull();
        const r = parseInt(rMatch![1], 10);
        const h = parseInt(hMatch![1], 10);
        expect(r).toBeGreaterThanOrEqual(2); expect(r).toBeLessThanOrEqual(5);
        expect(h).toBeGreaterThanOrEqual(4); expect(h).toBeLessThanOrEqual(10);
      }
    });

    it("D2: r in [3,8], h in [5,15]", () => {
      for (let i = 0; i < 20; i++) {
        const q = cylinderVolume.generate({ seed: `range-d2-${i}`, difficulty: 2, skillKey: SK });
        const rMatch = q.problemText.match(/bán kính đáy (\d+) cm/);
        const hMatch = q.problemText.match(/chiều cao (\d+) cm/);
        const r = parseInt(rMatch![1], 10);
        const h = parseInt(hMatch![1], 10);
        expect(r).toBeGreaterThanOrEqual(3); expect(r).toBeLessThanOrEqual(8);
        expect(h).toBeGreaterThanOrEqual(5); expect(h).toBeLessThanOrEqual(15);
      }
    });

    it("D3: r in [4,12], h in [6,20]", () => {
      for (let i = 0; i < 20; i++) {
        const q = cylinderVolume.generate({ seed: `range-d3-${i}`, difficulty: 3, skillKey: SK });
        const rMatch = q.problemText.match(/bán kính đáy (\d+) cm/);
        const hMatch = q.problemText.match(/chiều cao (\d+) cm/);
        const r = parseInt(rMatch![1], 10);
        const h = parseInt(hMatch![1], 10);
        expect(r).toBeGreaterThanOrEqual(4); expect(r).toBeLessThanOrEqual(12);
        expect(h).toBeGreaterThanOrEqual(6); expect(h).toBeLessThanOrEqual(20);
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer = π × r² × h rounded to 2dp", () => {
      for (let i = 0; i < 20; i++) {
        const q = cylinderVolume.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const rMatch = q.problemText.match(/bán kính đáy (\d+) cm/);
        const hMatch = q.problemText.match(/chiều cao (\d+) cm/);
        const r = parseInt(rMatch![1], 10);
        const h = parseInt(hMatch![1], 10);
        const expected = Math.round(PI * r * r * h * 100) / 100;
        expect(q.expectedAnswer).toBeCloseTo(expected, 5);
      }
    });

    it("answer is positive for all samples", () => {
      for (let i = 0; i < 20; i++) {
        const q = cylinderVolume.generate({ seed: `pos-${i}`, difficulty: 1, skillKey: SK });
        expect(q.expectedAnswer).toBeGreaterThan(0);
      }
    });
  });

  describe("problemText format", () => {
    it("contains Vietnamese cylinder labels and π note", () => {
      const q = cylinderVolume.generate({ seed: "txt", difficulty: 1, skillKey: SK });
      expect(q.problemText).toContain("Hình trụ");
      expect(q.problemText).toContain("bán kính đáy");
      expect(q.problemText).toContain("chiều cao");
      expect(q.problemText).toContain("cm³");
      expect(q.problemText).toContain("3,14");
    });
  });

  describe("validation", () => {
    it("accepts correct answer (period separator)", () => {
      const q = cylinderVolume.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(cylinderVolume.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("accepts correct answer (comma separator)", () => {
      const q = cylinderVolume.generate({ seed: "val-comma", difficulty: 1, skillKey: SK });
      const vnAnswer = q.expectedAnswer.toFixed(2).replace(".", ",");
      expect(cylinderVolume.validate(vnAnswer, q)).toBe(true);
    });

    it("rejects clearly wrong answer", () => {
      const q = cylinderVolume.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(cylinderVolume.validate("0", q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = cylinderVolume.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(cylinderVolume.validate("abc", q)).toBe(false);
      expect(cylinderVolume.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = cylinderVolume.generate({ seed: "meta", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBe(75);
    });
  });
});
