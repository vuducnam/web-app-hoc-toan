"use server";
// Submit an exam attempt - score answers, persist summary, return result.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyStudent } from "@/lib/dal";
import { computeWeakTopics } from "@/lib/exam/compute-weak-topics";
import { groupByDifficulty, scoreAttempt } from "@/lib/exam/score-attempt";
import type { ExamSummary, ExamAnswerInput } from "@/lib/exam/types";
import type { ExamSubmitResult } from "./exam-types";
import { isExpired, loadAttemptForStudent, secondsSince } from "./exam-helpers";

const submitSchema = z.object({
  attemptId: z.string().min(1),
});

export async function submitExamAttempt(input: {
  attemptId: string;
}): Promise<ExamSubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) throw new Error("Dữ liệu không hợp lệ");

  const student = await verifyStudent();
  const attempt = await loadAttemptForStudent(parsed.data.attemptId, student.id, {
    includeAnswers: true,
    includePaper: true,
  });
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Đề đã được nộp trước đó");
  }

  const expired = isExpired(attempt.startedAt, attempt.examPaper.durationMinutes);

  // Score
  const answersInput: ExamAnswerInput[] = attempt.answers.map((a) => ({
    slotNo: a.slotNo,
    skillKey: a.skillKey,
    difficulty: a.difficulty as ExamAnswerInput["difficulty"],
    questionType: a.questionType as ExamAnswerInput["questionType"],
    questionText: a.questionText,
    expectedAnswer: a.expectedAnswer,
    studentAnswer: a.studentAnswer,
    pointWeight: Number(a.pointWeight.toString()),
    choices: a.choices,
  }));
  const result = scoreAttempt({ answers: answersInput });

  // Topic lookup for weak-topic detection
  const skillKeys = Array.from(new Set(answersInput.map((a) => a.skillKey ?? "").filter(Boolean)));
  const skills = await prisma.skill.findMany({
    where: { generatorKey: { in: skillKeys } },
    include: { lesson: { include: { topic: true } } },
  });
  const topicLookup: Record<string, { topicId: string; topicName?: string }> = {};
  for (const s of skills) {
    if (s.generatorKey) {
      topicLookup[s.generatorKey] = {
        topicId: s.lesson.topic.id,
        topicName: s.lesson.topic.nameVi,
      };
    }
  }
  const weakTopics = computeWeakTopics({
    scoredAnswers: result.answers,
    topicLookup,
  });
  const summary: ExamSummary = {
    byDifficulty: groupByDifficulty(result.answers),
    weakTopics,
  };

  await prisma.$transaction(async (tx) => {
    await tx.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: expired ? "EXPIRED" : "SUBMITTED",
        submittedAt: new Date(),
        timeSpentSec: secondsSince(attempt.startedAt),
        totalScore: result.totalScore,
        correctCount: result.correctCount,
        summaryJson: summary as unknown as object,
      },
    });
    for (const a of result.answers) {
      await tx.examAnswer.update({
        where: { attemptId_slotNo: { attemptId: attempt.id, slotNo: a.slotNo } },
        data: { isCorrect: a.isCorrect, pointEarned: a.pointEarned },
      });
    }
    if (attempt.assignmentId) {
      await tx.examAssignment.update({
        where: { id: attempt.assignmentId },
        data: { status: expired ? "EXPIRED" : "SUBMITTED" },
      });
    }
  });

  return {
    attemptId: attempt.id,
    status: expired ? "EXPIRED" : "SUBMITTED",
    totalScore: result.totalScore,
    correctCount: result.correctCount,
    totalCount: result.totalCount,
    expired,
    summary,
    answers: result.answers,
  };
}
