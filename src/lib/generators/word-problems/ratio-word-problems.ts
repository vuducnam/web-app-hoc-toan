import "server-only";
// Ratio word problems generator — multi-step ratio reasoning, integer answers.
// Templates:
//   T1 (sum-ratio): "Hai số có tổng total, tỉ số a:b. Tìm số bé." → total×b/(a+b)
//   T2 (rectangle): "Hình chữ nhật chiều dài gấp k lần chiều rộng, chu vi P m. Tính chiều rộng." → P/(2(k+1))
//   T3 (D3, split): "Chia total thành 2 phần theo tỉ lệ a:b. Phần lớn hơn là bao nhiêu?" → total×max(a,b)/(a+b)
// D1: simple ratios (sum ≤ 5), small totals — 2-step.
// D2: medium ratios (sum ≤ 8), medium totals — 3-step.
// D3: larger ratios (sum ≤ 12), larger totals — tricky combinatorial.
// answerFormat: numeric; expectedAnswer: integer.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 90, 2: 90, 3: 90 };

// [a, b] ratio pairs ensuring total divisible by (a+b)
const D1_RATIOS: [number, number][] = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2]];
const D2_RATIOS: [number, number][] = [[1, 4], [4, 1], [2, 5], [5, 2], [3, 4], [4, 3], [1, 6], [3, 5]];
const D3_RATIOS: [number, number][] = [[2, 7], [7, 2], [3, 8], [4, 7], [5, 7], [3, 7], [4, 9], [5, 8]];

const RATIOS: Record<number, [number, number][]> = {
  1: D1_RATIOS,
  2: D2_RATIOS,
  3: D3_RATIOS,
};

// Multipliers so total = m × (a+b) stays pedagogically reasonable
const MULTIPLIERS: Record<number, number[]> = {
  1: [6, 8, 10, 12, 15],
  2: [5, 6, 7, 8, 9, 10],
  3: [4, 5, 6, 7, 8],
};

// k values for rectangle template: length = k × width, P divisible by 2(k+1)
const RECT_K: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [2, 3, 4, 5],
  3: [3, 4, 5, 6],
};

// Perimeter multiples of 2(k+1)
const PERIMETER_MULT: Record<number, number[]> = {
  1: [12, 16, 20, 24],
  2: [20, 24, 28, 30, 36],
  3: [24, 28, 32, 36, 40],
};

type TemplateType = "sum-ratio" | "rectangle" | "split-larger";

export const ratioWordProblems: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const templates: TemplateType[] = d === 3
      ? ["sum-ratio", "rectangle", "split-larger"]
      : ["sum-ratio", "rectangle"];
    const templateType = rng.pick(templates);

    let problemText: string;
    let expectedAnswer: number;
    let explanation: string;

    if (templateType === "sum-ratio") {
      const [a, b] = rng.pick(RATIOS[d]);
      const m = rng.pick(MULTIPLIERS[d]);
      const total = m * (a + b);
      const smaller = m * Math.min(a, b);
      const larger = m * Math.max(a, b);
      const bigPart = Math.max(a, b);
      const smallPart = Math.min(a, b);
      // Ask for the smaller number
      expectedAnswer = smaller;
      problemText = `Hai số có tổng là ${total}. Tỉ số của số lớn và số bé là ${bigPart}:${smallPart}. Tìm số bé.`;
      void larger;
      explanation =
        `Tổng số phần: $${bigPart} + ${smallPart} = ${bigPart + smallPart}$.\n\n` +
        `Số bé: $${total} \\times \\dfrac{${smallPart}}{${bigPart + smallPart}} = ${smaller}$.`;
    } else if (templateType === "rectangle") {
      const k = rng.pick(RECT_K[d]);
      const pm = rng.pick(PERIMETER_MULT[d]);
      // P = 2(k+1)×w → w = P / (2(k+1))
      const twoTimesKPlus1 = 2 * (k + 1);
      const P = pm * twoTimesKPlus1;
      expectedAnswer = pm; // width = P / (2(k+1)) = pm
      problemText = `Một hình chữ nhật có chiều dài gấp ${k} lần chiều rộng và có chu vi là ${P} m. Tính chiều rộng của hình chữ nhật (m).`;
      explanation =
        `Đặt chiều rộng là $w$, chiều dài là $${k}w$.\n\n` +
        `Chu vi: $2(${k}w + w) = 2 \\times ${k + 1}w = ${P}$, suy ra $w = \\dfrac{${P}}{${twoTimesKPlus1}} = ${pm}\\,\\text{m}$.`;
    } else {
      // split-larger: divide total into a:b, find larger part
      const [a, b] = rng.pick(RATIOS[d]);
      const m = rng.pick(MULTIPLIERS[d]);
      const total = m * (a + b);
      const largerPart = m * Math.max(a, b);
      const bigPart = Math.max(a, b);
      const smallPart = Math.min(a, b);
      expectedAnswer = largerPart;
      problemText = `Chia ${total} thành 2 phần theo tỉ lệ ${bigPart}:${smallPart}. Phần lớn hơn là bao nhiêu?`;
      explanation =
        `Tổng số phần: $${bigPart} + ${smallPart} = ${bigPart + smallPart}$.\n\n` +
        `Phần lớn hơn: $${total} \\times \\dfrac{${bigPart}}{${bigPart + smallPart}} = ${largerPart}$.`;
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
