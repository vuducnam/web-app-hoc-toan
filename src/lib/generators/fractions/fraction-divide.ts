import "server-only";
// Fraction division generator — multiply by reciprocal.
// D1: both proper fractions, den ≤ 8. D2: den ≤ 15, result may need simplification.
// D3: dividend may be improper, den ≤ 12.
// n2 always ≥ 1 to keep reciprocal valid (no division by zero in numerator).
// expectedAnswer: simplified Fraction.
import { makeRng } from "../seeded-rng";
import { simplify, equivalent, parseFraction } from "../normalize/fraction";
import type { Fraction, Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

export const fractionDivide: Generator<Fraction> = {
  generate(p: GeneratorParams): Question<Fraction> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let n1: number, d1: number, n2: number, d2: number;

    if (d === 1) {
      // Both proper, den ≤ 8
      d1 = rng.int(2, 8);
      d2 = rng.int(2, 8);
      n1 = rng.int(1, d1 - 1);
      // n2 ∈ [1, d2-1] — ensures reciprocal d2/n2 is valid
      n2 = rng.int(1, d2 - 1);
    } else if (d === 2) {
      // den ≤ 15
      d1 = rng.int(2, 15);
      d2 = rng.int(2, 15);
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d2 - 1);
    } else {
      // D3: dividend may be improper, den ≤ 12
      d1 = rng.int(2, 12);
      d2 = rng.int(2, 12);
      n1 = rng.int(1, d1 + rng.int(0, d1 - 1));
      // divisor n2 must remain ≥ 1 for valid reciprocal
      n2 = rng.int(1, d2 - 1);
    }

    // a/b ÷ c/d = a*d / b*c
    const answer = simplify({ num: n1 * d2, den: d1 * n2 });

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${n1}/${d1} ÷ ${n2}/${d2} = ?`,
      problemLatex: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = ?`,
      answerFormat: "fraction",
      expectedAnswer: answer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<Fraction>): boolean {
    const parsed = parseFraction(userAnswer);
    if (parsed === null) return false;
    return equivalent(parsed, q.expectedAnswer);
  },
};
