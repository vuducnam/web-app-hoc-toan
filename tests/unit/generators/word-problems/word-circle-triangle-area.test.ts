import { describe, it, expect } from "vitest";
import { wordCircleTriangleArea } from "@/lib/generators/word-problems/word-circle-triangle-area";

const SK = "g5-word-circle-triangle-area";
const PI = 3.14;

describe("word-circle-triangle-area generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordCircleTriangleArea.generate(p);
      const q2 = wordCircleTriangleArea.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `v-${i}`, difficulty: 2, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("D1: triangle only", () => {
    it("all D1 questions are about triangle (hình tam giác)", () => {
      for (let i = 0; i < 20; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        expect(q.problemText).toMatch(/tam giác/i);
      }
    });

    it("D1 answers are positive integers (S = a×h/2)", () => {
      for (let i = 0; i < 20; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `d1-int-${i}`, difficulty: 1, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer as number)).toBe(true);
        expect(q.expectedAnswer as number).toBeGreaterThan(0);
      }
    });

    it("D1 answerFormat is numeric", () => {
      for (let i = 0; i < 5; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `d1-fmt-${i}`, difficulty: 1, skillKey: SK });
        expect(q.answerFormat).toBe("numeric");
      }
    });
  });

  describe("D2: triangle and trapezoid", () => {
    it("both triangle and trapezoid appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/tam giác/i);
      expect(joined).toMatch(/hình thang/i);
    });

    it("D2 answers are positive integers across 30 seeds", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `d2-int-${i}`, difficulty: 2, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer as number)).toBe(true);
        expect(q.expectedAnswer as number).toBeGreaterThan(0);
      }
    });
  });

  describe("D3: triangle, trapezoid, and circle", () => {
    it("circle template appears across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/hình tròn/i);
    });

    it("circle answer equals π×r² with π=3.14", () => {
      for (let i = 0; i < 40; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `circ-${i}`, difficulty: 3, skillKey: SK });
        if (q.problemText.includes("hình tròn")) {
          const match = q.problemText.match(/bán kính (\d+) cm/);
          if (match) {
            const r = parseInt(match[1], 10);
            const expected = Math.round(PI * r * r * 100) / 100;
            expect(q.expectedAnswer as number).toBeCloseTo(expected, 2);
          }
        }
      }
    });

    it("circle answerFormat is decimal", () => {
      for (let i = 0; i < 40; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `circ-fmt-${i}`, difficulty: 3, skillKey: SK });
        if (q.problemText.includes("hình tròn")) {
          expect(q.answerFormat).toBe("decimal");
        }
      }
    });
  });

  describe("explanation format", () => {
    it("explanation starts with **Bài giải:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordCircleTriangleArea.generate({ seed: "expl-test", difficulty: d, skillKey: SK });
        expect(q.explanation!).toMatch(/^\*\*Bài giải:\*\*/);
      }
    });

    it("explanation contains **Đáp số:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordCircleTriangleArea.generate({ seed: "dap-so", difficulty: d, skillKey: SK });
        expect(q.explanation!).toContain("**Đáp số:**");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct numeric answer", () => {
      const q = wordCircleTriangleArea.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordCircleTriangleArea.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("accepts correct decimal answer (comma) for circle", () => {
      for (let i = 0; i < 40; i++) {
        const q = wordCircleTriangleArea.generate({ seed: `circ-val-${i}`, difficulty: 3, skillKey: SK });
        if (q.answerFormat === "decimal") {
          const vnStr = String(q.expectedAnswer).replace(".", ",");
          expect(wordCircleTriangleArea.validate(vnStr, q)).toBe(true);
          break;
        }
      }
    });

    it("rejects wrong answer", () => {
      const q = wordCircleTriangleArea.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordCircleTriangleArea.validate("999", q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordCircleTriangleArea.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordCircleTriangleArea.validate("abc", q)).toBe(false);
      expect(wordCircleTriangleArea.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 90 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = wordCircleTriangleArea.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(90);
      }
    });

    it("id follows skillKey-seed pattern", () => {
      const q = wordCircleTriangleArea.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toBe(`${SK}-id-test`);
    });
  });
});
