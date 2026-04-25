// Child detail RSC — deep view for a specific child.
// SECURITY: verifies childId belongs to the authenticated parent before loading data.
// Returns 404 (notFound()) if the child does not belong to this parent.
import { notFound } from "next/navigation";
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { loadChildDashboardData } from "@/lib/parent/load-child-dashboard-data";
import { ChildDashboardView } from "@/components/parent/child-dashboard-view";
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
    select: { id: true },
  });

  if (!child) {
    notFound();
  }

  const data = await loadChildDashboardData(childId);

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Button variant="parent-secondary" size="sm" asChild>
          <Link href="/parent">← Quay lại danh sách</Link>
        </Button>
      </div>

      <ChildDashboardView data={data} />
    </div>
  );
}
