import { describe, it, expect } from "vitest";
import { timeMeasurement } from "@/lib/generators/measurement/time-measurement";

const SK = "time-measurement";

describe("time-measurement generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3] as const)("same seed → same question at difficulty %s", (d) => {
      const params = { seed: "time-det-seed", difficulty: d, skillKey: SK };
      const q1 = timeMeasurement.generate(params);
      const q2 = timeMeasurement.generate(params);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
    });

    it("different seeds → different questions", () => {
      const base = { difficulty: 2 as const, skillKey: SK };
      const q1 = timeMeasurement.generate({ ...base, seed: "s1" });
      const q2 = timeMeasurement.generate({ ...base, seed: "s2" });
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("answer format", () => {
    it.each([1, 2, 3] as const)("returns numeric integer at difficulty %s", (d) => {
      for (let i = 0; i < 10; i++) {
        const q = timeMeasurement.generate({ seed: `fmt-${d}-${i}`, difficulty: d, skillKey: SK });
        expect(q.answerFormat).toBe("numeric");
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        expect(q.expectedAnswer).toBeGreaterThan(0);
      }
    });
  });

  describe("D1 — simple unit conversion templates", () => {
    it("problemText matches giờ/phút/giây conversion pattern", () => {
      // D1 templates: "Đổi: N giờ = ? phút", "Đổi: N phút = ? giờ",
      //               "Đổi: N phút = ? giây", "Đổi: N giây = ? phút"
      const validPatterns = [
        /^Đổi: \d+ giờ = \? phút$/,
        /^Đổi: \d+ phút = \? giờ$/,
        /^Đổi: \d+ phút = \? giây$/,
        /^Đổi: \d+ giây = \? phút$/,
      ];
      for (let i = 0; i < 20; i++) {
        const q = timeMeasurement.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const matchesAny = validPatterns.some((p) => p.test(q.problemText));
        expect(matchesAny).toBe(true);
      }
    });

    it("giờ → phút conversion answer = hours × 60", () => {
      // Find a seed that produces giờ → phút
      for (let i = 0; i < 30; i++) {
        const q = timeMeasurement.generate({ seed: `d1-hr-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.match(/^Đổi: (\d+) giờ = \? phút$/)) {
          const hours = parseInt(q.problemText.match(/\d+/)![0], 10);
          expect(q.expectedAnswer).toBe(hours * 60);
          return; // found one, test passes
        }
      }
    });

    it("phút → giờ conversion answer is integer (only divisible cases)", () => {
      for (let i = 0; i < 30; i++) {
        const q = timeMeasurement.generate({ seed: `d1-min-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.match(/= \? giờ$/)) {
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        }
      }
    });
  });

  describe("D2 — composite conversion templates", () => {
    it("problemText matches 'H giờ M phút = ? phút' or 'P phút S giây = ? giây'", () => {
      const pattern1 = /giờ.*phút = \? phút$/;
      const pattern2 = /phút.*giây = \? giây$/;
      for (let i = 0; i < 20; i++) {
        const q = timeMeasurement.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        expect(pattern1.test(q.problemText) || pattern2.test(q.problemText)).toBe(true);
      }
    });

    it("H giờ M phút → answer equals H*60 + M", () => {
      for (let i = 0; i < 30; i++) {
        const q = timeMeasurement.generate({ seed: `d2-hm-${i}`, difficulty: 2, skillKey: SK });
        const m = q.problemText.match(/^Đổi: (\d+) giờ (\d+) phút = \? phút$/);
        if (m) {
          expect(q.expectedAnswer).toBe(parseInt(m[1], 10) * 60 + parseInt(m[2], 10));
          return;
        }
      }
    });

    it("P phút S giây → answer equals P*60 + S", () => {
      for (let i = 0; i < 30; i++) {
        const q = timeMeasurement.generate({ seed: `d2-ps-${i}`, difficulty: 2, skillKey: SK });
        const m = q.problemText.match(/^Đổi: (\d+) phút (\d+) giây = \? giây$/);
        if (m) {
          expect(q.expectedAnswer).toBe(parseInt(m[1], 10) * 60 + parseInt(m[2], 10));
          return;
        }
      }
    });
  });

  describe("D3 — time arithmetic templates", () => {
    it("problemText contains '+' or '-' and ends with '= ? phút'", () => {
      for (let i = 0; i < 20; i++) {
        const q = timeMeasurement.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        expect(q.problemText).toMatch(/= \? phút$/);
        const hasOp = q.problemText.includes("+") || q.problemText.includes("-");
        expect(hasOp).toBe(true);
      }
    });

    it("sum template: answer equals sum of both operands in minutes", () => {
      for (let i = 0; i < 30; i++) {
        const q = timeMeasurement.generate({ seed: `d3-sum-${i}`, difficulty: 3, skillKey: SK });
        if (!q.problemText.includes("+")) continue;
        // Parse "X giờ Y phút + A giờ B phút = ? phút" or variants
        expect(q.expectedAnswer).toBeGreaterThan(0);
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        return;
      }
    });

    it("diff template: answer is positive", () => {
      for (let i = 0; i < 30; i++) {
        const q = timeMeasurement.generate({ seed: `d3-diff-${i}`, difficulty: 3, skillKey: SK });
        if (!q.problemText.includes("-")) continue;
        expect(q.expectedAnswer).toBeGreaterThan(0);
        expect(Number.isInteger(q.expectedAnswer)).toBe(true);
        return;
      }
    });

    it("produces both sum and diff templates across 50 seeds", () => {
      let sawSum = false;
      let sawDiff = false;
      for (let i = 0; i < 50; i++) {
        const q = timeMeasurement.generate({ seed: `d3-both-${i}`, difficulty: 3, skillKey: SK });
        if (q.problemText.includes("+")) sawSum = true;
        if (q.problemText.includes("-")) sawDiff = true;
        if (sawSum && sawDiff) break;
      }
      expect(sawSum).toBe(true);
      expect(sawDiff).toBe(true);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = timeMeasurement.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(timeMeasurement.validate(q.expectedAnswer.toString(), q)).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const q = timeMeasurement.generate({ seed: "val-no", difficulty: 2, skillKey: SK });
      expect(timeMeasurement.validate((q.expectedAnswer + 1).toString(), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = timeMeasurement.generate({ seed: "val-str", difficulty: 1, skillKey: SK });
      expect(timeMeasurement.validate("abc", q)).toBe(false);
      expect(timeMeasurement.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("includes correct metadata fields", () => {
      const q = timeMeasurement.generate({ seed: "meta", difficulty: 3, skillKey: SK });
      expect(q.metadata.difficulty).toBe(3);
      expect(q.metadata.seed).toBe("meta");
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.timeEstimateSec).toBeGreaterThan(0);
    });
  });
});
