// Student exam list - shows assigned + eligible exam papers for the student's grade.
import Link from "next/link";
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ExamList } from "@/components/exam/exam-list";

export const metadata = { title: "Đề thi - Toán SGK" };

export default async function StudentExamListPage() {
  const user = await verifyStudent();

  if (!user.gradeId) {
    return (
      <div className="text-center py-16 text-ink-700">
        Bạn chưa được gán lớp. Hãy nhờ phụ huynh cập nhật lớp giúp em.
      </div>
    );
  }

  const [papers, assignments, recentAttempts] = await Promise.all([
    prisma.examPaper.findMany({
      where: { gradeId: user.gradeId, isActive: true },
      orderBy: [{ examType: "asc" }],
    }),
    prisma.examAssignment.findMany({
      where: { studentId: user.id, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      include: { examPaper: true },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.examAttempt.findMany({
      where: { studentId: user.id, status: { in: ["SUBMITTED", "EXPIRED"] } },
      select: { id: true, examPaperId: true, totalScore: true, submittedAt: true },
      orderBy: { submittedAt: "desc" },
      take: 50,
    }),
  ]);

  const lastByPaper = new Map<string, { id: string; totalScore: string; submittedAt: Date | null }>();
  for (const a of recentAttempts) {
    if (!a.examPaperId) continue;
    if (!lastByPaper.has(a.examPaperId)) {
      lastByPaper.set(a.examPaperId, {
        id: a.id,
        totalScore: a.totalScore.toString(),
        submittedAt: a.submittedAt,
      });
    }
  }

  const items = papers.map((p) => ({
    id: p.id,
    key: p.key,
    nameVi: p.nameVi,
    examType: p.examType,
    durationMinutes: p.durationMinutes,
    totalQuestions: p.totalQuestions,
    isAssigned: assignments.some((a) => a.examPaperId === p.id),
    lastAttempt: lastByPaper.get(p.id) ?? null,
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display font-bold text-3xl text-ink-900">Đề thi</h1>
        <Link
          href="/student"
          className="text-brand-700 hover:underline font-display font-semibold"
        >
          ← Trang chủ
        </Link>
      </header>
      <ExamList items={items} />
    </div>
  );
}
