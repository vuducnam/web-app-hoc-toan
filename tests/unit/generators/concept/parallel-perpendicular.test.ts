import { describe, it, expect } from "vitest";
import { parallelPerpendicular } from "@/lib/generators/concept/parallel-perpendicular";

const SK = "g4-parallel-perpendicular";

describe("parallel-perpendicular generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = parallelPerpendicular.generate(p);
      const q2 = parallelPerpendicular.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → variety in questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = parallelPerpendicular.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("answer validity", () => {
    it("expectedAnswer is always one of the 3 choices", () => {
      const validAnswers = ["song song", "vuông góc", "cắt nhau"];
      for (let i = 0; i < 20; i++) {
        const q = parallelPerpendicular.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        expect(validAnswers).toContain(q.expectedAnswer);
      }
    });

    it("all 3 answer types appear across 30 seeds at D1", () => {
      const seen = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const q = parallelPerpendicular.generate({ seed: `cover-${i}`, difficulty: 1, skillKey: SK });
        seen.add(q.expectedAnswer as string);
      }
      expect(seen).toContain("song song");
      expect(seen).toContain("vuông góc");
      expect(seen).toContain("cắt nhau");
    });
  });

  describe("choices", () => {
    it("always provides exactly 3 choices", () => {
      const q = parallelPerpendicular.generate({ seed: "choices-test", difficulty: 1, skillKey: SK });
      expect(q.choices).toEqual(["song song", "vuông góc", "cắt nhau"]);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = parallelPerpendicular.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(parallelPerpendicular.validate(q.expectedAnswer as string, q)).toBe(true);
    });

    it("rejects wrong choice", () => {
      const q = parallelPerpendicular.generate({ seed: "val-wrong", difficulty: 1, skillKey: SK });
      const wrong = (q.choices as string[]).find((c) => c !== q.expectedAnswer)!;
      expect(parallelPerpendicular.validate(wrong, q)).toBe(false);
    });

    it("rejects empty string", () => {
      const q = parallelPerpendicular.generate({ seed: "val-empty", difficulty: 1, skillKey: SK });
      expect(parallelPerpendicular.validate("", q)).toBe(false);
    });

    it("rejects answer not in choices", () => {
      const q = parallelPerpendicular.generate({ seed: "val-bad", difficulty: 2, skillKey: SK });
      expect(parallelPerpendicular.validate("chéo nhau", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is multiple-choice", () => {
      const q = parallelPerpendicular.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("multiple-choice");
    });

    it("timeEstimateSec is 45 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = parallelPerpendicular.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(45);
      }
    });
  });
});
