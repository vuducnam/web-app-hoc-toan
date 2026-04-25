import { describe, it, expect } from "vitest";
import { fractionsReview } from "@/lib/generators/fractions/fractions-review";

describe("fractions-review generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed at difficulty %s produces identical question", (difficulty) => {
      const params = { seed: "fr-seed", difficulty: difficulty as 1 | 2 | 3, skillKey: "fractions-review" };
      expect(fractionsReview.generate(params)).toEqual(fractionsReview.generate(params));
    });
  });

  describe("answer format", () => {
    it("returns fraction answerFormat", () => {
      const q = fractionsReview.generate({ seed: "fr-fmt", difficulty: 1, skillKey: "fractions-review" });
      expect(q.answerFormat).toBe("fraction");
      expect(q.expectedAnswer).toHaveProperty("num");
      expect(q.expectedAnswer).toHaveProperty("den");
    });
  });

  describe("composite behaviour", () => {
    it("different seeds pick different sub-generators (variety over 20 seeds)", () => {
      const texts = new Set(
        Array.from({ length: 20 }, (_, i) =>
          fractionsReview.generate({ seed: `fr-var-${i}`, difficulty: 2, skillKey: "fractions-review" }).problemText
        )
      );
      // Should have more than 1 unique problem text pattern
      expect(texts.size).toBeGreaterThan(1);
    });

    it("sub-seed is stable — same parent seed always delegates to same sub", () => {
      const q1 = fractionsReview.generate({ seed: "fr-stable", difficulty: 1, skillKey: "fractions-review" });
      const q2 = fractionsReview.generate({ seed: "fr-stable", difficulty: 1, skillKey: "fractions-review" });
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.expectedAnswer).toEqual(q2.expectedAnswer);
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = fractionsReview.generate({ seed: "fr-valid", difficulty: 1, skillKey: "fractions-review" });
      expect(fractionsReview.validate(`${q.expectedAnswer.num}/${q.expectedAnswer.den}`, q)).toBe(true);
    });

    it("rejects wrong answer", () => {
      const q = fractionsReview.generate({ seed: "fr-wrong", difficulty: 2, skillKey: "fractions-review" });
      expect(fractionsReview.validate("99/1", q)).toBe(false);
    });

    it("rejects malformed input", () => {
      const q = fractionsReview.generate({ seed: "fr-bad", difficulty: 1, skillKey: "fractions-review" });
      expect(fractionsReview.validate("", q)).toBe(false);
      expect(fractionsReview.validate("nope", q)).toBe(false);
    });
  });
});
