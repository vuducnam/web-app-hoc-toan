import { describe, it, expect } from "vitest";
import { wordPercent } from "@/lib/generators/word-problems/word-percent";

const SK = "g5-word-percent";

describe("word-percent generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordPercent.generate(p);
      const q2 = wordPercent.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = wordPercent.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("answerFormat", () => {
    it("answerFormat is numeric for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordPercent.generate({ seed: "fmt-test", difficulty: d, skillKey: SK });
        expect(q.answerFormat).toBe("numeric");
      }
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = wordPercent.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          const ans = q.expectedAnswer as number;
          expect(Number.isInteger(ans)).toBe(true);
          expect(ans).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("multiple templates appear", () => {
    it("discount, students, garden templates all appear at D1 across 40 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 40; i++) {
        const q = wordPercent.generate({ seed: `tmpl-${i}`, difficulty: 1, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/giảm giá/i);
      expect(joined).toMatch(/học sinh/i);
      expect(joined).toMatch(/vườn/i);
    });

    it("warehouse template appears at D2/D3", () => {
      const texts: string[] = [];
      for (let i = 0; i < 40; i++) {
        const q = wordPercent.generate({ seed: `wh-${i}`, difficulty: 2, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/kho/i);
    });
  });

  describe("explanation format", () => {
    it("explanation starts with **Bài giải:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordPercent.generate({ seed: "expl-test", difficulty: d, skillKey: SK });
        expect(q.explanation!).toMatch(/^\*\*Bài giải:\*\*/);
      }
    });

    it("explanation contains **Đáp số:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordPercent.generate({ seed: "dap-so", difficulty: d, skillKey: SK });
        expect(q.explanation!).toContain("**Đáp số:**");
      }
    });

    it("explanation contains percentage symbol", () => {
      for (let i = 0; i < 10; i++) {
        const q = wordPercent.generate({ seed: `pct-${i}`, difficulty: 1, skillKey: SK });
        expect(q.explanation!).toContain("%");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct integer answer", () => {
      const q = wordPercent.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordPercent.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = wordPercent.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordPercent.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordPercent.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordPercent.validate("abc", q)).toBe(false);
      expect(wordPercent.validate("", q)).toBe(false);
    });

    it("rejects decimal string for integer answer", () => {
      const q = wordPercent.generate({ seed: "val-dec", difficulty: 1, skillKey: SK });
      expect(wordPercent.validate("1.5", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 90 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordPercent.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(90);
      }
    });

    it("id follows skillKey-seed pattern", () => {
      const q = wordPercent.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toBe(`${SK}-id-test`);
    });
  });
});
