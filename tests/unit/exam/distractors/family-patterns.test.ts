import { describe, it, expect } from "vitest";
import { decimalDistractors } from "@/lib/exam/distractors/decimals";
import { fractionDistractors } from "@/lib/exam/distractors/fractions";
import { percentDistractors } from "@/lib/exam/distractors/percent";
import { arithmeticDistractors } from "@/lib/exam/distractors/arithmetic";
import { geometryDistractors } from "@/lib/exam/distractors/geometry";
import { unitConversionDistractors } from "@/lib/exam/distractors/unit-conversion";
import { wordProblemDistractors } from "@/lib/exam/distractors/word-problems";
import { fallbackDistractors } from "@/lib/exam/distractors/fallback";
import { makeRng } from "@/lib/generators/seeded-rng";

const fns = {
  decimals: decimalDistractors,
  fractions: fractionDistractors,
  percent: percentDistractors,
  arithmetic: arithmeticDistractors,
  geometry: geometryDistractors,
  "unit-conversion": unitConversionDistractors,
  "word-problems": wordProblemDistractors,
  fallback: fallbackDistractors,
};

const samples = {
  decimals: ["12.5", "0.25", "100.0", "3,14"],
  fractions: ["3/4", "1/2", "5/8", "12"],
  percent: ["15%", "100%", "12"],
  arithmetic: ["12345", "100", "9999", "1"],
  geometry: ["18.5", "100", "3.14"],
  "unit-conversion": ["1200 cm", "5 kg", "100"],
  "word-problems": ["120", "50.5", "12"],
  fallback: ["42", "100", "abc"],
};

for (const [family, fn] of Object.entries(fns)) {
  describe(`${family} distractors`, () => {
    const correctSamples = samples[family as keyof typeof samples];
    it.each(correctSamples)("produces ≥3 unique distractors for %s", (correct) => {
      const out = fn(correct, makeRng("seed-1"));
      expect(out.length).toBeGreaterThanOrEqual(3);
      // No distractor equals correct
      for (const d of out.slice(0, 3)) {
        expect(d.trim()).not.toBe(correct.trim());
      }
      // First 3 are unique
      const first3 = out.slice(0, 3);
      expect(new Set(first3).size).toBe(first3.length);
    });

    it("is deterministic for same seed", () => {
      const a = fn(correctSamples[0], makeRng("seed-x"));
      const b = fn(correctSamples[0], makeRng("seed-x"));
      expect(a.slice(0, 3)).toEqual(b.slice(0, 3));
    });
  });
}
