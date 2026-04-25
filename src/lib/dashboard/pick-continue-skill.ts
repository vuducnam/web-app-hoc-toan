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
 * Filtered by gradeId so a Grade-4 student never gets suggested a Grade-5 skill.
 * Returns null only if no generator-backed skills exist in the user's grade.
 */
export async function pickContinueSkill(
  userId: string,
  gradeId: string | null,
): Promise<ContinueSkill | null> {
  const gradeFilter = gradeId
    ? { lesson: { topic: { volume: { gradeId } } } }
    : {};

  // 1. Most recently practised, not yet MASTERED, with a generator key, in user's grade
  const recent = await prisma.skillProgress.findFirst({
    where: {
      userId,
      masteryLevel: { not: "MASTERED" },
      skill: {
        generatorKey: { not: null },
        ...gradeFilter,
      },
    },
    orderBy: { lastPracticedAt: "desc" },
    include: { skill: true },
  });

  if (recent) {
    return { key: recent.skillKey, nameVi: recent.skill.nameVi };
  }

  // 2. Fallback: first generator-backed skill in user's grade
  const first = await prisma.skill.findFirst({
    where: {
      generatorKey: { not: null },
      ...gradeFilter,
    },
    orderBy: [
      { lesson: { topic: { order: "asc" } } },
      { lesson: { order: "asc" } },
      { id: "asc" },
    ],
  });

  return first ? { key: first.key, nameVi: first.nameVi } : null;
}
