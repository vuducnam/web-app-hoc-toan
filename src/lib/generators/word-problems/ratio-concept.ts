import "server-only";
// Ratio concept word problem generator — integer answer only.
// Templates:
//   T1: "Tỉ số nam:nữ là a:b, lớp có total bạn. Hỏi có bao nhiêu nam?" → total×a/(a+b)
//   T2: "Pha nước cam tỉ lệ 1 phần cam : (k-1) phần nước. Cần total ml, tính lượng cam." → total/k
//   T3: "Tỉ số của a và b là?" → a/b when a divisible by b (integer result)
// D1: small totals, simple ratios (parts sum ≤ 5).
// D2: medium totals, parts sum ≤ 10.
// D3: larger totals, parts sum ≤ 12; T3 included.
// answerFormat: numeric; expectedAnswer: integer.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

type TemplateType = "class-ratio" | "juice-mix" | "simple-ratio";

// Ratio pairs [a, b] where total must be divisible by (a+b)
const D1_RATIOS = [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1]] as const;
const D2_RATIOS = [[2, 3], [3, 2], [1, 4], [4, 1], [3, 4], [4, 3]] as const;
const D3_RATIOS = [[3, 5], [5, 3], [4, 5], [5, 4], [2, 7], [7, 2], [5, 6]] as const;

const RATIOS: Record<number, readonly (readonly [number, number])[]> = {
  1: D1_RATIOS,
  2: D2_RATIOS,
  3: D3_RATIOS,
};

// Multipliers to ensure total = k × (a+b) is reasonable
const MULTIPLIERS: Record<number, number[]> = {
  1: [5, 6, 8, 10],
  2: [4, 5, 6, 7, 8],
  3: [3, 4, 5, 6],
};

// Juice mix denominators (total parts k, cam is 1 part)
const JUICE_K: Record<number, number[]> = {
  1: [2, 3, 4, 5],
  2: [4, 5, 6, 8],
  3: [5, 6, 8, 10],
};
const JUICE_TOTALS: Record<number, number[]> = {
  1: [100, 200, 300, 400],
  2: [300, 400, 500, 600, 800],
  3: [500, 600, 800, 1000],
};

// Simple ratio pairs: a divisible by b
const SIMPLE_PAIRS: Record<number, [number, number][]> = {
  1: [[6, 2], [8, 4], [9, 3], [10, 5]],
  2: [[12, 4], [15, 3], [18, 6], [20, 4], [24, 8]],
  3: [[36, 9], [42, 7], [48, 6], [56, 8], [72, 9]],
};

export const ratioConcept: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    // D1/D2: only class-ratio and juice-mix; D3: add simple-ratio
    const templates: TemplateType[] = d === 3
      ? ["class-ratio", "juice-mix", "simple-ratio"]
      : ["class-ratio", "juice-mix"];
    const templateType = rng.pick(templates);

    let problemText: string;
    let expectedAnswer: number;

    if (templateType === "class-ratio") {
      const [a, b] = rng.pick(RATIOS[d]);
      const multiplier = rng.pick(MULTIPLIERS[d]);
      const total = multiplier * (a + b);
      expectedAnswer = multiplier * a; // count of "nam"
      problemText = `Tỉ số nam và nữ trong lớp là ${a}:${b}. Biết lớp có ${total} bạn. Hỏi lớp có bao nhiêu bạn nam?`;
    } else if (templateType === "juice-mix") {
      const k = rng.pick(JUICE_K[d]); // total parts
      const total = rng.pick(JUICE_TOTALS[d]);
      // Ensure total divisible by k; adjust if needed
      const adjustedTotal = Math.floor(total / k) * k;
      expectedAnswer = adjustedTotal / k; // cam = 1/k of total
      problemText = `Tỉ lệ pha nước cam là 1 phần cam và ${k - 1} phần nước. Cần pha ${adjustedTotal} ml nước cam. Hỏi cần bao nhiêu ml cam?`;
    } else {
      // simple-ratio: "Tỉ số của a và b là?"
      const [a, b] = rng.pick(SIMPLE_PAIRS[d]);
      expectedAnswer = a / b;
      problemText = `Tỉ số của ${a} và ${b} là bao nhiêu?`;
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
