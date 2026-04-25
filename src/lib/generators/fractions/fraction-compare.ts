import "server-only";
// Fraction comparison generator — pick <, =, or > between two fractions.
// D1: same denominator (compare numerators). D2: unlike denominators ≤ 12 (cross-multiply).
// D3: includes = case (equivalent fraction pairs) + unlike den ≤ 20.
// answerFormat: multiple-choice; choices: ["<", "=", ">"]
// expectedAnswer: the correct symbol string.
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";

const CHOICES = ["<", "=", ">"] as const;
const TIME: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

/** Cross-multiply compare: returns "<", "=", or ">" */
function compareSymbol(n1: number, d1: number, n2: number, d2: number): string {
  const left = n1 * d2;
  const right = n2 * d1;
  if (left < right) return "<";
  if (left > right) return ">";
  return "=";
}

export const fractionCompare: Generator<string> = {
  generate(p: GeneratorParams): Question<string> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let n1: number, d1: number, n2: number, d2: number;

    if (d === 1) {
      // Same denominator — compare numerators directly
      d1 = rng.int(2, 12);
      d2 = d1;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d1 - 1);
    } else if (d === 2) {
      // Unlike denominators ≤ 12 — no equal case
      d1 = rng.int(2, 12);
      d2 = rng.int(2, 12);
      if (d2 === d1) d2 = d2 === 12 ? 2 : d2 + 1;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d2 - 1);
      // Ensure not accidentally equal; if equal, nudge n2
      if (n1 * d2 === n2 * d1) {
        n2 = n2 === 1 ? 2 : n2 - 1;
        if (n2 < 1) n2 = 1;
      }
    } else {
      // D3: ~1/3 chance of equal pair; unlike den ≤ 20
      const makeEqual = rng.int(0, 2) === 0;
      if (makeEqual) {
        // Equivalent fraction: k*a/k*b vs a/b
        const baseN = rng.int(1, 6);
        const baseD = rng.int(2, 8);
        const k1 = rng.int(1, 3);
        const k2 = rng.int(1, 3);
        n1 = baseN * k1;
        d1 = baseD * k1;
        n2 = baseN * k2;
        d2 = baseD * k2;
      } else {
        d1 = rng.int(2, 20);
        d2 = rng.int(2, 20);
        if (d2 === d1) d2 = d2 === 20 ? 2 : d2 + 1;
        n1 = rng.int(1, d1 - 1);
        n2 = rng.int(1, d2 - 1);
        // Avoid accidental equal
        if (n1 * d2 === n2 * d1) {
          n2 = n2 === 1 ? 2 : n2 - 1;
          if (n2 < 1) n2 = 1;
        }
      }
    }

    const answer = compareSymbol(n1, d1, n2, d2);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `So sánh: ${n1}/${d1} và ${n2}/${d2}`,
      problemLatex: `\\frac{${n1}}{${d1}} \\,\\square\\, \\frac{${n2}}{${d2}}`,
      answerFormat: "multiple-choice",
      choices: [...CHOICES],
      expectedAnswer: answer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<string>): boolean {
    if (!userAnswer || !q.choices) return false;
    const trimmed = userAnswer.trim();
    if (!q.choices.includes(trimmed)) return false;
    return trimmed === q.expectedAnswer;
  },
};
