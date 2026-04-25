import "server-only";
// Fraction simplification generator.
// Generates a non-coprime fraction (a*k / b*k); answer is the simplified form.
// D1: GCF = 2; D2: GCF ∈ {3,4,5}; D3: GCF ∈ {6,8,10,12}.
import { makeRng } from "../seeded-rng";
import { simplify, equivalent, parseFraction } from "../normalize/fraction";
import type { Fraction, Generator, GeneratorParams, Question } from "../types";

const GCF_POOL: Record<number, number[]> = {
  1: [2],
  2: [3, 4, 5],
  3: [6, 8, 10, 12],
};

const TIME: Record<number, number> = { 1: 30, 2: 40, 3: 50 };

export const simplifyFraction: Generator<Fraction> = {
  generate(p: GeneratorParams): Question<Fraction> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const k = rng.pick(GCF_POOL[d]);
    // Base fraction a/b where a,b are small coprimes in [2,9]
    const a = rng.int(1, 9);
    const b = rng.int(2, 9);
    const num = a * k;
    const den = b * k;
    const answer = simplify({ num, den });

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Rút gọn phân số \\frac{${num}}{${den}}`,
      problemLatex: `\\frac{${num}}{${den}}`,
      answerFormat: "fraction",
      expectedAnswer: answer,
      explanation:
        `$\\frac{${num}}{${den}} = \\frac{${num} \\div ${k}}{${den} \\div ${k}} = \\frac{${answer.num}}{${answer.den}}$.\n\n` +
        `ƯCLN của ${num} và ${den} là ${k}. Chia cả tử số và mẫu số cho ${k} để rút gọn.`,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<Fraction>): boolean {
    const parsed = parseFraction(userAnswer);
    if (parsed === null) return false;
    return equivalent(parsed, q.expectedAnswer);
  },
};
