import "server-only";
// Addition/subtraction ≤100k generator with enforced carry/borrow in D2/D3.
// D1: operands in [10,999]; D2: [100,9999] with carry; D3: [1000,99999] with carry.
// Carry detection: any digit column overflows (add) or underflows (sub).
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

/** Returns true if adding a+b requires at least one carry. */
function hasCarry(a: number, b: number): boolean {
  let ca = a, cb = b, carry = false;
  while (ca > 0 || cb > 0) {
    if ((ca % 10) + (cb % 10) >= 10) { carry = true; break; }
    ca = Math.floor(ca / 10);
    cb = Math.floor(cb / 10);
  }
  return carry;
}

/** Returns true if subtracting a-b (a≥b) requires at least one borrow. */
function hasBorrow(a: number, b: number): boolean {
  let ca = a, cb = b, borrow = false;
  while (cb > 0) {
    if ((ca % 10) < (cb % 10)) { borrow = true; break; }
    ca = Math.floor(ca / 10);
    cb = Math.floor(cb / 10);
  }
  return borrow;
}

const RANGES: Record<number, [number, number]> = {
  1: [10, 999],
  2: [100, 9_999],
  3: [1_000, 99_999],
};

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 60 };

function tryGenerate(
  rng: ReturnType<typeof makeRng>,
  difficulty: 1 | 2 | 3,
): { a: number; b: number; op: "+" | "-" } {
  const [min, max] = RANGES[difficulty];
  const needsCarry = difficulty >= 2;

  for (let attempt = 0; attempt < 5; attempt++) {
    const a = rng.int(min, max);
    const b = rng.int(min, max);
    const op: "+" | "-" = rng.bool() ? "+" : "-";
    const big = Math.max(a, b);
    const small = Math.min(a, b);

    if (op === "+") {
      if (!needsCarry || hasCarry(a, b)) return { a, b, op };
    } else {
      if (!needsCarry || hasBorrow(big, small)) return { a: big, b: small, op };
    }
  }

  // Fallback: force carry by setting last digit such that digit sum ≥ 10
  const a = rng.int(min, max);
  const lastA = a % 10;
  const forcedLastB = 10 - lastA; // ensures ones column carries
  const b = rng.int(min, max - max % 10) + (forcedLastB <= 9 ? forcedLastB : 0);
  const op: "+" | "-" = "+";
  return { a, b, op };
}

export const addSub100kCarry: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const { a, b, op } = tryGenerate(rng, d);
    const answer = op === "+" ? a + b : a - b;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${a} ${op} ${b} = ?`,
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
