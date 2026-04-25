import "server-only";
// Common-denominator rewrite generator.
// Given two fractions, rewrite both to their LCM denominator.
// D1: denominators ≤ 12; D2: denominators ≤ 20; D3: denominators ≤ 36.
// expectedAnswer is a JSON string "[num1/den, num2/den]" representing the rewritten pair.
// validate() accepts "a/b,c/d" or "a/b và c/d" (Vietnamese "và" = "and").
import { makeRng } from "../seeded-rng";
import { gcd } from "../normalize/fraction";
import type { Generator, GeneratorParams, Question } from "../types";

/** Least common multiple. */
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

const DEN_MAX: Record<number, number> = { 1: 12, 2: 20, 3: 36 };
const TIME: Record<number, number> = { 1: 35, 2: 45, 3: 55 };

// Answer stored as canonical string "num1/lcd,num2/lcd"
function buildAnswer(n1: number, d1: number, n2: number, d2: number): string {
  const lcd = lcm(d1, d2);
  const rn1 = (n1 * lcd) / d1;
  const rn2 = (n2 * lcd) / d2;
  return `${rn1}/${lcd},${rn2}/${lcd}`;
}

/** Normalise user input to "num1/den,num2/den" for comparison. */
function normalizeInput(input: string): string {
  // Accept both "và" and comma as separator between the two fractions
  return input
    .trim()
    .replace(/\s*và\s*/i, ",")
    .replace(/\s+/g, "")
    .replace(/;/, ",");
}

export const fractionCommonDenominator: Generator<string> = {
  generate(p: GeneratorParams): Question<string> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const maxDen = DEN_MAX[d];
    const d1 = rng.int(2, maxDen);
    // Ensure d2 ≠ d1 and pair has non-trivial LCD
    let d2 = rng.int(2, maxDen);
    if (d2 === d1) d2 = d2 === maxDen ? 2 : d2 + 1;

    const n1 = rng.int(1, d1 - 1);
    const n2 = rng.int(1, d2 - 1);

    const answer = buildAnswer(n1, d1, n2, d2);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Quy đồng mẫu số: \\frac{${n1}}{${d1}} và \\frac{${n2}}{${d2}}`,
      answerFormat: "text",
      expectedAnswer: answer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<string>): boolean {
    return normalizeInput(userAnswer) === q.expectedAnswer;
  },
};
