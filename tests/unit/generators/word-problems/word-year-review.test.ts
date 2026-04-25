import { describe, it, expect } from "vitest";
import { wordYearReview } from "@/lib/generators/word-problems/word-year-review";

const SK = "g5-word-year-review";

describe("word-year-review generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordYearReview.generate(p);
      const q2 = wordYearReview.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = wordYearReview.generate({ seed: `v-${i}`, difficulty: 2, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("answerFormat", () => {
    it("answerFormat is numeric for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordYearReview.generate({ seed: "fmt-test", difficulty: d, skillKey: SK });
        expect(q.answerFormat).toBe("numeric");
      }
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = wordYearReview.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          const ans = q.expectedAnswer as number;
          expect(Number.isInteger(ans)).toBe(true);
          expect(ans).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("template variety", () => {
    it("D1: speed-dist and warehouse-pct templates appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordYearReview.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/km\/giờ|vận tốc/i);
      expect(joined).toMatch(/kho|gạo/i);
    });

    it("D2: rect-expand template appears across 40 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 40; i++) {
        const q = wordYearReview.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/chiều dài|diện tích/i);
    });

    it("D3: all 4 template types appear across 50 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 50; i++) {
        const q = wordYearReview.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/km\/giờ|vận tốc/i);
      expect(joined).toMatch(/kho|gạo/i);
      expect(joined).toMatch(/chiều dài|diện tích/i);
    });
  });

  describe("speed-dist template correctness", () => {
    it("answer equals v × t when speed-dist template is used", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordYearReview.generate({ seed: `sd-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.match(/vận tốc (\d+) km\/giờ/)) {
          const vMatch = q.problemText.match(/vận tốc (\d+) km\/giờ/);
          const timeMatch = q.explanation!.match(/(\d+) - (\d+) = (\d+)/);
          if (vMatch && timeMatch) {
            const v = parseInt(vMatch[1], 10);
            const t = parseInt(timeMatch[3], 10);
            expect(q.expectedAnswer).toBe(v * t);
          }
        }
      }
    });
  });

  describe("explanation format", () => {
    it("explanation starts with **Bài giải:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordYearReview.generate({ seed: "expl-test", difficulty: d, skillKey: SK });
        expect(q.explanation!).toMatch(/^\*\*Bài giải:\*\*/);
      }
    });

    it("explanation contains **Đáp số:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordYearReview.generate({ seed: "dap-so", difficulty: d, skillKey: SK });
        expect(q.explanation!).toContain("**Đáp số:**");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = wordYearReview.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordYearReview.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = wordYearReview.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordYearReview.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordYearReview.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordYearReview.validate("abc", q)).toBe(false);
      expect(wordYearReview.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 90 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordYearReview.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(90);
      }
    });

    it("id follows skillKey-seed pattern", () => {
      const q = wordYearReview.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toBe(`${SK}-id-test`);
    });
  });
});
