// Score an exam attempt - pure function over already-loaded answers.
import "server-only";
import { compareAnswer } from "./compare-answer";
import type {
  DifficultyLevel,
  ExamAnswerInput,
  ExamSummary,
  ScoreResult,
  ScoredAnswer,
} from "./types";
import type { MCChoice } from "./distractors/types";

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface ScoreAttemptInput {
  answers: ExamAnswerInput[];
}

export function scoreAttempt(input: ScoreAttemptInput): ScoreResult {
  let totalScore = 0;
  let correctCount = 0;
  const scored: ScoredAnswer[] = input.answers.map((a) => {
    const choices = (a.choices as MCChoice[] | null | undefined) ?? null;
    const isCorrect = compareAnswer(
      a.studentAnswer,
      a.expectedAnswer,
      a.questionType,
      choices,
    );
    const pointEarned = isCorrect ? Number(a.pointWeight) : 0;
    if (isCorrect) correctCount++;
    totalScore += pointEarned;
    return { ...a, isCorrect, pointEarned };
  });
  return {
    totalScore: roundTo2(totalScore),
    correctCount,
    totalCount: input.answers.length,
    answers: scored,
  };
}

/** Group scored answers by M1-M4 difficulty for summary chart. */
export function groupByDifficulty(
  scored: ScoredAnswer[],
): ExamSummary["byDifficulty"] {
  const init: ExamSummary["byDifficulty"] = {
    M1: { correct: 0, total: 0 },
    M2: { correct: 0, total: 0 },
    M3: { correct: 0, total: 0 },
    M4: { correct: 0, total: 0 },
  };
  for (const a of scored) {
    const d = (a.difficulty ?? "M1") as DifficultyLevel;
    if (!init[d]) continue;
    init[d].total++;
    if (a.isCorrect) init[d].correct++;
  }
  return init;
}
