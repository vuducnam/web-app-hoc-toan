import { describe, it, expect } from "vitest";
import { wordAddSub } from "@/lib/generators/word-problems/word-add-sub";

const SK = "g4-word-add-sub";

describe("word-add-sub generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordAddSub.generate(p);
      const q2 = wordAddSub.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 15; i++) {
        const q = wordAddSub.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("template variety", () => {
    it("multiple template subjects appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordAddSub.generate({ seed: `tmpl-${i}`, difficulty: 1, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      // At least 3 distinct subjects should appear
      const subjects = ["táo", "gạo", "học sinh", "cây", "sản phẩm"];
      const found = subjects.filter((s) => joined.includes(s));
      expect(found.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = wordAddSub.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("difficulty ranges", () => {
    it("D1 answers ≤ 200 (sum of two ≤100 values)", () => {
      for (let i = 0; i < 20; i++) {
        const q = wordAddSub.generate({ seed: `range-1-${i}`, difficulty: 1, skillKey: SK });
        expect(q.expectedAnswer as number).toBeLessThanOrEqual(200);
      }
    });

    it("D3 answers can exceed 10 000", () => {
      const answers = Array.from({ length: 30 }, (_, i) =>
        wordAddSub.generate({ seed: `range-3-${i}`, difficulty: 3, skillKey: SK }).expectedAnswer as number
      );
      expect(answers.some((a) => a > 10_000)).toBe(true);
    });
  });

  describe("explanation field", () => {
    it("contains Bài giải and Đáp số", () => {
      for (let i = 0; i < 10; i++) {
        const q = wordAddSub.generate({ seed: `exp-${i}`, difficulty: 2, skillKey: SK });
        expect(q.explanation).toMatch(/Bài giải/);
        expect(q.explanation).toMatch(/Đáp số/);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = wordAddSub.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordAddSub.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = wordAddSub.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordAddSub.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordAddSub.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordAddSub.validate("abc", q)).toBe(false);
      expect(wordAddSub.validate("", q)).toBe(false);
    });

    it("accepts answer with whitespace", () => {
      const q = wordAddSub.generate({ seed: "val-ws", difficulty: 1, skillKey: SK });
      expect(wordAddSub.validate(`  ${q.expectedAnswer}  `, q)).toBe(true);
    });
  });

  describe("metadata", () => {
    it("answerFormat is numeric", () => {
      const q = wordAddSub.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
    });

    it("id contains skillKey and seed", () => {
      const q = wordAddSub.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toContain(SK);
      expect(q.id).toContain("id-test");
    });

    it("timeEstimateSec increases with difficulty", () => {
      const t1 = wordAddSub.generate({ seed: "t", difficulty: 1, skillKey: SK }).metadata.timeEstimateSec;
      const t2 = wordAddSub.generate({ seed: "t", difficulty: 2, skillKey: SK }).metadata.timeEstimateSec;
      const t3 = wordAddSub.generate({ seed: "t", difficulty: 3, skillKey: SK }).metadata.timeEstimateSec;
      expect(t1).toBeLessThanOrEqual(t2);
      expect(t2).toBeLessThanOrEqual(t3);
    });
  });
});
