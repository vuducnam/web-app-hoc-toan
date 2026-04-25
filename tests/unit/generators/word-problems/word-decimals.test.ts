import { describe, it, expect } from "vitest";
import { wordDecimals } from "@/lib/generators/word-problems/word-decimals";

const SK = "g5-word-decimals";

describe("word-decimals generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordDecimals.generate(p);
      const q2 = wordDecimals.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = wordDecimals.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("answerFormat", () => {
    it("answerFormat is decimal for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordDecimals.generate({ seed: "fmt-test", difficulty: d, skillKey: SK });
        expect(q.answerFormat).toBe("decimal");
      }
    });
  });

  describe("expected answer range and positivity", () => {
    it("answer is positive for all difficulties across 20 seeds", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 20; i++) {
          const q = wordDecimals.generate({ seed: `pos-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });

    it("D1 answer has at most 1 decimal place", () => {
      for (let i = 0; i < 20; i++) {
        const q = wordDecimals.generate({ seed: `dp1-${i}`, difficulty: 1, skillKey: SK });
        const ans = q.expectedAnswer as number;
        // Multiply by 10 and check it's an integer
        expect(Math.round(ans * 10)).toBe(ans * 10);
      }
    });
  });

  describe("multiple templates appear", () => {
    it("produces varied problem texts across 30 seeds at D1", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const q = wordDecimals.generate({ seed: `tmpl-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText.substring(0, 20));
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("explanation format", () => {
    it("explanation starts with **Bài giải:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordDecimals.generate({ seed: "expl-test", difficulty: d, skillKey: SK });
        expect(q.explanation).toBeDefined();
        expect(q.explanation!).toMatch(/^\*\*Bài giải:\*\*/);
      }
    });

    it("explanation contains **Đáp số:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordDecimals.generate({ seed: "dap-so", difficulty: d, skillKey: SK });
        expect(q.explanation!).toContain("**Đáp số:**");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer (period separator)", () => {
      const q = wordDecimals.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordDecimals.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts correct answer (Vietnamese comma separator)", () => {
      const q = wordDecimals.generate({ seed: "val-comma", difficulty: 1, skillKey: SK });
      const vnStr = String(q.expectedAnswer).replace(".", ",");
      expect(wordDecimals.validate(vnStr, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = wordDecimals.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordDecimals.validate("999", q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordDecimals.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordDecimals.validate("abc", q)).toBe(false);
      expect(wordDecimals.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 90 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordDecimals.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(90);
      }
    });

    it("id follows skillKey-seed pattern", () => {
      const q = wordDecimals.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toBe(`${SK}-id-test`);
    });
  });
});
