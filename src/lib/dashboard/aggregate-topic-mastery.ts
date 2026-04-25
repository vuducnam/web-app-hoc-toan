// Pure helper — no Prisma import.
// Aggregates skill mastery counts for a topic given a map of user progress.
import type { MasteryBar4Counts } from "@/components/ui/mastery-bar-4";

/** Minimal skill shape needed for aggregation */
export interface SkillForAggregation {
  key: string;
}

/** Map of skillKey → mastery level string from DB enum */
export type ProgressMap = Map<string, string>;

/**
 * Returns 4-bucket mastery counts for a set of skills.
 * Looks up each skill's progress in progressMap; defaults to NOT_STARTED if absent.
 */
export function aggregateTopicMastery(
  skills: SkillForAggregation[],
  progressMap: ProgressMap
): MasteryBar4Counts {
  const counts: MasteryBar4Counts = {
    notStarted: 0,
    familiar: 0,
    proficient: 0,
    mastered: 0,
  };

  for (const skill of skills) {
    const level = progressMap.get(skill.key) ?? "NOT_STARTED";
    switch (level) {
      case "FAMILIAR":
        counts.familiar++;
        break;
      case "PROFICIENT":
        counts.proficient++;
        break;
      case "MASTERED":
        counts.mastered++;
        break;
      default:
        counts.notStarted++;
    }
  }

  return counts;
}
