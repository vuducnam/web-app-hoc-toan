import { describe, it, expect } from "vitest";
import { triangleArea } from "@/lib/generators/geometry/triangle-area";

const SK = "triangle-area";

describe("triangle-area generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "tri-det-seed", difficulty: d, skillKey: SK };
      const q1 = triangleArea.generate(params);
      const q2 = triangleArea.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const answers = new Set(
        Array.from({ length: 10 }, (_, i) =>
          triangleArea.generate({ ...base, seed: `variety-${i}` }).expectedAnswer
        )
      );
      expect(answers.size).toBeGreaterThan(1);
    });
  });

  describe("answer format", () => {
    it.each([1, 2, 3] as const)("returns numeric format at difficulty %s", (d) => {
      const q = triangleArea.generate({ seed: "fmt", difficulty: d, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
      expect(typeof q.expectedAnswer).toBe("number");
      expect(Number.isInteger(q.expectedAnswer)).toBe(true);
    });
  });

  describe("integer answers across 20 samples per difficulty", () => {
    it.each([1, 2, 3] as const)("all answers integer at difficulty %s", (d) => {
      for (let i = 0; i < 20; i++) {
        const q = triangleArea.generate({ seed: `int-check-${d}-${i}`, difficulty: d, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThan(0);
      }
    });
  });

  describe("range constraints", () => {
    it("D1: base and height both even, in [4,12]", () => {
      for (let i = 0; i < 20; i++) {
        const q = triangleArea.generate({ seed: `range-d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/đáy (\d+) cm, chiều cao (\d+) cm/);
        expect(match).not.toBeNull();
        const a = parseInt(match![1], 10);
        const h = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(4);
        expect(a).toBeLessThanOrEqual(12);
        expect(h).toBeGreaterThanOrEqual(4);
        expect(h).toBeLessThanOrEqual(12);
        expect(a % 2).toBe(0);
        expect(h % 2).toBe(0);
      }
    });

    it("D2: values in [5,25], answer integer", () => {
      for (let i = 0; i < 20; i++) {
        const q = triangleArea.generate({ seed: `range-d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/đáy (\d+) cm, chiều cao (\d+) cm/);
        expect(match).not.toBeNull();
        const a = parseInt(match![1], 10);
        const h = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(5);
        expect(a).toBeLessThanOrEqual(25);
        expect(h).toBeGreaterThanOrEqual(5);
        expect(h).toBeLessThanOrEqual(25);
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
      }
    });

    it("D3: values in [6,40], answer integer", () => {
      for (let i = 0; i < 20; i++) {
        const q = triangleArea.generate({ seed: `range-d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/đáy (\d+) cm, chiều cao (\d+) cm/);
        expect(match).not.toBeNull();
        const a = parseInt(match![1], 10);
        const h = parseInt(match![2], 10);
        expect(a).toBeGreaterThanOrEqual(6);
        expect(a).toBeLessThanOrEqual(40);
        expect(h).toBeGreaterThanOrEqual(6);
        expect(h).toBeLessThanOrEqual(40);
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
      }
    });
  });

  describe("answer correctness", () => {
    it("expectedAnswer = (a × h) / 2", () => {
      for (let i = 0; i < 20; i++) {
        const q = triangleArea.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/đáy (\d+) cm, chiều cao (\d+) cm/);
        expect(match).not.toBeNull();
        const a = parseInt(match![1], 10);
        const h = parseInt(match![2], 10);
        expect(q.expectedAnswer).toBe((a * h) / 2);
      }
    });
  });

  describe("problemText format", () => {
    it("contains Vietnamese labels", () => {
      const q = triangleArea.generate({ seed: "txt", difficulty: 1, skillKey: SK });
      expect(q.problemText).toContain("Tam giác");
      expect(q.problemText).toContain("đáy");
      expect(q.problemText).toContain("chiều cao");
      expect(q.problemText).toContain("cm²");
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = triangleArea.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(triangleArea.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects off-by-one answer", () => {
      const q = triangleArea.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(triangleArea.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = triangleArea.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(triangleArea.validate("abc", q)).toBe(false);
      expect(triangleArea.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = triangleArea.generate({ seed: "meta", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBe(60);
    });
  });
});
