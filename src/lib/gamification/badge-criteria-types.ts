// Discriminated union of badge criteria shapes.
// Must match EXACTLY what prisma/seed-data/badges.ts uses — do not change
// type discriminants without updating the seed file too.

/**
 * Correct-answer volume milestone.
 * e.g. { type: "correct_count", value: 5 } → award when totalCorrect >= 5
 */
export type CorrectCountCriteria = {
  type: "correct_count";
  value: number;
};

/**
 * Consecutive days active (streak).
 * e.g. { type: "streak_days", value: 7 }
 */
export type StreakDaysCriteria = {
  type: "streak_days";
  value: number;
};

/**
 * Fast correct answers — correct AND elapsed < thresholdMs.
 * e.g. { type: "fast_correct_count", value: 5, thresholdMs: 20000 }
 */
export type FastCorrectCountCriteria = {
  type: "fast_correct_count";
  value: number;
  thresholdMs: number;
};

/**
 * Distinct skill types attempted.
 * e.g. { type: "distinct_skills_attempted", value: 5 }
 */
export type DistinctSkillsCriteria = {
  type: "distinct_skills_attempted";
  value: number;
};

/**
 * Rolling accuracy over last N attempts.
 * e.g. { type: "accuracy_streak", minAccuracy: 0.9, windowSize: 10 }
 */
export type AccuracyStreakCriteria = {
  type: "accuracy_streak";
  minAccuracy: number;
  windowSize: number;
};

/**
 * Perfect 100% accuracy window repeated N times.
 * e.g. { type: "perfect_window_count", windowSize: 10, requiredCount: 3 }
 */
export type PerfectWindowCountCriteria = {
  type: "perfect_window_count";
  windowSize: number;
  requiredCount: number;
};

/**
 * Sustained daily-goal completion streak.
 * e.g. { type: "daily_goal_streak", value: 5 }
 */
export type DailyGoalStreakCriteria = {
  type: "daily_goal_streak";
  value: number;
};

/**
 * Topic mastery milestone — N topics fully mastered.
 * e.g. { type: "topic_mastered", value: 1 }
 */
export type TopicMasteredCriteria = {
  type: "topic_mastered";
  value: number;
};

/** Full discriminated union — exhaustive over all seeded badge types */
export type BadgeCriteria =
  | CorrectCountCriteria
  | StreakDaysCriteria
  | FastCorrectCountCriteria
  | DistinctSkillsCriteria
  | AccuracyStreakCriteria
  | PerfectWindowCountCriteria
  | DailyGoalStreakCriteria
  | TopicMasteredCriteria;
