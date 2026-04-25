import "server-only";
// Circle circumference/area generator for Vietnamese G5 curriculum.
// Alternates between C = 2πr and A = πr² per seed (RNG pick).
// π = 3.14. Answer rounded to 2 decimal places.
// D1: r ∈ [2,6]. D2: r ∈ [3,12]. D3: r ∈ [4,20].
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const PI = 3.14;

const R_RANGES: Record<number, [number, number]> = {
  1: [2, 6],
  2: [3, 12],
  3: [4, 20],
};

const TIME_SEC: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

export const circleCircumferenceArea: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    const r = rng.int(R_RANGES[d][0], R_RANGES[d][1]);
    // bool() determines question type: true → circumference, false → area
    const isCircumference = rng.bool();

    let expectedAnswer: number;
    let problemText: string;

    if (isCircumference) {
      expectedAnswer = Math.round(2 * PI * r * 100) / 100;
      problemText = `Đường tròn có bán kính ${r} cm. Chu vi (cm)? (lấy π = 3,14)`;
    } else {
      expectedAnswer = Math.round(PI * r * r * 100) / 100;
      problemText = `Hình tròn có bán kính ${r} cm. Diện tích (cm²)? (lấy π = 3,14)`;
    }

    // Format expectedAnswer with Vietnamese decimal comma
    const answerStr = expectedAnswer.toFixed(2).replace(".", ",");

    const explanation = isCircumference
      ? `$C = 2 \\times \\pi \\times r = 2 \\times 3{,}14 \\times ${r} = ${answerStr}\\,\\text{cm}$.`
      : `$S = \\pi \\times r^2 = 3{,}14 \\times ${r}^2 = 3{,}14 \\times ${r * r} = ${answerStr}\\,\\text{cm}^2$.`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "decimal",
      expectedAnswer,
      explanation,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME_SEC[d],
        questionType: isCircumference ? "circumference" : "area",
      } as Question<number>["metadata"] & { questionType: string },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    return n !== null && equalsWithTolerance(n, q.expectedAnswer, 0.005);
  },
};
