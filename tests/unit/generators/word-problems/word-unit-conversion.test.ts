import { describe, it, expect } from "vitest";
import { wordUnitConversion } from "@/lib/generators/word-problems/word-unit-conversion";

const SK = "g4-word-unit-conversion";

describe("word-unit-conversion generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = wordUnitConversion.generate(p);
      const q2 = wordUnitConversion.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 15; i++) {
        const q = wordUnitConversion.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("unit variety", () => {
    it("km/m, kg/g and lít/ml templates all appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = wordUnitConversion.generate({ seed: `tmpl-${i}`, difficulty: 2, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/km/);
      expect(joined).toMatch(/kg/);
      expect(joined).toMatch(/lít|ml/);
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = wordUnitConversion.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("conversion correctness", () => {
    it("km→m template: answer equals km×1000 minus walked metres", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordUnitConversion.generate({ seed: `km-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("km. Em đã đi được")) {
          const m1 = q.problemText.match(/là \$(\d+)\$ km/);
          const m2 = q.problemText.match(/được \$(\d+)\$ m/);
          if (m1 && m2) {
            const totalM = parseInt(m1[1], 10) * 1000;
            const walkedM = parseInt(m2[1], 10);
            expect(q.expectedAnswer as number).toBe(totalM - walkedM);
          }
        }
      }
    });

    it("kg→g template: answer equals kg×1000 minus used grams", () => {
      for (let i = 0; i < 30; i++) {
        const q = wordUnitConversion.generate({ seed: `kg-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("kg. Gia đình đã dùng")) {
          const m1 = q.problemText.match(/nặng \$(\d+)\$ kg/);
          const m2 = q.problemText.match(/dùng \$(\d+)\$ g/);
          if (m1 && m2) {
            const totalG = parseInt(m1[1], 10) * 1000;
            const usedG = parseInt(m2[1], 10);
            expect(q.expectedAnswer as number).toBe(totalG - usedG);
          }
        }
      }
    });
  });

  describe("explanation field", () => {
    it("contains Bài giải, Đổi, and Đáp số", () => {
      for (let i = 0; i < 10; i++) {
        const q = wordUnitConversion.generate({ seed: `exp-${i}`, difficulty: 2, skillKey: SK });
        expect(q.explanation).toMatch(/Bài giải/);
        expect(q.explanation).toMatch(/Đổi/);
        expect(q.explanation).toMatch(/Đáp số/);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = wordUnitConversion.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(wordUnitConversion.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = wordUnitConversion.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(wordUnitConversion.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = wordUnitConversion.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(wordUnitConversion.validate("abc", q)).toBe(false);
      expect(wordUnitConversion.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is numeric", () => {
      const q = wordUnitConversion.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
    });

    it("id contains skillKey and seed", () => {
      const q = wordUnitConversion.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toContain(SK);
      expect(q.id).toContain("id-test");
    });
  });
});
