import { describe, it, expect } from "vitest";
import { word3dVolume } from "@/lib/generators/word-problems/word-3d-volume";

const SK = "g5-word-3d-volume";

describe("word-3d-volume generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = word3dVolume.generate(p);
      const q2 = word3dVolume.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = word3dVolume.generate({ seed: `v-${i}`, difficulty: 2, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("answerFormat", () => {
    it("answerFormat is numeric for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = word3dVolume.generate({ seed: "fmt-test", difficulty: d, skillKey: SK });
        expect(q.answerFormat).toBe("numeric");
      }
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = word3dVolume.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          const ans = q.expectedAnswer as number;
          expect(Number.isInteger(ans)).toBe(true);
          expect(ans).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("D1: cube only", () => {
    it("all D1 questions are about cube (hình lập phương)", () => {
      for (let i = 0; i < 20; i++) {
        const q = word3dVolume.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        expect(q.problemText).toMatch(/lập phương/i);
      }
    });

    it("cube answer equals s³", () => {
      for (let i = 0; i < 20; i++) {
        const q = word3dVolume.generate({ seed: `d1-cube-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/cạnh (\d+) dm/);
        if (match) {
          const s = parseInt(match[1], 10);
          expect(q.expectedAnswer).toBe(s * s * s);
        }
      }
    });
  });

  describe("D2: cube and box", () => {
    it("both cube and box templates appear across 30 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = word3dVolume.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/lập phương/i);
      expect(joined).toMatch(/hộp chữ nhật/i);
    });
  });

  describe("D3: cube, box, capacity, box-to-liters", () => {
    it("capacity and box-to-liters templates appear across 40 seeds", () => {
      const texts: string[] = [];
      for (let i = 0; i < 40; i++) {
        const q = word3dVolume.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/1.*dm.*=.*1.*lít|1 lít/i);
    });

    it("capacity template answer equals V (1 dm³ = 1 lít)", () => {
      for (let i = 0; i < 40; i++) {
        const q = word3dVolume.generate({ seed: `cap-${i}`, difficulty: 3, skillKey: SK });
        // For capacity template: problem says "thể tích V dm³ → V lít"
        if (q.problemText.match(/Bể chứa nước có thể tích (\d+) dm/)) {
          const match = q.problemText.match(/Bể chứa nước có thể tích (\d+) dm/);
          if (match) {
            const V = parseInt(match[1], 10);
            expect(q.expectedAnswer).toBe(V);
          }
        }
      }
    });
  });

  describe("explanation format", () => {
    it("explanation starts with **Bài giải:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = word3dVolume.generate({ seed: "expl-test", difficulty: d, skillKey: SK });
        expect(q.explanation!).toMatch(/^\*\*Bài giải:\*\*/);
      }
    });

    it("explanation contains **Đáp số:**", () => {
      for (const d of [1, 2, 3] as const) {
        const q = word3dVolume.generate({ seed: "dap-so", difficulty: d, skillKey: SK });
        expect(q.explanation!).toContain("**Đáp số:**");
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = word3dVolume.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(word3dVolume.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = word3dVolume.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(word3dVolume.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = word3dVolume.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(word3dVolume.validate("abc", q)).toBe(false);
      expect(word3dVolume.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 90 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = word3dVolume.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(90);
      }
    });

    it("id follows skillKey-seed pattern", () => {
      const q = word3dVolume.generate({ seed: "id-test", difficulty: 1, skillKey: SK });
      expect(q.id).toBe(`${SK}-id-test`);
    });
  });
});
