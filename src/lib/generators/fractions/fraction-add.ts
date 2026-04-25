import "server-only";
// Fraction addition generator.
// D1: same denominator; D2: unlike denominators (den ≤ 20); D3: unlike + result needs simplification.
// expectedAnswer: simplified Fraction.
import { makeRng } from "../seeded-rng";
import { gcd, simplify, equivalent, parseFraction } from "../normalize/fraction";
import type { Fraction, Generator, GeneratorParams, Question } from "../types";

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function addFractions(n1: number, d1: number, n2: number, d2: number): Fraction {
  const lcd = lcm(d1, d2);
  return simplify({ num: n1 * (lcd / d1) + n2 * (lcd / d2), den: lcd });
}

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 55 };

export const fractionAdd: Generator<Fraction> = {
  generate(p: GeneratorParams): Question<Fraction> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let n1: number, d1: number, n2: number, d2: number;

    if (d === 1) {
      // Same denominator
      d1 = rng.int(2, 12);
      d2 = d1;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d1 - 1);
    } else if (d === 2) {
      // Unlike denominators ≤ 20
      d1 = rng.int(2, 20);
      d2 = rng.int(2, 20);
      if (d2 === d1) d2 = d2 === 20 ? 2 : d2 + 1;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d2 - 1);
    } else {
      // D3: result will likely need simplification (use multiples as denominators)
      const base = rng.int(2, 8);
      d1 = base * rng.int(2, 3);
      d2 = base * rng.int(2, 3);
      if (d2 === d1) d2 = d1 + base;
      n1 = rng.int(1, d1 - 1);
      n2 = rng.int(1, d2 - 1);
    }

    const answer = addFractions(n1, d1, n2, d2);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${n1}/${d1} + ${n2}/${d2} = ?`,
      problemLatex: `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = ?`,
      answerFormat: "fraction",
      expectedAnswer: answer,
      explanation:
        `$\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = \\frac{${answer.num}}{${answer.den}}$.\n\n` +
        `Quy đồng mẫu số rồi cộng tử số với nhau, sau đó rút gọn nếu cần.`,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<Fraction>): boolean {
    const parsed = parseFraction(userAnswer);
    if (parsed === null) return false;
    return equivalent(parsed, q.expectedAnswer);
  },
};
