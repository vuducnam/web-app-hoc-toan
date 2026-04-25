// Pure function: derives top-3 weak skills from SkillProgress records.
// A skill qualifies as "weak" if totalAttempts >= 3.
// Sorted ascending by correctRatio (worst first), take 3.

export interface SkillProgressSummary {
  skillKey: string;
  nameVi: string;
  totalAttempts: number;
  correctAttempts: number;
  masteryLevel: string;
}

export interface WeakSkill {
  key: string;
  nameVi: string;
  /** 0..1 ratio */
  ratio: number;
  attempts: number;
}

/**
 * Filters skills with >= 3 attempts, sorts by correctRatio ascending,
 * returns top 3 weakest.
 */
export function computeWeakSkills(skills: SkillProgressSummary[]): WeakSkill[] {
  return skills
    .filter((s) => s.totalAttempts >= 3)
    .map((s) => ({
      key: s.skillKey,
      nameVi: s.nameVi,
      ratio: s.correctAttempts / Math.max(1, s.totalAttempts),
      attempts: s.totalAttempts,
    }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3);
}
