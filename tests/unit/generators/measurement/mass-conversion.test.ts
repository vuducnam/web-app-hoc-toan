import { describe, it, expect } from "vitest";
import { massConversion } from "@/lib/generators/measurement/mass-conversion";

const SK = "mass-conversion";

describe("mass-conversion generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "mass-det-seed", difficulty: d, skillKey: SK };
      const q1 = massConversion.generate(params);
      const q2 = massConversion.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = massConversion.generate({ ...base, seed: "s1" });
      const q2 = massConversion.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("answer format", () => {
    it.each([1, 2, 3] as const)("returns numeric integer at difficulty %s", (d) => {
      const q = massConversion.generate({ seed: "fmt", difficulty: d, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
      expect(Number.isInteger(q.expectedAnswer)).toBe(true);
      expect(q.expectedAnswer).toBeGreaterThan(0);
    });
  });

  describe("integer answers across 20 samples per difficulty", () => {
    it.each([1, 2, 3] as const)("all answers integer at difficulty %s", (d) => {
      for (let i = 0; i < 20; i++) {
        const q = massConversion.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThan(0);
      }
    });
  });

  describe("problemText format", () => {
    it("contains 'Đổi:' prefix and '?' placeholder", () => {
      const q = massConversion.generate({ seed: "txt", difficulty: 1, skillKey: SK });
      expect(q.problemText).toMatch(/^Đổi:/);
      expect(q.problemText).toContain("?");
    });

    it("contains a known Vietnamese mass unit", () => {
      const units = ["tấn", "tạ", "yến", "kg", "hg", "dag", "g"];
      for (let i = 0; i < 10; i++) {
        const q = massConversion.generate({ seed: `unit-${i}`, difficulty: 1, skillKey: SK });
        const hasUnit = units.some((u) => q.problemText.includes(u));
        expect(hasUnit).toBe(true);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = massConversion.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(massConversion.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = massConversion.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(massConversion.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = massConversion.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(massConversion.validate("abc", q)).toBe(false);
      expect(massConversion.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = massConversion.generate({ seed: "meta", difficulty: 3, skillKey: SK });
      expect(q.metadata.difficulty).toBe(3);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBeGreaterThan(0);
    });
  });
});
