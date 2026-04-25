import { describe, it, expect } from "vitest";
import { semester1ReviewArithmetic } from "@/lib/generators/reviews/semester1-review-arithmetic";
import { semester1ReviewDecimals } from "@/lib/generators/reviews/semester1-review-decimals";
import { yearReviewArithmetic } from "@/lib/generators/reviews/year-review-arithmetic";
import { yearReviewFractions } from "@/lib/generators/reviews/year-review-fractions";
import { yearReviewComprehensive } from "@/lib/generators/reviews/year-review-comprehensive";
import type { Generator } from "@/lib/generators/types";

const REVIEWS: ReadonlyArray<{ name: string; gen: Generator<unknown>; format: string }> = [
  { name: "semester1-review-arithmetic", gen: semester1ReviewArithmetic as Generator<unknown>, format: "numeric" },
  { name: "semester1-review-decimals",   gen: semester1ReviewDecimals   as Generator<unknown>, format: "decimal" },
  { name: "year-review-arithmetic",      gen: yearReviewArithmetic      as Generator<unknown>, format: "numeric" },
  { name: "year-review-fractions",       gen: yearReviewFractions       as Generator<unknown>, format: "fraction" },
  { name: "year-review-comprehensive",   gen: yearReviewComprehensive   as Generator<unknown>, format: "numeric" },
];

describe.each(REVIEWS)("composite review: $name", ({ name, gen, format }) => {
  it.each([1, 2, 3])("determinism @ D%s — same seed yields identical question", (d) => {
    const params = { seed: `${name}-d${d}`, difficulty: d as 1 | 2 | 3, skillKey: name };
    expect(gen.generate(params)).toEqual(gen.generate(params));
  });

  it("returns expected answerFormat", () => {
    const q = gen.generate({ seed: `${name}-fmt`, difficulty: 1, skillKey: name });
    expect(q.answerFormat).toBe(format);
  });

  it("metadata.composedFrom present", () => {
    const q = gen.generate({ seed: `${name}-cf`, difficulty: 2, skillKey: name });
    const composedFrom = (q.metadata as { composedFrom?: string }).composedFrom;
    expect(typeof composedFrom).toBe("string");
    expect(composedFrom?.length).toBeGreaterThan(0);
  });

  it("variety — different seeds pick varied subs", () => {
    const subs = new Set(
      Array.from({ length: 30 }, (_, i) => {
        const q = gen.generate({ seed: `${name}-var-${i}`, difficulty: 2, skillKey: name });
        return (q.metadata as { composedFrom?: string }).composedFrom;
      }),
    );
    // Each composite has ≥6 sub-generators; expect ≥3 distinct picks across 30 seeds
    expect(subs.size).toBeGreaterThanOrEqual(3);
  });

  it("validate() rejects empty / malformed", () => {
    const q = gen.generate({ seed: `${name}-bad`, difficulty: 1, skillKey: name });
    expect(gen.validate("", q)).toBe(false);
    expect(gen.validate("xyzzy", q)).toBe(false);
  });

  it("validate() rejects when composedFrom metadata missing", () => {
    const q = gen.generate({ seed: `${name}-strip`, difficulty: 1, skillKey: name });
    const stripped = {
      ...q,
      metadata: {
        difficulty: q.metadata.difficulty,
        seed: q.metadata.seed,
        skillKey: q.metadata.skillKey,
        timeEstimateSec: q.metadata.timeEstimateSec,
      },
    };
    // Use any plausible string answer — should reject due to missing composedFrom
    expect(gen.validate("0", stripped)).toBe(false);
  });
});
