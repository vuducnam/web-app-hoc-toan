import "server-only";
// Percentage-of-whole generator — "X% của Y là ?" (Vietnamese).
// Whole is always chosen so that (percent/100)*whole is a clean integer.
// D1: common percentages {10,25,50} of small multiples; D2: any multiple of 5%; D3: any multiple of 1%.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 40, 3: 50 };

export const percentOfWhole: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let pct: number, whole: number;

    if (d === 1) {
      // Common percentages only; whole is a small multiple to keep answer clean
      pct = rng.pick([10, 25, 50] as const);
      // Whole must be divisible by (100/pct) to give integer answer
      const divisor = 100 / pct; // 10→10, 25→4, 50→2
      const multiplier = rng.int(1, 20);
      whole = divisor * multiplier;
    } else if (d === 2) {
      // Multiples of 5% in [5,95]; whole chosen as multiple of 20 to stay integer-safe
      pct = rng.int(1, 19) * 5;
      // whole must be divisible by 100/gcd(pct,100)
      // Safest: whole is a multiple of 100 divided by gcd(pct,100)
      const g = gcd(pct, 100);
      const divisor = 100 / g;
      whole = divisor * rng.int(1, 10);
    } else {
      // Any percentage 1-99; whole is a multiple of 100 to guarantee integer
      pct = rng.int(1, 99);
      whole = rng.int(1, 20) * 100;
    }

    const answer = Math.round((pct / 100) * whole);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${pct}% của ${whole} là ?`,
      answerFormat: "numeric",
      expectedAnswer: answer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) { const t = b; b = a % b; a = t; }
  return a;
}
