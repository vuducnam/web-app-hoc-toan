import "server-only";
// Generator: integer × or ÷ by powers of 10 (10, 100, 1000).
// Boundary vs decimal-powers-10 (Phase 02): INTEGER operands ONLY here.
// decimal-powers-10 handles decimals × ÷ {10, 100, 0.1, 0.01}.
// D1: × 10 or × 100, base in [2, 99].
// D2: × 1000 or ÷ 10, base in [10, 9999]; division is always exact.
// D3: mixed × ÷ {10,100,1000}, base in [100, 99999]; division always exact.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 30, 3: 30 };

type Op = "×" | "÷";

interface Config {
  base: number;
  power: number;
  op: Op;
  answer: number;
}

function generateConfig(
  rng: ReturnType<typeof makeRng>,
  difficulty: 1 | 2 | 3,
): Config {
  if (difficulty === 1) {
    const base = rng.int(2, 99);
    const power = rng.pick([10, 100] as const);
    return { base, power, op: "×", answer: base * power };
  }

  if (difficulty === 2) {
    if (rng.bool()) {
      // × 1000
      const base = rng.int(10, 999);
      return { base, power: 1_000, op: "×", answer: base * 1_000 };
    } else {
      // ÷ 10 (exact) — pick base that is multiple of 10
      const quotient = rng.int(10, 999);
      const base = quotient * 10;
      return { base, power: 10, op: "÷", answer: quotient };
    }
  }

  // D3: mixed × ÷ {10, 100, 1000}
  const powers = [10, 100, 1_000] as const;
  const power = rng.pick(powers);
  const isMultiply = rng.bool();

  if (isMultiply) {
    const base = rng.int(100, Math.floor(99_999 / power));
    return { base, power, op: "×", answer: base * power };
  } else {
    // exact division — pick quotient first
    const quotient = rng.int(100, Math.floor(99_999 / power));
    const base = quotient * power;
    return { base, power, op: "÷", answer: quotient };
  }
}

export const multiplyDividePowers10: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const { base, power, op, answer } = generateConfig(rng, d);

    // Explanation: describe the zero-appending / removing rule
    const zeros = Math.log10(power); // number of zeros in power (1, 2, or 3)
    const explanation = op === "×"
      ? `Đáp án: $${answer}$.\n\n` +
        `Nhân với $${power}$ (${zeros} chữ số $0$): ` +
        `thêm $${zeros}$ chữ số $0$ vào cuối $${base}$ được $${answer}$.`
      : `Đáp án: $${answer}$.\n\n` +
        `Chia cho $${power}$ (${zeros} chữ số $0$): ` +
        `bỏ $${zeros}$ chữ số $0$ ở cuối $${base}$ được $${answer}$.`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${base} ${op} ${power} = ?`,
      answerFormat: "numeric",
      expectedAnswer: answer,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
