"use server";
// Start a new exam attempt - generates seeded questions, persists rows, returns sanitized payload.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { verifyStudent } from "@/lib/dal";
import { generateAttempt } from "@/lib/exam/generate-attempt";
import { makeSeed } from "@/lib/exam/make-seed";
import type { ExamSlot } from "@/lib/exam/types";
import { type StartExamResult } from "./exam-types";
import {
  answersToQuestionDTOs,
  getLiveRegistry,
  sanitizeQuestions,
} from "./exam-helpers";

const startSchema = z.object({
  examPaperId: z.string().min(1),
});

export async function startExamAttempt(input: {
  examPaperId: string;
}): Promise<StartExamResult> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) throw new Error("Dữ liệu không hợp lệ");

  const student = await verifyStudent();
  const studentId = student.id;
  const { examPaperId } = parsed.data;

  // 1. Resume an existing IN_PROGRESS attempt if present (idempotent retry).
  const existing = await prisma.examAttempt.findFirst({
    where: { studentId, examPaperId, status: "IN_PROGRESS" },
    include: { examPaper: true, answers: true },
    orderBy: { startedAt: "desc" },
  });
  if (existing) {
    return {
      attemptId: existing.id,
      examPaperKey: existing.examPaper.key,
      examPaperName: existing.examPaper.nameVi,
      durationMinutes: existing.examPaper.durationMinutes,
      startedAt: existing.startedAt.toISOString(),
      totalQuestions: existing.totalCount,
      questions: answersToQuestionDTOs(existing.answers),
    };
  }

  // 2. Look up last finished attempt (for attemptNumber increment) + active assignment.
  const lastSubmitted = await prisma.examAttempt.findFirst({
    where: { studentId, examPaperId, status: { in: ["SUBMITTED", "EXPIRED"] } },
    orderBy: { submittedAt: "desc" },
  });
  const activeAssignment = await prisma.examAssignment.findFirst({
    where: {
      studentId,
      examPaperId,
      status: { in: ["ASSIGNED", "IN_PROGRESS"] },
    },
    orderBy: { assignedAt: "desc" },
  });

  // 3. Load paper and generate questions.
  const examPaper = await prisma.examPaper.findUniqueOrThrow({
    where: { id: examPaperId },
  });
  if (!examPaper.isActive) throw new Error("Đề thi đã ngừng hoạt động");

  const attemptNumber = (lastSubmitted?.attemptNumber ?? 0) + 1;
  const seed = makeSeed(studentId, examPaperId, attemptNumber);
  const structure = examPaper.structure as unknown as ExamSlot[];
  const registry = getLiveRegistry();
  const questions = generateAttempt({
    examPaperId,
    structure,
    seed,
    registry,
  });

  // 4. Persist atomically.
  const attempt = await prisma.$transaction(async (tx) => {
    const a = await tx.examAttempt.create({
      data: {
        studentId,
        examPaperId,
        assignmentId: activeAssignment?.id,
        attemptNumber,
        seed,
        totalCount: questions.length,
      },
    });
    await tx.examAnswer.createMany({
      data: questions.map((q) => ({
        attemptId: a.id,
        slotNo: q.slotNo,
        skillKey: q.skillKey,
        difficulty: q.difficulty,
        questionType: q.questionType,
        questionText: q.questionText,
        expectedAnswer: q.expectedAnswer,
        choices: q.choices == null
          ? Prisma.JsonNull
          : (q.choices as unknown as Prisma.InputJsonValue),
        pointWeight: q.pointWeight,
      })),
    });
    if (activeAssignment) {
      await tx.examAssignment.update({
        where: { id: activeAssignment.id },
        data: { status: "IN_PROGRESS" },
      });
    }
    return a;
  });

  return {
    attemptId: attempt.id,
    examPaperKey: examPaper.key,
    examPaperName: examPaper.nameVi,
    durationMinutes: examPaper.durationMinutes,
    startedAt: attempt.startedAt.toISOString(),
    totalQuestions: questions.length,
    questions: sanitizeQuestions(questions),
  };
}
