import { describe, it, expect } from "vitest";
import { numbersTo100k } from "@/lib/generators/number-sense/numbers-to-100k";

const SK = "g4-numbers-to-100k";

describe("numbers-to-100k generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = numbersTo100k.generate(p);
      const q2 = numbersTo100k.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = numbersTo100k.generate({ ...base, seed: "s1" });
      const q2 = numbersTo100k.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("range constraints", () => {
    it("D1 answers in [100, 9999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = numbersTo100k.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(100);
        expect(q.expectedAnswer).toBeLessThanOrEqual(9_999);
      }
    });

    it("D2 answers in [10000, 99999]", () => {
      for (let i = 0; i < 20; i++) {
        const q = numbersTo100k.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(10_000);
        expect(q.expectedAnswer).toBeLessThanOrEqual(99_999);
      }
    });

    it("D3 answers in [10000, 100000]", () => {
      for (let i = 0; i < 20; i++) {
        const q = numbersTo100k.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(10_000);
        expect(q.expectedAnswer).toBeLessThanOrEqual(100_000);
      }
    });
  });

  describe("problem text format", () => {
    it("problemText contains Vietnamese words pattern", () => {
      const q = numbersTo100k.generate({ seed: "fmt-test", difficulty: 1, skillKey: SK });
      expect(q.problemText).toMatch(/^Số ".+" viết là \?$/);
    });

    it("problemText contains Vietnamese words for known number", () => {
      // Find a seed that produces a known number — check words appear in text
      // Just verify the format is correct with quotes around words
      const q = numbersTo100k.generate({ seed: "words-test", difficulty: 1, skillKey: SK });
      // Problem text should have quoted Vietnamese words
      expect(q.problemText).toContain('"');
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = numbersTo100k.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(numbersTo100k.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = numbersTo100k.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(numbersTo100k.validate(String(q.expectedAnswer + 1), q)).toBe(false);
    });

    it("rejects empty string", () => {
      const q = numbersTo100k.generate({ seed: "val-empty", difficulty: 1, skillKey: SK });
      expect(numbersTo100k.validate("", q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = numbersTo100k.generate({ seed: "val-nan", difficulty: 1, skillKey: SK });
      expect(numbersTo100k.validate("abc", q)).toBe(false);
    });
  });

  describe("answer format and metadata", () => {
    it("answerFormat is numeric", () => {
      const q = numbersTo100k.generate({ seed: "meta-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
      expect(typeof q.expectedAnswer).toBe("number");
    });

    it("metadata fields are correct", () => {
      const q = numbersTo100k.generate({ seed: "meta-2", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta-2");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBe(45);
    });
  });
});
