import "server-only";
// Angle classification generator — identify angle type from degree measure.
// D1: simple non-boundary angles (avoid 90, 180) from preset list.
// D2: includes boundary values 90 and 180.
// D3: tricky near-boundary values like 89, 91, 179.
// answerFormat: multiple-choice; choices: ["nhọn", "vuông", "tù", "bẹt"].
// expectedAnswer: the correct Vietnamese classification string.
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";

const CHOICES = ["nhọn", "vuông", "tù", "bẹt"] as const;
const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

// D1: simple cases, clearly non-boundary
const D1_ANGLES = [30, 45, 60, 75, 100, 120, 150] as const;
// D2: includes boundary values
const D2_ANGLES = [30, 60, 90, 100, 135, 150, 180] as const;
// D3: near-boundary tricky angles
const D3_ANGLES = [1, 89, 90, 91, 135, 179, 180] as const;

function classify(angle: number): string {
  if (angle > 0 && angle < 90) return "nhọn";
  if (angle === 90) return "vuông";
  if (angle > 90 && angle < 180) return "tù";
  return "bẹt";
}

export const angleClassify: Generator<string> = {
  generate(p: GeneratorParams): Question<string> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let angle: number;
    if (d === 1) {
      angle = rng.pick(D1_ANGLES);
    } else if (d === 2) {
      angle = rng.pick(D2_ANGLES);
    } else {
      angle = rng.pick(D3_ANGLES);
    }

    const expectedAnswer = classify(angle);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Góc có số đo ${angle}° là góc nào?`,
      answerFormat: "multiple-choice",
      choices: [...CHOICES],
      expectedAnswer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<string>): boolean {
    if (!userAnswer || typeof userAnswer !== "string") return false;
    if (!q.choices?.includes(userAnswer.trim())) return false;
    return userAnswer.trim() === q.expectedAnswer;
  },
};
