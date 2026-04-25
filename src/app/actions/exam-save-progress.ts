"use server";
// Save in-progress answer for one slot - debounced from client.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyStudent } from "@/lib/dal";
import { ExamExpiredError } from "./exam-types";
import { isExpired, loadAttemptForStudent } from "./exam-helpers";

const saveSchema = z.object({
  attemptId: z.string().min(1),
  slotNo: z.number().int().min(1),
  // Empty string allowed (clearing). Length cap to prevent abuse.
  answer: z.string().max(500),
});

export async function saveExamProgress(input: {
  attemptId: string;
  slotNo: number;
  answer: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "Dữ liệu không hợp lệ" };

  const student = await verifyStudent();
  const attempt = await loadAttemptForStudent(parsed.data.attemptId, student.id, {
    includePaper: true,
  });

  if (attempt.status !== "IN_PROGRESS") {
    // Late save - ignore silently
    return { ok: false, reason: "Đề đã nộp" };
  }
  if (isExpired(attempt.startedAt, attempt.examPaper.durationMinutes)) {
    // Mark expired; client should redirect to result page after submit
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: { status: "EXPIRED" },
    });
    throw new ExamExpiredError();
  }

  await prisma.examAnswer.update({
    where: {
      attemptId_slotNo: {
        attemptId: parsed.data.attemptId,
        slotNo: parsed.data.slotNo,
      },
    },
    data: { studentAnswer: parsed.data.answer.trim() === "" ? null : parsed.data.answer },
  });
  return { ok: true };
}
