"use server";
// Public server actions for the practice flow.
// getNextQuestion — picks difficulty, generates question, strips expectedAnswer.
// submitAnswer    — verifies session, delegates to submitAnswerCore.
//
// File ownership: Phase 05. Phase 11 adds XP/badge hooks inside submitAnswerCore.
import { verifyStudent } from "@/lib/dal";
import { getGenerator } from "@/lib/generators/registry";
import type { Difficulty as GenDifficulty } from "@/lib/generators/types";
import { nextDifficulty } from "@/lib/mastery/next-difficulty";
import { stripAnswer, type SafeQuestion } from "@/lib/mastery/strip-answer";
import { prisma } from "@/lib/prisma";
import { loadProgress } from "./practice-helpers";
import type {
  QuestionError,
  SubmitAnswerInput,
  SubmitAnswerResult,
} from "./practice-types";

// Re-export core for Phase 12 tests — wrapped as async to satisfy Turbopack's
// "use server" rule (only async functions may be exported from server action files).
export async function submitAnswerCore(
  userId: string,
  input: import("./practice-types").SubmitAnswerInput,
) {
  const { submitAnswerCore: _core } = await import("./practice-submit-core");
  return _core(userId, input);
}
export type {
  SubmitAnswerInput,
  SubmitAnswerResult,
  QuestionError,
  EncouragementKey,
} from "./practice-types";

// ---------------------------------------------------------------------------
// getNextQuestion
// ---------------------------------------------------------------------------

/**
 * Generate the next question for a skill.
 * Strips expectedAnswer before returning — the ONLY path a Question leaves the server.
 * Returns seed + difficulty so the client can echo them back on submitAnswer.
 */
export async function getNextQuestion(
  skillKey: string,
): Promise<(SafeQuestion & { seed: string; difficulty: GenDifficulty }) | QuestionError> {
  // 1. Verify STUDENT session
  const user = await verifyStudent();

  // 2. Skill must exist in DB
  const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
  if (!skill) return { error: "not-found" };

  // poolKey skills have no procedural generator — surface placeholder.
  if (!skill.generatorKey) {
    return { error: "stub", message: "Bài đang được chuẩn bị" };
  }

  // 3. Derive difficulty from current mastery level
  const progress = await loadProgress(user.id, skillKey);
  const difficulty = nextDifficulty(progress.masteryLevel);

  // 4. Generate seed + question; catch stub / not-implemented errors gracefully
  const seed = crypto.randomUUID();

  try {
    const generator = getGenerator(skill.generatorKey);
    const q = generator.generate({ seed, difficulty, skillKey });

    // 5. Strip expectedAnswer — mandatory before any return
    const safe = stripAnswer(q);
    return { ...safe, seed, difficulty };
  } catch (err) {
    // Stub generators throw "NotImplemented: <key>" — surface as stub error
    if (err instanceof Error && err.message.startsWith("NotImplemented")) {
      return { error: "stub", message: "Bài đang được chuẩn bị" };
    }
    return { error: "stub", message: "Bài đang được chuẩn bị" };
  }
}

// ---------------------------------------------------------------------------
// submitAnswer
// ---------------------------------------------------------------------------

/**
 * Public server action — verifies STUDENT session, then delegates to submitAnswerCore.
 * Never returns expectedAnswer in any code path.
 */
export async function submitAnswer(
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult | QuestionError> {
  const user = await verifyStudent();
  return submitAnswerCore(user.id, input);
}
