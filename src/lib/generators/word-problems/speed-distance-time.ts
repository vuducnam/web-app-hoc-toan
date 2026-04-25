import "server-only";
// Speed-distance-time word problem generator.
// Formula: v = s/t, s = v×t, t = s/v — always integer answers.
// 3 template types picked by RNG: find-speed, find-distance, find-time.
// D1: small numbers (v∈[20,60] step 5, t∈[1,5], s divisible).
// D2: medium numbers (v∈[30,90] step 10, t∈[2,8]).
// D3: larger numbers (v∈[40,120] step 10, t∈[3,10]).
// answerFormat: numeric; expectedAnswer: integer.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 90, 2: 90, 3: 90 };

// Speed candidates per difficulty (multiples ensure integer division)
const SPEEDS: Record<number, number[]> = {
  1: [20, 25, 30, 35, 40, 45, 50, 60],
  2: [30, 40, 50, 60, 70, 80, 90],
  3: [40, 50, 60, 70, 80, 90, 100, 110, 120],
};
const TIMES: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5],
  2: [2, 3, 4, 5, 6, 7, 8],
  3: [3, 4, 5, 6, 7, 8, 9, 10],
};

type TemplateType = "find-speed" | "find-distance" | "find-time";
const TEMPLATE_TYPES: TemplateType[] = ["find-speed", "find-distance", "find-time"];

export const speedDistanceTime: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const templateType = rng.pick(TEMPLATE_TYPES);
    const v = rng.pick(SPEEDS[d]);
    const t = rng.pick(TIMES[d]);
    const s = v * t; // always integer

    let problemText: string;
    let expectedAnswer: number;

    if (templateType === "find-speed") {
      problemText = `Một ô tô đi quãng đường ${s} km trong ${t} giờ. Hỏi vận tốc của ô tô là bao nhiêu km/giờ?`;
      expectedAnswer = v; // s / t
    } else if (templateType === "find-distance") {
      problemText = `Một xe máy đi với vận tốc ${v} km/giờ trong ${t} giờ. Hỏi xe đi được bao nhiêu km?`;
      expectedAnswer = s; // v × t
    } else {
      problemText = `Một tàu hỏa đi quãng đường ${s} km với vận tốc ${v} km/giờ. Hỏi tàu đi hết bao nhiêu giờ?`;
      expectedAnswer = t; // s / v
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME_SEC[d],
        template: templateType,
      } as Question<number>["metadata"] & { template: TemplateType },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
