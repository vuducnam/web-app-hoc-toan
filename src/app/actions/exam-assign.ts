"use server";
// Parent assigns an exam paper to one of their children.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyParent } from "@/lib/dal";
import {
  ExamConflictError,
  ExamUnauthorizedError,
} from "./exam-types";

const assignSchema = z.object({
  studentId: z.string().min(1),
  examPaperId: z.string().min(1),
  dueAt: z.string().datetime().optional().nullable(),
});

export async function assignExam(input: {
  studentId: string;
  examPaperId: string;
  dueAt?: string | null;
}): Promise<{ assignmentId: string }> {
  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) throw new Error("Dữ liệu không hợp lệ");

  const parent = await verifyParent();
  const { studentId, examPaperId, dueAt } = parsed.data;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, parentId: true, gradeId: true },
  });
  if (!student || student.parentId !== parent.id) {
    throw new ExamUnauthorizedError("Bạn không có quyền giao đề cho học sinh này");
  }

  const examPaper = await prisma.examPaper.findUnique({
    where: { id: examPaperId },
    select: { id: true, gradeId: true, isActive: true },
  });
  if (!examPaper || !examPaper.isActive) {
    throw new Error("Đề thi không tồn tại hoặc đã ngừng hoạt động");
  }
  if (examPaper.gradeId !== student.gradeId) {
    throw new Error("Đề thi không phù hợp với lớp của học sinh");
  }

  const existing = await prisma.examAssignment.findFirst({
    where: {
      studentId,
      examPaperId,
      status: { in: ["ASSIGNED", "IN_PROGRESS"] },
    },
  });
  if (existing) throw new ExamConflictError();

  const assignment = await prisma.examAssignment.create({
    data: {
      studentId,
      assignedById: parent.id,
      examPaperId,
      dueAt: dueAt ? new Date(dueAt) : null,
    },
  });

  revalidatePath(`/parent/child/${studentId}/exam`);
  return { assignmentId: assignment.id };
}
