import { describe, it, expect } from "vitest";
import { parallelogramRhombus } from "@/lib/generators/concept/parallelogram-rhombus";

const SK = "g4-parallelogram-rhombus";

describe("parallelogram-rhombus generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = parallelogramRhombus.generate(p);
      const q2 = parallelogramRhombus.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → variety in questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = parallelogramRhombus.generate({ seed: `v-${i}`, difficulty: 2, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("answer validity", () => {
    const VALID = ["hình bình hành", "hình thoi", "hình chữ nhật", "hình vuông"];

    it("expectedAnswer is always one of the 4 choices", () => {
      for (let i = 0; i < 20; i++) {
        const q = parallelogramRhombus.generate({ seed: `ans-${i}`, difficulty: 2, skillKey: SK });
        expect(VALID).toContain(q.expectedAnswer);
      }
    });

    it("all 4 answer types appear across 40 seeds", () => {
      const seen = new Set<string>();
      for (let i = 0; i < 40; i++) {
        for (const d of [1, 2, 3] as const) {
          const q = parallelogramRhombus.generate({ seed: `cover-${i}`, difficulty: d, skillKey: SK });
          seen.add(q.expectedAnswer as string);
        }
      }
      expect(seen).toContain("hình bình hành");
      expect(seen).toContain("hình thoi");
      expect(seen).toContain("hình chữ nhật");
      expect(seen).toContain("hình vuông");
    });
  });

  describe("choices", () => {
    it("always provides exactly 4 choices", () => {
      const q = parallelogramRhombus.generate({ seed: "choices-test", difficulty: 1, skillKey: SK });
      expect(q.choices).toEqual(["hình bình hành", "hình thoi", "hình chữ nhật", "hình vuông"]);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = parallelogramRhombus.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(parallelogramRhombus.validate(q.expectedAnswer as string, q)).toBe(true);
    });

    it("rejects wrong choice", () => {
      const q = parallelogramRhombus.generate({ seed: "val-wrong", difficulty: 1, skillKey: SK });
      const wrong = (q.choices as string[]).find((c) => c !== q.expectedAnswer)!;
      expect(parallelogramRhombus.validate(wrong, q)).toBe(false);
    });

    it("rejects empty string", () => {
      const q = parallelogramRhombus.generate({ seed: "val-empty", difficulty: 2, skillKey: SK });
      expect(parallelogramRhombus.validate("", q)).toBe(false);
    });

    it("rejects answer not in choices", () => {
      const q = parallelogramRhombus.generate({ seed: "val-bad", difficulty: 2, skillKey: SK });
      expect(parallelogramRhombus.validate("hình tròn", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is multiple-choice", () => {
      const q = parallelogramRhombus.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("multiple-choice");
    });

    it("timeEstimateSec is 45 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = parallelogramRhombus.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(45);
      }
    });

    it("skillKey and seed propagate to metadata", () => {
      const q = parallelogramRhombus.generate({ seed: "meta-seed", difficulty: 2, skillKey: SK });
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.seed).toBe("meta-seed");
    });
  });
});
