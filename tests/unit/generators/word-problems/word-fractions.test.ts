import { describe, it, expect } from "vitest";
import { wordFractions } from "@/lib/generators/word-problems/word-fractions";
import type { Fraction } from "@/lib/generators/types";

const SK = "g4-word-fractions";

describe("word-fractions generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordFractions.generate(p);
      const q2 = wordFractions.generate(p);
      const a1 = q1.expectedAnswer as Fraction;
      const a2 = q2.expectedAnswer as Fraction;
      expect(a1.num).toBe(a2.num);
      expect(a1.den).toBe(a2.den);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 15; i++) {
        const q = wordFractions.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("template variety", () => {
    it("multiple contexts appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordFractions.generate({ seed: `tmpl-${i}`, difficulty: 1, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      const contexts = ["bánh", "táo", "bể", "tô màu", "quãng đường"];
      const found = contexts.filter((c) => joined.includes(c));
      expect(found.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("proper fraction invariant", () => {
    it("all answers are proper fractions (num < den, den ≥ 2) across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = wordFractions.generate({ seed: `frac-${d}-${i}`, difficulty: d, skillKey: SK });
          const ans = q.expectedAnswer as Fraction;
          expect(ans.num).toBeGreaterThan(0);
          expect(ans.den).toBeGreaterThanOrEqual(2);
          expect(ans.num).toBeLessThan(ans.den);
        }
      }
    });
  });

  describe("difficulty denominator ranges", () => {
    it("D1 denominators ≤ 6", () => {
      for (let i = 0; i < 20; i++) {
        const q = wordFractions.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        expect((q.expectedAnswer as Fraction).den).toBeLessThanOrEqual(6);
      }
    });

    it("D3 can produce denominators > 6", () => {
      const dens = Array.from({ length: 30 }, (_, i) =>
        (wordFractions.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK }).expectedAnswer as Fraction).den
      );
      expect(dens.some((d) => d > 6)).toBe(true);
    });
  });

  describe("answer correctness", () => {
    it("cake template: answer num/den matches parsed problem", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordFractions.generate({ seed: `cake-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("Mẹ chia chiếc bánh thành")) {
          const match = q.problemText.match(/thành \$(\d+)\$ phần.*Em ăn \$(\d+)\$ phần/);
          if (match) {
            const den = parseInt(match[1], 10);
            const num = parseInt(match[2], 10);
            const ans = q.expectedAnswer as Fraction;
            expect(ans.num).toBe(num);
            expect(ans.den).toBe(den);
          }
        }
      }
    });

    it("tank template: remainder = full - used (same denominator)", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordFractions.generate({ seed: `tank-${i}`, difficulty: 2, skillKey: SK });
        if (q.problemText.includes("Bể nước có")) {
          // Extract full/den and used/den from LaTeX fractions
          const mFull = q.problemText.match(/\\dfrac\{(\d+)\}\{(\d+)\} bể đầy/);
          const mUsed = q.problemText.match(/dùng \$\\dfrac\{(\d+)\}\{(\d+)\}/);
          if (mFull && mUsed) {
            const full = parseInt(mFull[1], 10);
            const den = parseInt(mFull[2], 10);
            const used = parseInt(mUsed[1], 10);
            const ans = q.expectedAnswer as Fraction;
            expect(ans.num).toBe(full - used);
            expect(ans.den).toBe(den);
          }
        }
      }
    });
  });

  describe("explanation field", () => {
    it("contains Bài giải and Đáp số", () => {
      for (let i = 0; i < 10; i++) {
        const q = wordFractions.generate({ seed: `exp-${i}`, difficulty: 2, skillKey: SK });
        expect(q.explanation).toMatch(/Bài giải/);
        expect(q.explanation).toMatch(/Đáp số/);
      }
    });

    it("explanation contains LaTeX dfrac notation", () => {
      for (let i = 0; i < 10; i++) {
        const q = wordFractions.generate({ seed: `latex-${i}`, difficulty: 1, skillKey: SK });
        expect(q.explanation).toMatch(/\\dfrac/);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct fraction string", () => {
      const q = wordFractions.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      const ans = q.expectedAnswer as Fraction;
      expect(wordFractions.validate(`${ans.num}/${ans.den}`, q)).toBe(true);
    });

    it("accepts equivalent fraction (e.g. 2/4 = 1/2)", () => {
      // Build a question whose answer is 1/2 by finding matching seed
      for (let i = 0; i < 50; i++) {
        const q = wordFractions.generate({ seed: `eq-${i}`, difficulty: 1, skillKey: SK });
        const ans = q.expectedAnswer as Fraction;
        // Accept any fraction with num×2 / den×2 as equivalent
        expect(wordFractions.validate(`${ans.num * 2}/${ans.den * 2}`, q)).toBe(true);
        break; // just test one
      }
    });

    it("rejects wrong fraction", () => {
      const q = wordFractions.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      const ans = q.expectedAnswer as Fraction;
      // Flip numerator and denominator (unless already 1/1 which can't happen for proper fractions)
      expect(wordFractions.validate(`${ans.den}/${ans.num}`, q)).toBe(false);
    });

    it("rejects non-fraction input", () => {
      const q = wordFractions.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordFractions.validate("abc", q)).toBe(false);
      expect(wordFractions.validate("", q)).toBe(false);
      expect(wordFractions.validate("3", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is fraction", () => {
      const q = wordFractions.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("fraction");
    });

    it("id contains skillKey and seed", () => {
      const q = wordFractions.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toContain(SK);
      expect(q.id).toContain("id-test");
    });

    it("timeEstimateSec increases with difficulty", () => {
      const t1 = wordFractions.generate({ seed: "t", difficulty: 1, skillKey: SK }).metadata.timeEstimateSec;
      const t2 = wordFractions.generate({ seed: "t", difficulty: 2, skillKey: SK }).metadata.timeEstimateSec;
      const t3 = wordFractions.generate({ seed: "t", difficulty: 3, skillKey: SK }).metadata.timeEstimateSec;
      expect(t1).toBeLessThanOrEqual(t2);
      expect(t2).toBeLessThanOrEqual(t3);
    });
  });
});
