import { describe, it, expect } from "vitest";
import { wordRectangleArea } from "@/lib/generators/word-problems/word-rectangle-area";

const SK = "g4-word-rectangle-area";

describe("word-rectangle-area generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordRectangleArea.generate(p);
      const q2 = wordRectangleArea.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 15; i++) {
        const q = wordRectangleArea.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("template variety", () => {
    it("area, perimeter, and square templates all appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordRectangleArea.generate({ seed: `tmpl-${i}`, difficulty: 1, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/diện tích/i);
      expect(joined).toMatch(/chu vi/i);
      expect(joined).toMatch(/hình vuông/i);
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = wordRectangleArea.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("formula correctness", () => {
    it("rectangle area: answer = length × width", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordRectangleArea.generate({ seed: `area-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("Hình chữ nhật có chiều dài")) {
          const match = q.problemText.match(/chiều dài \$(\d+)\$ m và chiều rộng \$(\d+)\$ m/);
          if (match) {
            const a = parseInt(match[1], 10);
            const b = parseInt(match[2], 10);
            expect(q.expectedAnswer as number).toBe(a * b);
          }
        }
      }
    });

    it("rectangle perimeter: answer = 2 × (length + width)", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordRectangleArea.generate({ seed: `perim-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("Mảnh đất hình chữ nhật")) {
          const match = q.problemText.match(/chiều dài \$(\d+)\$ m và chiều rộng \$(\d+)\$ m/);
          if (match) {
            const a = parseInt(match[1], 10);
            const b = parseInt(match[2], 10);
            expect(q.expectedAnswer as number).toBe(2 * (a + b));
          }
        }
      }
    });

    it("square perimeter: answer = 4 × side", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordRectangleArea.generate({ seed: `sq-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("Mảnh vườn hình vuông")) {
          const match = q.problemText.match(/cạnh \$(\d+)\$ m/);
          if (match) {
            const s = parseInt(match[1], 10);
            expect(q.expectedAnswer as number).toBe(4 * s);
          }
        }
      }
    });

    it("find-width: perimeter / 2 - length = width", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordRectangleArea.generate({ seed: `fw-${i}`, difficulty: 2, skillKey: SK });
        if (q.problemText.includes("Sân vườn hình chữ nhật có chiều dài")) {
          const match = q.problemText.match(/chiều dài \$(\d+)\$ m và chu vi \$(\d+)\$ m/);
          if (match) {
            const len = parseInt(match[1], 10);
            const perim = parseInt(match[2], 10);
            expect(q.expectedAnswer as number).toBe(perim / 2 - len);
          }
        }
      }
    });
  });

  describe("explanation field", () => {
    it("contains Bài giải and Đáp số", () => {
      for (let i = 0; i < 10; i++) {
        const q = wordRectangleArea.generate({ seed: `exp-${i}`, difficulty: 2, skillKey: SK });
        expect(q.explanation).toMatch(/Bài giải/);
        expect(q.explanation).toMatch(/Đáp số/);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = wordRectangleArea.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordRectangleArea.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = wordRectangleArea.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordRectangleArea.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordRectangleArea.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordRectangleArea.validate("abc", q)).toBe(false);
      expect(wordRectangleArea.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is numeric", () => {
      const q = wordRectangleArea.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
    });

    it("id contains skillKey and seed", () => {
      const q = wordRectangleArea.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toContain(SK);
      expect(q.id).toContain("id-test");
    });
  });
});
