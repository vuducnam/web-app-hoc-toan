"use server";
// Thin proxy exposing only the two async server actions for client components.
// Client components import from HERE to avoid importing practice.ts which
// re-exports non-async bindings that Turbopack rejects in "use server" files.
import { verifyStudent } from "@/lib/dal";
import { getGenerator } from "@/lib/generators/registry";
import type { Difficulty as GenDifficulty } from "@/lib/generators/types";
import { nextDifficulty } from "@/lib/mastery/next-difficulty";
import { stripAnswer, type SafeQuestion } from "@/lib/mastery/strip-answer";
import { prisma } from "@/lib/prisma";
import { loadProgress } from "./practice-helpers";
import { submitAnswerCore } from "./practice-submit-core";
import type { QuestionError, SubmitAnswerInput, SubmitAnswerResult } from "./practice-types";

/** Next question — duplicated from practice.ts to avoid circular proxy chain. */
export async function getNextQuestion(
  skillKey: string,
  difficultyOverride?: GenDifficulty | null,
): Promise<(SafeQuestion & { seed: string; difficulty: GenDifficulty }) | QuestionError> {
  const user = await verifyStudent();
  const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
  if (!skill) return { error: "not-found" };
  if (!skill.generatorKey) {
    return { error: "stub", message: "Bài đang được chuẩn bị" };
  }
  const progress = await loadProgress(user.id, skillKey);
  const masteryDifficulty = nextDifficulty(progress.masteryLevel);
  const difficulty: GenDifficulty =
    difficultyOverride === 1 || difficultyOverride === 2 || difficultyOverride === 3
      ? difficultyOverride
      : masteryDifficulty;
  const seed = crypto.randomUUID();
  try {
    const generator = getGenerator(skill.generatorKey);
    const q = generator.generate({ seed, difficulty, skillKey });
    const safe = stripAnswer(q);
    return { ...safe, seed, difficulty };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("NotImplemented")) {
      return { error: "stub", message: "Bài đang được chuẩn bị" };
    }
    return { error: "stub", message: "Bài đang được chuẩn bị" };
  }
}

/** Submit answer — verifies session, delegates to submitAnswerCore. */
export async function submitAnswer(
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult | QuestionError> {
  const user = await verifyStudent();
  return submitAnswerCore(user.id, input);
}
