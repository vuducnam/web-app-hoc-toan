import { describe, it, expect } from "vitest";
import { volumeUnits } from "@/lib/generators/measurement/volume-units";

const SK = "volume-units";

describe("volume-units generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "vol-det-seed", difficulty: d, skillKey: SK };
      const q1 = volumeUnits.generate(params);
      const q2 = volumeUnits.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = volumeUnits.generate({ ...base, seed: "s1" });
      const q2 = volumeUnits.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("integer answers across 20 samples per difficulty", () => {
    it.each([1, 2, 3] as const)("all answers integer at difficulty %s", (d) => {
      for (let i = 0; i < 20; i++) {
        const q = volumeUnits.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThan(0);
      }
    });
  });

  describe("problemText format", () => {
    it("contains 'Đổi:' prefix and volume units", () => {
      const units = ["m³", "dm³", "cm³"];
      for (let i = 0; i < 10; i++) {
        const q = volumeUnits.generate({ seed: `u-${i}`, difficulty: 2, skillKey: SK });
        expect(q.problemText).toMatch(/^Đổi:/);
        expect(q.problemText).toContain("?");
        const hasUnit = units.some((u) => q.problemText.includes(u));
        expect(hasUnit).toBe(true);
      }
    });
  });

  describe("difficulty 1 — dm³ ↔ cm³ adjacents", () => {
    it("answer is multiple of 1000 (dm³→cm³) or divides evenly (cm³→dm³)", () => {
      for (let i = 0; i < 20; i++) {
        const q = volumeUnits.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = volumeUnits.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(volumeUnits.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = volumeUnits.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(volumeUnits.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = volumeUnits.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(volumeUnits.validate("abc", q)).toBe(false);
      expect(volumeUnits.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = volumeUnits.generate({ seed: "meta", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBeGreaterThan(0);
    });
  });
});
