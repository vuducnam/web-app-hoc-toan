import { describe, it, expect } from "vitest";
import { ratioWordProblems } from "@/lib/generators/word-problems/ratio-word-problems";

const SK = "g5-ratio-word-problems";

describe("ratio-word-problems generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = ratioWordProblems.generate(p);
      const q2 = ratioWordProblems.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → variety", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = ratioWordProblems.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = ratioWordProblems.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("template coverage", () => {
    it("sum-ratio and rectangle templates both appear at D1/D2", () => {
      for (const d of [1, 2] as const) {
        const texts: string[] = [];
        for (let i = 0; i < 30; i++) {
          const q = ratioWordProblems.generate({ seed: `tmpl-${d}-${i}`, difficulty: d, skillKey: SK });
          texts.push(q.problemText);
        }
        const joined = texts.join(" ");
        expect(joined).toMatch(/tổng/i);          // sum-ratio
        expect(joined).toMatch(/chu vi|chiều rộng/i); // rectangle
      }
    });

    it("split-larger template appears at D3", () => {
      const texts: string[] = [];
      for (let i = 0; i < 30; i++) {
        const q = ratioWordProblems.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        texts.push(q.problemText);
      }
      const joined = texts.join(" ");
      expect(joined).toMatch(/Chia \d+ thành 2 phần/);
    });
  });

  describe("answer correctness spot-checks", () => {
    it("sum-ratio: smaller = total × min(a,b) / (a+b)", () => {
      for (let i = 0; i < 30; i++) {
        const q = ratioWordProblems.generate({ seed: `sr-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("Hai số có tổng")) {
          // "Hai số có tổng là TOTAL. Tỉ số của số lớn và số bé là A:B. Tìm số bé."
          const totalMatch = q.problemText.match(/tổng là (\d+)/);
          const ratioMatch = q.problemText.match(/là (\d+):(\d+)/);
          if (totalMatch && ratioMatch) {
            const total = parseInt(totalMatch[1], 10);
            const a = parseInt(ratioMatch[1], 10); // larger part ratio
            const b = parseInt(ratioMatch[2], 10); // smaller part ratio
            const expected = total * b / (a + b);
            expect(q.expectedAnswer).toBe(expected);
          }
        }
      }
    });

    it("rectangle: width = P / (2 × (k+1))", () => {
      for (let i = 0; i < 30; i++) {
        const q = ratioWordProblems.generate({ seed: `rect-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("chiều dài gấp")) {
          // "chiều dài gấp K lần chiều rộng và có chu vi là P m"
          const kMatch = q.problemText.match(/gấp (\d+) lần/);
          const pMatch = q.problemText.match(/chu vi là (\d+) m/);
          if (kMatch && pMatch) {
            const k = parseInt(kMatch[1], 10);
            const P = parseInt(pMatch[1], 10);
            const expected = P / (2 * (k + 1));
            expect(q.expectedAnswer).toBe(expected);
          }
        }
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = ratioWordProblems.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(ratioWordProblems.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = ratioWordProblems.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(ratioWordProblems.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = ratioWordProblems.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(ratioWordProblems.validate("abc", q)).toBe(false);
      expect(ratioWordProblems.validate("", q)).toBe(false);
    });

    it("rejects decimal when integer expected", () => {
      const q = ratioWordProblems.generate({ seed: "val-dec", difficulty: 1, skillKey: SK });
      expect(ratioWordProblems.validate("3.5", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is numeric", () => {
      const q = ratioWordProblems.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
    });

    it("timeEstimateSec is 90 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = ratioWordProblems.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(90);
      }
    });

    it("skillKey propagates to metadata and id", () => {
      const q = ratioWordProblems.generate({ seed: "meta-s", difficulty: 2, skillKey: SK });
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.id).toBe(`${SK}-meta-s`);
    });
  });
});
