// Server-only helper — picks the best skill to continue practising.
// Priority: most recently practised non-mastered generator skill → first generator skill.
import "server-only";
import { prisma } from "@/lib/prisma";

export interface ContinueSkill {
  key: string;
  nameVi: string;
}

/**
 * Returns the skill the student should continue with next.
 * Excludes pool-only skills (generatorKey null) since practice page requires a generator.
 * Returns null only if no generator-backed skills exist in the DB.
 */
export async function pickContinueSkill(userId: string): Promise<ContinueSkill | null> {
  // 1. Most recently practised, not yet MASTERED, with a generator key
  const recent = await prisma.skillProgress.findFirst({
    where: {
      userId,
      masteryLevel: { not: "MASTERED" },
      skill: { generatorKey: { not: null } },
    },
    orderBy: { lastPracticedAt: "desc" },
    include: { skill: true },
  });

  if (recent) {
    return { key: recent.skillKey, nameVi: recent.skill.nameVi };
  }

  // 2. Fallback: first generator-backed skill ordered by topic → lesson → skill
  const first = await prisma.skill.findFirst({
    where: { generatorKey: { not: null } },
    orderBy: [
      { lesson: { topic: { order: "asc" } } },
      { lesson: { order: "asc" } },
      { id: "asc" },
    ],
  });

  return first ? { key: first.key, nameVi: first.nameVi } : null;
}
