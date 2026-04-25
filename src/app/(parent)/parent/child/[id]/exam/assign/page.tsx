// Parent: form to assign an exam paper to a child.
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ExamAssignForm } from "@/components/parent/exam/exam-assign-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssignExamPage({ params }: Props) {
  const { id: childId } = await params;
  const parent = await verifyParent();

  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: parent.id },
    select: { id: true, name: true, gradeId: true },
  });
  if (!child || !child.gradeId) notFound();

  const [papers, activeAssignments] = await Promise.all([
    prisma.examPaper.findMany({
      where: { gradeId: child.gradeId, isActive: true },
      orderBy: [{ examType: "asc" }],
    }),
    prisma.examAssignment.findMany({
      where: { studentId: childId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      select: { examPaperId: true },
    }),
  ]);
  const activeIds = new Set(activeAssignments.map((a) => a.examPaperId));

  return (
    <div className="max-w-xl space-y-6">
      <Link
        href={`/parent/child/${childId}/exam`}
        className="text-brand-700 hover:underline font-display font-semibold"
      >
        ← Đề thi
      </Link>
      <h1 className="font-display font-bold text-2xl text-ink-900">
        Giao đề cho {child.name}
      </h1>
      <ExamAssignForm
        childId={childId}
        papers={papers.map((p) => ({
          id: p.id,
          nameVi: p.nameVi,
          examType: p.examType,
          totalQuestions: p.totalQuestions,
          durationMinutes: p.durationMinutes,
          alreadyAssigned: activeIds.has(p.id),
        }))}
      />
    </div>
  );
}
