import { describe, it, expect } from "vitest";
import { naturalNumbersReview } from "@/lib/generators/number-sense/natural-numbers-review";

describe("natural-numbers-review generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "nnr-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "natural-numbers-review" };
      expect(naturalNumbersReview.generate(params)).toEqual(naturalNumbersReview.generate(params));
    });
  });

  describe("answer format", () => {
    it("returns numeric answerFormat for all difficulties", () => {
      for (const d of [1, 2, 3] as const) {
        const q = naturalNumbersReview.generate({ seed: `nnr-fmt-${d}`, difficulty: d, skillKey: "natural-numbers-review" });
        expect(q.answerFormat).toBe("numeric");
      }
    });

    it("metadata records composedFrom — picked sub-generator key", () => {
      const q = naturalNumbersReview.generate({ seed: "nnr-meta", difficulty: 2, skillKey: "natural-numbers-review" });
      const composedFrom = (q.metadata as { composedFrom?: string }).composedFrom;
      expect(composedFrom).toBeDefined();
      expect(typeof composedFrom).toBe("string");
    });
  });

  describe("composite behaviour", () => {
    it("different seeds pick different sub-generators (variety over 30 seeds)", () => {
      const subs = new Set(
        Array.from({ length: 30 }, (_, i) => {
          const q = naturalNumbersReview.generate({
            seed: `nnr-var-${i}`,
            difficulty: 2,
            skillKey: "natural-numbers-review",
          });
          return (q.metadata as { composedFrom?: string }).composedFrom;
        })
      );
      // 9 sub-generators registered — expect at least 4 distinct picks across 30 seeds
      expect(subs.size).toBeGreaterThanOrEqual(4);
    });

    it("sub-seed is stable — same parent seed always delegates to same sub", () => {
      const q1 = naturalNumbersReview.generate({ seed: "nnr-stable", difficulty: 1, skillKey: "natural-numbers-review" });
      const q2 = naturalNumbersReview.generate({ seed: "nnr-stable", difficulty: 1, skillKey: "natural-numbers-review" });
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect((q1.metadata as { composedFrom?: string }).composedFrom).toBe(
        (q2.metadata as { composedFrom?: string }).composedFrom
      );
    });
  });

  describe("validation", () => {
    it("accepts correct answer for picked sub", () => {
      // Sample many seeds to cover multiple sub-generators
      for (let i = 0; i < 15; i++) {
        const q = naturalNumbersReview.generate({
          seed: `nnr-valid-${i}`,
          difficulty: 1,
          skillKey: "natural-numbers-review",
        });
        // expectedAnswer is sub's expectedAnswer; for divide-1-digit D3 it may be quotient only.
        // Submit the bare numeric answer — validate delegates to sub which accepts both forms.
        const userAnswer = String(q.expectedAnswer);
        expect(naturalNumbersReview.validate(userAnswer, q)).toBe(true);
      }
    });

    it("rejects wrong answer", () => {
      const q = naturalNumbersReview.generate({ seed: "nnr-wrong", difficulty: 2, skillKey: "natural-numbers-review" });
      // Pick a number that is virtually impossible to be the right answer
      expect(naturalNumbersReview.validate("999999999", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = naturalNumbersReview.generate({ seed: "nnr-bad", difficulty: 1, skillKey: "natural-numbers-review" });
      expect(naturalNumbersReview.validate("", q)).toBe(false);
      expect(naturalNumbersReview.validate("not-a-number", q)).toBe(false);
    });

    it("rejects when composedFrom metadata missing", () => {
      const q = naturalNumbersReview.generate({ seed: "nnr-strip", difficulty: 1, skillKey: "natural-numbers-review" });
      const stripped = {
        ...q,
        metadata: {
          difficulty: q.metadata.difficulty,
          seed: q.metadata.seed,
          skillKey: q.metadata.skillKey,
          timeEstimateSec: q.metadata.timeEstimateSec,
        },
      };
      expect(naturalNumbersReview.validate(String(q.expectedAnswer), stripped)).toBe(false);
    });
  });
});
