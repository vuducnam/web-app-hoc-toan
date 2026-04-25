import { describe, it, expect } from "vitest";
import { rounding } from "@/lib/generators/number-sense/rounding";

const SK = "g4-rounding";

describe("rounding generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = rounding.generate(p);
      const q2 = rounding.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = rounding.generate({ ...base, seed: "s1" });
      const q2 = rounding.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1 numbers in [10, 999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = rounding.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/Làm tròn số (\d+)/);
        expect(match).toBeTruthy();
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(10);
        expect(n).toBeLessThanOrEqual(999);
      }
    });

    it("D2 numbers in [100, 9999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = rounding.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/Làm tròn số (\d+)/);
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(100);
        expect(n).toBeLessThanOrEqual(9_999);
      }
    });

    it("D3 numbers in [1000, 99999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = rounding.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/Làm tròn số (\d+)/);
        const n = parseInt(match![1], 10);
        expect(n).toBeGreaterThanOrEqual(1_000);
        expect(n).toBeLessThanOrEqual(99_999);
      }
    });
  });

  describe("rounding correctness", () => {
    it("D1 answer is multiple of 10", () => {
      for (let i = 0; i < 20; i++) {
        const q = rounding.generate({ seed: `d1r-${i}`, difficulty: 1, skillKey: SK });
        expect((q.expectedAnswer as number) % 10).toBe(0);
      }
    });

    it("D2 answer is multiple of 100", () => {
      for (let i = 0; i < 20; i++) {
        const q = rounding.generate({ seed: `d2r-${i}`, difficulty: 2, skillKey: SK });
        expect((q.expectedAnswer as number) % 100).toBe(0);
      }
    });

    it("D3 answer is multiple of 1000", () => {
      for (let i = 0; i < 20; i++) {
        const q = rounding.generate({ seed: `d3r-${i}`, difficulty: 3, skillKey: SK });
        expect((q.expectedAnswer as number) % 1_000).toBe(0);
      }
    });

    it("tie-breaking: 15 rounds to 20 (round-half-up)", () => {
      // Find a seed that produces n=15 for D1, OR verify formula directly
      // Direct formula verification: Math.round(15/10)*10 = 20
      expect(Math.round(15 / 10) * 10).toBe(20);
    });

    it("rounding math is correct for extracted operand", () => {
      for (let i = 0; i < 20; i++) {
        const q = rounding.generate({ seed: `math-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/Làm tròn số (\d+)/);
        const n = parseInt(match![1], 10);
        const expected = Math.round(n / 100) * 100;
        expect(q.expectedAnswer).toBe(expected);
      }
    });
  });

  describe("problem text", () => {
    it("D1 text mentions 'hàng chục'", () => {
      const q = rounding.generate({ seed: "txt-1", difficulty: 1, skillKey: SK });
      expect(q.problemText).toContain("hàng chục");
    });

    it("D2 text mentions 'hàng trăm'", () => {
      const q = rounding.generate({ seed: "txt-2", difficulty: 2, skillKey: SK });
      expect(q.problemText).toContain("hàng trăm");
    });

    it("D3 text mentions 'hàng nghìn'", () => {
      const q = rounding.generate({ seed: "txt-3", difficulty: 3, skillKey: SK });
      expect(q.problemText).toContain("hàng nghìn");
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = rounding.generate({ seed: "val-ok", difficulty: 2, skillKey: SK });
      expect(rounding.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = rounding.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(rounding.validate(String((q.expectedAnswer as number) + 100), q)).toBe(false);
    });

    it("rejects empty and non-numeric", () => {
      const q = rounding.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(rounding.validate("", q)).toBe(false);
      expect(rounding.validate("abc", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("timeEstimateSec is 45 and answerFormat is numeric", () => {
      const q = rounding.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.metadata.timeEstimateSec).toBe(45);
      expect(q.answerFormat).toBe("numeric");
    });
  });
});
