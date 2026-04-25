"use server";
// Parent server action — set/clear preferredDifficulty on a child's SkillProgress.
// SECURITY: verifies caller is PARENT and that child belongs to them before write.
// difficulty=null clears the override (returns to mastery-derived default).
import { revalidatePath } from "next/cache";
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { Difficulty as PrismaDifficulty } from "@/generated/prisma/client";

export interface SetPreferredDifficultyInput {
  childId: string;
  skillKey: string;
  /** null clears the override; otherwise EASY|MEDIUM|HARD. */
  difficulty: PrismaDifficulty | null;
}

export type SetPreferredDifficultyResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not-found" | "invalid-difficulty" };

const VALID_DIFFICULTIES = new Set<string>(["EASY", "MEDIUM", "HARD"]);

export async function setPreferredDifficulty(
  input: SetPreferredDifficultyInput,
): Promise<SetPreferredDifficultyResult> {
  const parent = await verifyParent();
  const { childId, skillKey, difficulty } = input;

  // 1. Validate difficulty value (or null = clear)
  if (difficulty !== null && !VALID_DIFFICULTIES.has(difficulty)) {
    return { ok: false, error: "invalid-difficulty" };
  }

  // 2. Verify child belongs to this parent
  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: parent.id },
    select: { id: true },
  });
  if (!child) return { ok: false, error: "unauthorized" };

  // 3. Verify skill exists
  const skill = await prisma.skill.findUnique({
    where: { key: skillKey },
    select: { key: true },
  });
  if (!skill) return { ok: false, error: "not-found" };

  // 4. Upsert SkillProgress with new preferredDifficulty.
  // create: minimal NOT_STARTED row with override only.
  // update: only the override field (don't touch attempts/streak/etc).
  await prisma.skillProgress.upsert({
    where: { userId_skillKey: { userId: childId, skillKey } },
    create: {
      userId: childId,
      skillKey,
      masteryLevel: "NOT_STARTED",
      preferredDifficulty: difficulty,
    },
    update: { preferredDifficulty: difficulty },
  });

  // Revalidate parent's child detail so updated chip state is reflected on next nav.
  revalidatePath(`/parent/child/${childId}`);
  return { ok: true };
}
