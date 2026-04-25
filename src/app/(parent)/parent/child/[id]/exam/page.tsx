// Parent: list of child's exam attempts + active assignments + button to assign new.
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ChildExamList } from "@/components/parent/exam/child-exam-list";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ParentChildExamListPage({ params }: Props) {
  const { id: childId } = await params;
  const parent = await verifyParent();

  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: parent.id },
    select: { id: true, name: true, gradeId: true },
  });
  if (!child) notFound();

  const [attempts, assignments] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { studentId: childId },
      include: { examPaper: true },
      orderBy: [{ submittedAt: "desc" }, { startedAt: "desc" }],
      take: 50,
    }),
    prisma.examAssignment.findMany({
      where: { studentId: childId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      include: { examPaper: true },
      orderBy: { assignedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link
            href={`/parent/child/${childId}`}
            className="text-brand-700 hover:underline font-display font-semibold"
          >
            ← {child.name}
          </Link>
          <h1 className="font-display font-bold text-3xl text-ink-900 mt-2">Đề thi</h1>
        </div>
        <Link
          href={`/parent/child/${childId}/exam/assign`}
          className="px-5 py-3 rounded-xl bg-brand-700 text-white font-display font-semibold hover:bg-brand-800 transition"
        >
          Giao đề mới
        </Link>
      </header>

      <ChildExamList
        childId={childId}
        attempts={attempts.map((a) => ({
          id: a.id,
          examPaperKey: a.examPaper.key,
          examPaperName: a.examPaper.nameVi,
          status: a.status,
          totalScore: Number(a.totalScore.toString()),
          totalPoints: Number(a.examPaper.totalPoints.toString()),
          correctCount: a.correctCount,
          totalCount: a.totalCount,
          startedAt: a.startedAt.toISOString(),
          submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
        }))}
        assignments={assignments.map((a) => ({
          id: a.id,
          examPaperName: a.examPaper.nameVi,
          status: a.status,
          assignedAt: a.assignedAt.toISOString(),
          dueAt: a.dueAt ? a.dueAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
