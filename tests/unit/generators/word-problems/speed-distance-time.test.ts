import { describe, it, expect } from "vitest";
import { speedDistanceTime } from "@/lib/generators/word-problems/speed-distance-time";

const SK = "g5-speed-distance-time";

describe("speed-distance-time generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = speedDistanceTime.generate(p);
      const q2 = speedDistanceTime.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = speedDistanceTime.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        texts.add(q.problemText);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe("all 3 template types appear", () => {
    it("find-speed, find-distance, find-time all generated across 30 seeds", () => {
      const texts = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const q = speedDistanceTime.generate({ seed: `tmpl-${i}`, difficulty: 2, skillKey: SK });
        texts.add(q.problemText);
      }
      const joined = [...texts].join(" ");
      expect(joined).toMatch(/vận tốc/i);
      expect(joined).toMatch(/quãng đường/i);
      expect(joined).toMatch(/bao nhiêu giờ|hết bao nhiêu/i);
    });
  });

  describe("integer answer invariant", () => {
    it("all answers are positive integers across 30 seeds × 3 difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 30; i++) {
          const q = speedDistanceTime.generate({ seed: `int-${d}-${i}`, difficulty: d, skillKey: SK });
          expect(Number.isInteger(q.expectedAnswer)).toBe(true);
          expect(q.expectedAnswer as number).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("answer correctness", () => {
    it("find-speed: answer = distance / time", () => {
      // Check all seeds until we find a find-speed template
      for (let i = 0; i < 30; i++) {
        const q = speedDistanceTime.generate({ seed: `fs-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("Hỏi vận tốc")) {
          // Extract numbers from "đi quãng đường S km trong T giờ"
          const match = q.problemText.match(/(\d+) km trong (\d+) giờ/);
          if (match) {
            const s = parseInt(match[1], 10);
            const t = parseInt(match[2], 10);
            expect(q.expectedAnswer).toBe(s / t);
          }
        }
      }
    });

    it("find-distance: answer = speed × time", () => {
      for (let i = 0; i < 30; i++) {
        const q = speedDistanceTime.generate({ seed: `fd-${i}`, difficulty: 1, skillKey: SK });
        if (q.problemText.includes("Hỏi xe đi được")) {
          const match = q.problemText.match(/vận tốc (\d+) km\/giờ trong (\d+) giờ/);
          if (match) {
            const v = parseInt(match[1], 10);
            const t = parseInt(match[2], 10);
            expect(q.expectedAnswer).toBe(v * t);
          }
        }
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = speedDistanceTime.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(speedDistanceTime.validate(String(q.expectedAnswer), q)).toBe(true);
    });

    it("rejects wrong answer (off by 1)", () => {
      const q = speedDistanceTime.generate({ seed: "val-wrong", difficulty: 2, skillKey: SK });
      expect(speedDistanceTime.validate(String((q.expectedAnswer as number) + 1), q)).toBe(false);
    });

    it("rejects non-numeric input", () => {
      const q = speedDistanceTime.generate({ seed: "val-bad", difficulty: 1, skillKey: SK });
      expect(speedDistanceTime.validate("abc", q)).toBe(false);
      expect(speedDistanceTime.validate("", q)).toBe(false);
    });
  });

  describe("metadata", () => {
    it("answerFormat is numeric", () => {
      const q = speedDistanceTime.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("numeric");
    });

    it("timeEstimateSec is 90 for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = speedDistanceTime.generate({ seed: "time-test", difficulty: d, skillKey: SK });
        expect(q.metadata.timeEstimateSec).toBe(90);
      }
    });
  });
});
