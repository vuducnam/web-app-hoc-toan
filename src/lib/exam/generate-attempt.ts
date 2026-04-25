// Generate ordered exam questions from ExamPaper structure + student seed.
// Pure function: no DB, no auth - registry injected.
import "server-only";
import { makeRng } from "@/lib/generators/seeded-rng";
import type { Difficulty, Generator } from "@/lib/generators/types";
import { formatExpectedAnswer } from "@/lib/practice/format-expected-answer";
import { buildChoices } from "./distractors";
import type {
  DifficultyLevel,
  ExamSlot,
  GeneratedQuestion,
  QuestionType,
} from "./types";

/** Map M1-M4 difficulty to generator's 1|2|3 difficulty hint. */
export function mapMtoDifficulty(level: DifficultyLevel): Difficulty {
  switch (level) {
    case "M1":
    case "M2":
      return 1;
    case "M3":
      return 2;
    case "M4":
      return 3;
  }
}

export interface GenerateAttemptInput {
  examPaperId: string;
  structure: ExamSlot[];
  seed: string;
  registry: Record<string, Generator>;
}

/**
 * Generate the ordered list of questions for an attempt.
 * Deterministic: same (structure, seed) always returns identical output.
 */
export function generateAttempt(input: GenerateAttemptInput): GeneratedQuestion[] {
  const { structure, seed, registry } = input;
  return structure.map((slot) => generateOneSlot(slot, seed, registry));
}

function generateOneSlot(
  slot: ExamSlot,
  baseSeed: string,
  registry: Record<string, Generator>,
): GeneratedQuestion {
  const slotSeed = `${baseSeed}-slot-${slot.slotNo}`;
  const rng = makeRng(slotSeed);

  // Pick a skill from pool
  const skillKey = pickFromPool(slot.skillPool, registry, rng);
  const generator = registry[skillKey];
  if (!generator) {
    throw new Error(
      `Generator missing for skill "${skillKey}" in slot ${slot.slotNo}`,
    );
  }

  const difficulty = mapMtoDifficulty(slot.difficulty);
  // Use slot-specific seed scoped for the generator
  const genSeed = `${slotSeed}-gen`;
  const q = generator.generate({ seed: genSeed, difficulty, skillKey });

  const expectedFormatted = formatExpectedAnswer(q.expectedAnswer, q.answerFormat);

  let choices: GeneratedQuestion["choices"] = null;
  let correctIndex: number | null = null;
  if (slot.questionType === "MC") {
    const built = buildChoices(expectedFormatted, skillKey, rng);
    choices = built.choices;
    correctIndex = built.correctIndex;
  }

  return {
    slotNo: slot.slotNo,
    skillKey,
    difficulty: slot.difficulty,
    questionType: slot.questionType as QuestionType,
    questionText: q.problemText,
    expectedAnswer: expectedFormatted,
    choices,
    correctIndex,
    pointWeight: slot.pointWeight,
  };
}

function pickFromPool(
  pool: string[],
  registry: Record<string, Generator>,
  rng: ReturnType<typeof makeRng>,
): string {
  // Filter to keys that have a live generator
  const live = pool.filter((k) => Boolean(registry[k]));
  if (live.length === 0) {
    throw new Error(`No live generator in pool: ${pool.join(",")}`);
  }
  return rng.pick(live);
}
