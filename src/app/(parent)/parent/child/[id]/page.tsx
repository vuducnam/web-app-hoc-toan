// Child detail RSC — deep view for a specific child.
// SECURITY: verifies childId belongs to the authenticated parent before loading data.
// Returns 404 (notFound()) if the child does not belong to this parent.
import { notFound } from "next/navigation";
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { loadChildDashboardData } from "@/lib/parent/load-child-dashboard-data";
import { loadChildSkillDifficulties } from "@/lib/parent/load-child-skill-difficulties";
import { ChildDashboardView } from "@/components/parent/child-dashboard-view";
import { SkillDifficultyList } from "@/components/parent/skill-difficulty-list";
import { GradeSection } from "@/components/parent/grade-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params: _params }: PageProps) {
  await _params;
  return { title: `Chi tiết học sinh — Toán SGK` };
}

export default async function ChildDetailPage({ params }: PageProps) {
  const { id: childId } = await params;
  const user = await verifyParent();

  // Cross-child guard: child MUST belong to this parent
  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: user.id },
    select: { id: true, name: true, gradeId: true, grade: { select: { id: true, key: true, name: true } } },
  });

  if (!child) {
    notFound();
  }

  const [data, skillDifficulties, grades] = await Promise.all([
    loadChildDashboardData(childId),
    loadChildSkillDifficulties(childId),
    prisma.grade.findMany({
      select: { id: true, key: true, name: true },
      orderBy: { key: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Button variant="parent-secondary" size="sm" asChild>
          <Link href="/parent">← Quay lại danh sách</Link>
        </Button>
      </div>

      <ChildDashboardView data={data} />

      {/* Grade selection — parent can change which grade the student is studying */}
      <GradeSection
        childId={childId}
        childName={child.name}
        currentGradeId={child.gradeId}
        currentGradeName={child.grade?.name ?? null}
        grades={grades}
      />

      {/* Difficulty preferences — parent only, applied at next-question time */}
      <div className="rounded-lg border border-ink-400/20 bg-white shadow-flat p-5">
        <h2 className="text-sm font-semibold text-ink-600 uppercase tracking-wider mb-3">
          Độ khó cho từng kỹ năng
        </h2>
        <SkillDifficultyList childId={childId} rows={skillDifficulties} />
      </div>
    </div>
  );
}
