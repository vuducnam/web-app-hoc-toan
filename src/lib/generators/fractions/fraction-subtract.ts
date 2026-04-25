import "server-only";
// Fraction subtraction generator.
// D1: same denominator; D2: unlike denominators (den ≤ 20); D3: unlike + simplification needed.
// Larger operand always comes first to guarantee positive result.
// expectedAnswer: simplified Fraction.
import { makeRng } from "../seeded-rng";
import { gcd, simplify, equivalent, parseFraction } from "../normalize/fraction";
import type { Fraction, Generator, GeneratorParams, Question } from "../types";

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function subFractions(n1: number, d1: number, n2: number, d2: number): Fraction {
  const lcd = lcm(d1, d2);
  return simplify({ num: n1 * (lcd / d1) - n2 * (lcd / d2), den: lcd });
}

/** Ensure a/d1 >= b/d2 to avoid negative result. Swap if needed, return ordered pair. */
function orderOperands(
  n1: number, d1: number, n2: number, d2: number,
): [number, number, number, number] {
  // Compare cross-multiply: n1*d2 vs n2*d1
  if (n1 * d2 >= n2 * d1) return [n1, d1, n2, d2];
  return [n2, d2, n1, d1];
}

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 55 };

export const fractionSubtract: Generator<Fraction> = {
  generate(p: GeneratorParams): Question<Fraction> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let n1: number, d1: number, n2: number, d2: number;

    if (d === 1) {
      d1 = rng.int(2, 12);
      d2 = d1;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d1 - 1);
    } else if (d === 2) {
      d1 = rng.int(2, 20);
      d2 = rng.int(2, 20);
      if (d2 === d1) d2 = d2 === 20 ? 2 : d2 + 1;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d2 - 1);
    } else {
      const base = rng.int(2, 8);
      d1 = base * rng.int(2, 3);
      d2 = base * rng.int(2, 3);
      if (d2 === d1) d2 = d1 + base;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d2 - 1);
    }

    const [an1, ad1, an2, ad2] = orderOperands(n1, d1, n2, d2);
    const answer = subFractions(an1, ad1, an2, ad2);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${an1}/${ad1} - ${an2}/${ad2} = ?`,
      problemLatex: `\\frac{${an1}}{${ad1}} - \\frac{${an2}}{${ad2}} = ?`,
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
