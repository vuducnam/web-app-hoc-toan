// Exam server-action helpers: sanitize, ownership, expiry.
import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  ExamQuestionDTO,
  GeneratedQuestion,
} from "@/lib/exam/types";
import type { MCChoice } from "@/lib/exam/distractors/types";
import { GENERATORS, LIVE_GENERATOR_KEYS } from "@/lib/generators/registry";
import type { Generator } from "@/lib/generators/types";

const EXPIRY_BUFFER_SEC = 5;

/** Strip server-only fields (expectedAnswer, correctIndex) before sending to client. */
export function sanitizeQuestions(
  questions: GeneratedQuestion[],
  studentAnswers?: Record<number, string | null>,
): ExamQuestionDTO[] {
  return questions.map((q) => ({
    slotNo: q.slotNo,
    skillKey: q.skillKey,
    difficulty: q.difficulty,
    questionType: q.questionType,
    questionText: q.questionText,
    choices: q.choices,
    pointWeight: q.pointWeight,
    studentAnswer: studentAnswers?.[q.slotNo] ?? null,
  }));
}

/**
 * Convert persisted ExamAnswer rows back into ExamQuestionDTO list (for resume).
 */
export function answersToQuestionDTOs(
  rows: Array<{
    slotNo: number;
    skillKey: string;
    difficulty: string;
    questionType: string;
    questionText: string;
    choices: unknown;
    pointWeight: { toString(): string };
    studentAnswer: string | null;
  }>,
): ExamQuestionDTO[] {
  return rows
    .slice()
    .sort((a, b) => a.slotNo - b.slotNo)
    .map((r) => ({
      slotNo: r.slotNo,
      skillKey: r.skillKey,
      difficulty: r.difficulty as ExamQuestionDTO["difficulty"],
      questionType: r.questionType as ExamQuestionDTO["questionType"],
      questionText: r.questionText,
      choices: (r.choices as MCChoice[] | null) ?? null,
      pointWeight: Number(r.pointWeight.toString()),
      studentAnswer: r.studentAnswer,
    }));
}

/** Returns true when wall-clock time after startedAt exceeds duration + buffer. */
export function isExpired(
  startedAt: Date,
  durationMinutes: number,
  bufferSec: number = EXPIRY_BUFFER_SEC,
): boolean {
  const limit = startedAt.getTime() + durationMinutes * 60_000 + bufferSec * 1000;
  return Date.now() > limit;
}

export function secondsSince(d: Date): number {
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
}

/**
 * Live registry filtered to keys with implementations.
 * Type-safe wrapper around GENERATORS.
 */
export function getLiveRegistry(): Record<string, Generator> {
  const out: Record<string, Generator> = {};
  for (const k of LIVE_GENERATOR_KEYS) {
    out[k] = GENERATORS[k];
  }
  return out;
}

/**
 * Load attempt and verify the studentId matches.
 * Throws if not found or not owner.
 */
export async function loadAttemptForStudent(
  attemptId: string,
  studentId: string,
  options: { includeAnswers?: boolean; includePaper?: boolean } = {},
) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId },
    include: {
      answers: options.includeAnswers ?? false,
      examPaper: options.includePaper ?? false,
    },
  });
  if (!attempt) {
    throw new Error("Không tìm thấy đề thi");
  }
  return attempt;
}
