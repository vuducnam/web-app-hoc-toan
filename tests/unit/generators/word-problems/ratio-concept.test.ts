import { describe, it, expect } from "vitest";
import { ratioConcept } from "@/lib/generators/word-problems/ratio-concept";

const SK = "g5-ratio-concept";

describe("ratio-concept generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = ratioConcept.generate(p);
      const q2 = ratioConcept.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → variety", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = ratioConcept.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = ratioConcept.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("template coverage", () => {
    it("class-ratio and juice-mix templates both appear at D1/D2", () => {
      for (const d of [1, 2] as const) {
        const texts = new Set<string>();
        for (let i = 0; i < 30; i++) {
          const q = ratioConcept.generate({ seed: `tmpl-${d}-${i}`, difficulty: d, skillKey: SK });
          texts.add(q.problemText);
        }
        const joined = [...texts].join(" ");
        expect(joined).toMatch(/nam/i);       // class-ratio uses "bạn nam"
        expect(joined).toMatch(/cam/i);       // juice-mix uses "cam"
      }
    });

    it("simple-ratio template appears at D3", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = ratioConcept.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      // simple-ratio: "Tỉ số của X và Y là bao nhiêu?"
      expect(joined).toMatch(/Tỉ số của \d+ và \d+/);
    });
  });

  describe("answer correctness spot-checks", () => {
    it("class-ratio answer = total × a / (a+b)", () => {
      for (let i = 0; i < 30; i++) {
        const q = ratioConcept.generate({ seed: `cr-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("bạn nam")) {
          // "Tỉ số nam và nữ ... là A:B. Biết lớp có TOTAL bạn."
          const ratioMatch = q.problemText.match(/là (\d+):(\d+)/);
          const totalMatch = q.problemText.match(/có (\d+) bạn/);
          if (ratioMatch && totalMatch) {
            const a = parseInt(ratioMatch[1], 10);
            const b = parseInt(ratioMatch[2], 10);
            const total = parseInt(totalMatch[1], 10);
            expect(q.expectedAnswer).toBe(total * a / (a + b));
          }
        }
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = ratioConcept.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(ratioConcept.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = ratioConcept.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(ratioConcept.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = ratioConcept.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(ratioConcept.validate("abc", q)).toBe(false);
      expect(ratioConcept.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is numeric", () => {
      const q = ratioConcept.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
    });

    it("timeEstimateSec is 60 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = ratioConcept.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(60);
      }
    });
  });
});
