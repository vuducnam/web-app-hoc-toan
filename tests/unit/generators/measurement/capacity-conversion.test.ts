import { describe, it, expect } from "vitest";
import { capacityConversion } from "@/lib/generators/measurement/capacity-conversion";

const SK = "capacity-conversion";

describe("capacity-conversion generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "cap-det-seed", difficulty: d, skillKey: SK };
      const q1 = capacityConversion.generate(params);
      const q2 = capacityConversion.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 1 as const, skillKey: SK };
      const q1 = capacityConversion.generate({ ...base, seed: "s1" });
      const q2 = capacityConversion.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("difficulty 1 — l → ml", () => {
    it("value in [1,10] and answer = value × 1000", () => {
      for (let i = 0; i < 20; i++) {
        const q = capacityConversion.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        expect(q.problemText).toMatch(/Đổi: \d+ l = \? ml/);
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(1000);
        expect(q.expectedAnswer).toBeLessThanOrEqual(10000);
        // answer must be multiple of 1000
        expect(q.expectedAnswer % 1000).toBe(0);
      }
    });
  });

  describe("difficulty 2 — ml → l", () => {
    it("answer is integer lít value in [1,9]", () => {
      for (let i = 0; i < 20; i++) {
        const q = capacityConversion.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        expect(q.problemText).toMatch(/Đổi: \d+ ml = \? l/);
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThanOrEqual(1);
        expect(q.expectedAnswer).toBeLessThanOrEqual(9);
      }
    });
  });

  describe("difficulty 3 — larger values, mixed direction", () => {
    it("all answers integer and positive", () => {
      for (let i = 0; i < 20; i++) {
        const q = capacityConversion.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThan(0);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = capacityConversion.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(capacityConversion.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = capacityConversion.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(capacityConversion.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = capacityConversion.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(capacityConversion.validate("abc", q)).toBe(false);
      expect(capacityConversion.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = capacityConversion.generate({ seed: "meta", difficulty: 2, skillKey: SK });
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBeGreaterThan(0);
    });
  });
});
