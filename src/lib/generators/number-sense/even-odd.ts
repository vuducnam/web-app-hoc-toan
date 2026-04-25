import "server-only";
// Generator: classify a number as even (chẵn) or odd (lẻ).
// D1: 1–2 digit numbers (1–99). D2: 3–4 digits (100–9999). D3: 5–6 digits (10000–999999).
// answerFormat: multiple-choice — choices always ["Số chẵn", "Số lẻ"].
// validate: case-insensitive trim equality against expectedAnswer.
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 30, 3: 30 };

const CHOICES = ["Số chẵn", "Số lẻ"] as const;

const RANGES: Record<number, [number, number]> = {
  1: [1, 99],
  2: [100, 9_999],
  3: [10_000, 999_999],
};

export const evenOdd: Generator<string> = {
  generate(p: GeneratorParams): Question<string> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const [min, max] = RANGES[d];
    const n = rng.int(min, max);
    const isEven = n % 2 === 0;
    const expectedAnswer = isEven ? "Số chẵn" : "Số lẻ";

    // Explanation: point to last digit as the deciding factor
    const lastDigit = n % 10;
    const explanation = isEven
      ? `Đáp án: Số chẵn.\n\nChữ số tận cùng của $${n}$ là $${lastDigit}$, là số chẵn nên $${n}$ là **số chẵn**.`
      : `Đáp án: Số lẻ.\n\nChữ số tận cùng của $${n}$ là $${lastDigit}$, là số lẻ nên $${n}$ là **số lẻ**.`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Số ${n} là số chẵn hay số lẻ?`,
      answerFormat: "multiple-choice",
      choices: [...CHOICES],
      expectedAnswer,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<string>): boolean {
    if (!userAnswer || typeof userAnswer !== "string") return false;
    return userAnswer.trim().toLowerCase() === (q.expectedAnswer as string).trim().toLowerCase();
  },
};
