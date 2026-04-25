import { describe, it, expect } from "vitest";
import { wordMultiplyDivide } from "@/lib/generators/word-problems/word-multiply-divide";

const SK = "g4-word-multiply-divide";

describe("word-multiply-divide generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordMultiplyDivide.generate(p);
      const q2 = wordMultiplyDivide.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 15; i++) {
        const q = wordMultiplyDivide.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("template variety", () => {
    it("both multiplication and division templates appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordMultiplyDivide.generate({ seed: `tmpl-${i}`, difficulty: 1, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      // Multiplication templates contain "tất cả bao nhiêu"
      expect(joined).toMatch(/tất cả bao nhiêu/);
      // Division templates contain "chia đều" or "bao nhiêu ngày"
      expect(joined).toMatch(/chia đều|bao nhiêu ngày/);
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = wordMultiplyDivide.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("division correctness", () => {
    it("division answers satisfy: total = answer × divisor", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordMultiplyDivide.generate({ seed: `div-${i}`, difficulty: 2, skillKey: SK });
        if (q.problemText.includes("chia đều")) {
          // Extract "total cuốn vở chia đều cho n bạn"
          const match = q.problemText.match(/\$(\d+)\$ cuốn vở chia đều cho \$(\d+)\$ bạn/);
          if (match) {
            const total = parseInt(match[1], 10);
            const n = parseInt(match[2], 10);
            expect((q.expectedAnswer as number) * n).toBe(total);
          }
        }
      }
    });

    it("reading-days answers satisfy: pages = answer × pages_per_day", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordMultiplyDivide.generate({ seed: `rd-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("trang. Mỗi ngày")) {
          const match = q.problemText.match(/sách dày \$(\d+)\$ trang.*Mỗi ngày em đọc \$(\d+)\$ trang/);
          if (match) {
            const pages = parseInt(match[1], 10);
            const perDay = parseInt(match[2], 10);
            expect((q.expectedAnswer as number) * perDay).toBe(pages);
          }
        }
      }
    });
  });

  describe("explanation field", () => {
    it("contains Bài giải and Đáp số", () => {
      for (let i = 0; i < 10; i++) {
        const q = wordMultiplyDivide.generate({ seed: `exp-${i}`, difficulty: 2, skillKey: SK });
        expect(q.explanation).toMatch(/Bài giải/);
        expect(q.explanation).toMatch(/Đáp số/);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = wordMultiplyDivide.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordMultiplyDivide.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = wordMultiplyDivide.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordMultiplyDivide.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordMultiplyDivide.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordMultiplyDivide.validate("abc", q)).toBe(false);
      expect(wordMultiplyDivide.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is numeric", () => {
      const q = wordMultiplyDivide.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
    });

    it("id contains skillKey and seed", () => {
      const q = wordMultiplyDivide.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toContain(SK);
      expect(q.id).toContain("id-test");
    });
  });
});
