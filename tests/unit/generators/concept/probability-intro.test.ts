import { describe, it, expect } from "vitest";
import { probabilityIntro } from "@/lib/generators/concept/probability-intro";

const SK = "g4-probability-intro";

describe("probability-intro generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = probabilityIntro.generate(p);
      const q2 = probabilityIntro.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → variety in questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = probabilityIntro.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("answer validity", () => {
    const VALID = ["chắc chắn", "có thể", "không thể"];

    it("expectedAnswer is always one of the 3 choices", () => {
      for (let i = 0; i < 20; i++) {
        for (const d of [1, 2, 3] as const) {
          const q = probabilityIntro.generate({ seed: `ans-${i}`, difficulty: d, skillKey: SK });
          expect(VALID).toContain(q.expectedAnswer);
        }
      }
    });

    it("all 3 answer types appear across 30 seeds at D1", () => {
      const seen = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const q = probabilityIntro.generate({ seed: `cover-${i}`, difficulty: 1, skillKey: SK });
        seen.add(q.expectedAnswer as string);
      }
      expect(seen).toContain("chắc chắn");
      expect(seen).toContain("có thể");
      expect(seen).toContain("không thể");
    });

    it("all 3 answer types appear across 30 seeds at D3", () => {
      const seen = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const q = probabilityIntro.generate({ seed: `cover3-${i}`, difficulty: 3, skillKey: SK });
        seen.add(q.expectedAnswer as string);
      }
      expect(seen).toContain("chắc chắn");
      expect(seen).toContain("có thể");
      expect(seen).toContain("không thể");
    });
  });

  describe("choices", () => {
    it("always provides exactly 3 choices", () => {
      const q = probabilityIntro.generate({ seed: "choices-test", difficulty: 1, skillKey: SK });
      expect(q.choices).toEqual(["chắc chắn", "có thể", "không thể"]);
    });

    it("expectedAnswer is always in choices", () => {
      for (let i = 0; i < 15; i++) {
        const q = probabilityIntro.generate({ seed: `ch-${i}`, difficulty: 2, skillKey: SK });
        expect(q.choices).toContain(q.expectedAnswer);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = probabilityIntro.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(probabilityIntro.validate(q.expectedAnswer as string, q)).toBe(true);
    });

    it("rejects wrong choice", () => {
      const q = probabilityIntro.generate({ seed: "val-wrong", difficulty: 1, skillKey: SK });
      const wrong = (q.choices as string[]).find((c) => c !== q.expectedAnswer)!;
      expect(probabilityIntro.validate(wrong, q)).toBe(false);
    });

    it("rejects empty string", () => {
      const q = probabilityIntro.generate({ seed: "val-empty", difficulty: 1, skillKey: SK });
      expect(probabilityIntro.validate("", q)).toBe(false);
    });

    it("rejects answer not in choices", () => {
      const q = probabilityIntro.generate({ seed: "val-bad", difficulty: 2, skillKey: SK });
      expect(probabilityIntro.validate("ít có khả năng", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is multiple-choice", () => {
      const q = probabilityIntro.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("multiple-choice");
    });

    it("timeEstimateSec is 30 for D1, 45 for D2/D3", () => {
      const q1 = probabilityIntro.generate({ seed: "t1", difficulty: 1, skillKey: SK });
      expect(q1.metadata.timeEstimateSec).toBe(30);
      const q2 = probabilityIntro.generate({ seed: "t2", difficulty: 2, skillKey: SK });
      expect(q2.metadata.timeEstimateSec).toBe(45);
      const q3 = probabilityIntro.generate({ seed: "t3", difficulty: 3, skillKey: SK });
      expect(q3.metadata.timeEstimateSec).toBe(45);
    });
  });
});
