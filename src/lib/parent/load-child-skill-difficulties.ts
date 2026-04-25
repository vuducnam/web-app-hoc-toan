import "server-only";
// Loads all skills the child has touched OR ALL skills if none — with current preferredDifficulty.
// Used by parent's child-detail page to render the difficulty preference list.
// Returns rows grouped by topic for cleaner UI.

import { prisma } from "@/lib/prisma";
import type { Difficulty as PrismaDifficulty } from "@/generated/prisma/client";

export interface SkillDifficultyRow {
  skillKey: string;
  skillNameVi: string;
  topicNameVi: string;
  /** null = no override (mastery-derived default applies). */
  preferredDifficulty: PrismaDifficulty | null;
  /** True if generator-backed (vs poolKey). PoolKey skills are not yet practicable. */
  hasGenerator: boolean;
}

export async function loadChildSkillDifficulties(
  childId: string,
): Promise<SkillDifficultyRow[]> {
  // Pull every skill in the curriculum (60 in MVP) plus this child's existing
  // SkillProgress rows for the override field. Outer-join via separate queries
  // keeps Prisma typing simple.
  const [skills, progress] = await Promise.all([
    prisma.skill.findMany({
      include: { lesson: { include: { topic: true } } },
      orderBy: { key: "asc" },
    }),
    prisma.skillProgress.findMany({
      where: { userId: childId },
      select: { skillKey: true, preferredDifficulty: true },
    }),
  ]);

  const overrides = new Map<string, PrismaDifficulty | null>();
  for (const p of progress) overrides.set(p.skillKey, p.preferredDifficulty);

  return skills.map((s) => ({
    skillKey: s.key,
    skillNameVi: s.nameVi,
    topicNameVi: s.lesson.topic.nameVi,
    preferredDifficulty: overrides.get(s.key) ?? null,
    hasGenerator: s.generatorKey != null,
  }));
}
