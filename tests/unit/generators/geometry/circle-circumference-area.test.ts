import { describe, it, expect } from "vitest";
import { circleCircumferenceArea } from "@/lib/generators/geometry/circle-circumference-area";

const SK = "circle-circumference-area";
const PI = 3.14;

describe("circle-circumference-area generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "circ-det-seed", difficulty: d, skillKey: SK };
      const q1 = circleCircumferenceArea.generate(params);
      const q2 = circleCircumferenceArea.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const answers = new Set(
        Array.from({ length: 10 }, (_, i) =>
          circleCircumferenceArea.generate({ ...base, seed: `variety-${i}` }).expectedAnswer
        )
      );
      expect(answers.size).toBeGreaterThan(1);
    });
  });

  describe("answer format", () => {
    it.each([1, 2, 3] as const)("returns decimal format at difficulty %s", (d) => {
      const q = circleCircumferenceArea.generate({ seed: "fmt", difficulty: d, skillKey: SK });
      expect(q.answerFormat).toBe("decimal");
      expect(typeof q.expectedAnswer).toBe("number");
    });
  });

  describe("question type alternation", () => {
    it("produces both circumference and area questions across 20 seeds", () => {
      const types = new Set(
        Array.from({ length: 20 }, (_, i) => {
          const q = circleCircumferenceArea.generate({ seed: `type-${i}`, difficulty: 1, skillKey: SK });
          return (q.metadata as Record<string, unknown>).questionType as string;
        })
      );
      expect(types.has("circumference")).toBe(true);
      expect(types.has("area")).toBe(true);
    });

    it("circumference question contains 'Chu vi'", () => {
      // Find a seed that produces circumference
      for (let i = 0; i < 20; i++) {
        const q = circleCircumferenceArea.generate({ seed: `ctype-${i}`, difficulty: 1, skillKey: SK });
        if ((q.metadata as Record<string, unknown>).questionType === "circumference") {
          expect(q.problemText).toContain("Chu vi");
          expect(q.problemText).toContain("Đường tròn");
          break;
        }
      }
    });

    it("area question contains 'Diện tích'", () => {
      // Find a seed that produces area
      for (let i = 0; i < 20; i++) {
        const q = circleCircumferenceArea.generate({ seed: `atype-${i}`, difficulty: 1, skillKey: SK });
        if ((q.metadata as Record<string, unknown>).questionType === "area") {
          expect(q.problemText).toContain("Diện tích");
          expect(q.problemText).toContain("Hình tròn");
          break;
        }
      }
    });
  });

  describe("range constraints", () => {
    it("D1: r in [2,6]", () => {
      for (let i = 0; i < 20; i++) {
        const q = circleCircumferenceArea.generate({ seed: `range-d1-${i}`, difficulty: 1, skillKey: SK });
        const rMatch = q.problemText.match(/bán kính (\d+) cm/);
        expect(rMatch).not.toBeNull();
        const r = parseInt(rMatch![1], 10);
        expect(r).toBeGreaterThanOrEqual(2);
        expect(r).toBeLessThanOrEqual(6);
      }
    });

    it("D2: r in [3,12]", () => {
      for (let i = 0; i < 20; i++) {
        const q = circleCircumferenceArea.generate({ seed: `range-d2-${i}`, difficulty: 2, skillKey: SK });
        const rMatch = q.problemText.match(/bán kính (\d+) cm/);
        const r = parseInt(rMatch![1], 10);
        expect(r).toBeGreaterThanOrEqual(3);
        expect(r).toBeLessThanOrEqual(12);
      }
    });

    it("D3: r in [4,20]", () => {
      for (let i = 0; i < 20; i++) {
        const q = circleCircumferenceArea.generate({ seed: `range-d3-${i}`, difficulty: 3, skillKey: SK });
        const rMatch = q.problemText.match(/bán kính (\d+) cm/);
        const r = parseInt(rMatch![1], 10);
        expect(r).toBeGreaterThanOrEqual(4);
        expect(r).toBeLessThanOrEqual(20);
      }
    });
  });

  describe("answer correctness", () => {
    it("circumference answer = 2 × π × r rounded to 2dp", () => {
      for (let i = 0; i < 30; i++) {
        const q = circleCircumferenceArea.generate({ seed: `cans-${i}`, difficulty: 2, skillKey: SK });
        if ((q.metadata as Record<string, unknown>).questionType !== "circumference") continue;
        const rMatch = q.problemText.match(/bán kính (\d+) cm/);
        const r = parseInt(rMatch![1], 10);
        const expected = Math.round(2 * PI * r * 100) / 100;
        expect(q.expectedAnswer).toBeCloseTo(expected, 5);
      }
    });

    it("area answer = π × r² rounded to 2dp", () => {
      for (let i = 0; i < 30; i++) {
        const q = circleCircumferenceArea.generate({ seed: `aans-${i}`, difficulty: 2, skillKey: SK });
        if ((q.metadata as Record<string, unknown>).questionType !== "area") continue;
        const rMatch = q.problemText.match(/bán kính (\d+) cm/);
        const r = parseInt(rMatch![1], 10);
        const expected = Math.round(PI * r * r * 100) / 100;
        expect(q.expectedAnswer).toBeCloseTo(expected, 5);
      }
    });
  });

  describe("problemText format", () => {
    it("contains π = 3,14 note in all questions", () => {
      for (let i = 0; i < 10; i++) {
        const q = circleCircumferenceArea.generate({ seed: `pi-${i}`, difficulty: 1, skillKey: SK });
        expect(q.problemText).toContain("3,14");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer (period separator)", () => {
      const q = circleCircumferenceArea.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(circleCircumferenceArea.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("accepts correct answer (comma separator)", () => {
      const q = circleCircumferenceArea.generate({ seed: "val-comma", difficulty: 1, skillKey: SK });
      const vnAnswer = q.expectedAnswer.toFixed(2).replace(".", ",");
      expect(circleCircumferenceArea.validate(vnAnswer, q)).toBe(true);
    });

    it("rejects clearly wrong answer", () => {
      const q = circleCircumferenceArea.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(circleCircumferenceArea.validate("0", q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = circleCircumferenceArea.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(circleCircumferenceArea.validate("abc", q)).toBe(false);
      expect(circleCircumferenceArea.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes questionType in metadata", () => {
      const q = circleCircumferenceArea.generate({ seed: "meta", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBe(60);
      expect((q.metadata as Record<string, unknown>).questionType).toMatch(/^(circumference|area)$/);
    });
  });
});
