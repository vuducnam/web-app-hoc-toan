import { describe, it, expect } from "vitest";
import { evaluateBadges } from "@/lib/gamification/evaluate-badges";
import type { UserAggregates, BadgeRecord } from "@/lib/gamification/evaluate-badges";

function createAggregates(overrides: Partial<UserAggregates> = {}): UserAggregates {
  return {
    totalCorrect: 0,
    consecutiveDays: 0,
    ownedBadgeKeys: new Set(),
    distinctSkills: 0,
    fastCorrectCount: 0,
    accuracyRatio: 0,
    totalAttempts: 0,
    rollingAccuracy: new Map(),
    perfectWindowCount: new Map(),
    dailyGoalStreak: 0,
    masteredTopicCount: 0,
    ...overrides,
  };
}

describe("evaluateBadges", () => {
  describe("correct_count criterion", () => {
    it("awards badge when totalCorrect >= value", () => {
      const agg = createAggregates({ totalCorrect: 100 });
      const badges: BadgeRecord[] = [{ key: "century", criteria: { type: "correct_count", value: 100 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("century");
    });

    it("does not award when totalCorrect < value", () => {
      const agg = createAggregates({ totalCorrect: 99 });
      const badges: BadgeRecord[] = [{ key: "century", criteria: { type: "correct_count", value: 100 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("century");
    });
  });

  describe("streak_days criterion", () => {
    it("awards badge when streak >= value", () => {
      const agg = createAggregates({ consecutiveDays: 7 });
      const badges: BadgeRecord[] = [{ key: "week-warrior", criteria: { type: "streak_days", value: 7 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("week-warrior");
    });

    it("does not award when streak < value", () => {
      const agg = createAggregates({ consecutiveDays: 6 });
      const badges: BadgeRecord[] = [{ key: "week-warrior", criteria: { type: "streak_days", value: 7 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("week-warrior");
    });
  });

  describe("fast_correct_count criterion", () => {
    it("awards badge when fast correct count >= value", () => {
      const agg = createAggregates({ fastCorrectCount: 50 });
      const badges: BadgeRecord[] = [
        { key: "speed-demon", criteria: { type: "fast_correct_count", value: 50, thresholdMs: 20000 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("speed-demon");
    });

    it("does not award when count < value", () => {
      const agg = createAggregates({ fastCorrectCount: 49 });
      const badges: BadgeRecord[] = [
        { key: "speed-demon", criteria: { type: "fast_correct_count", value: 50, thresholdMs: 20000 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("speed-demon");
    });
  });

  describe("distinct_skills_attempted criterion", () => {
    it("awards badge when distinct skills >= value", () => {
      const agg = createAggregates({ distinctSkills: 5 });
      const badges: BadgeRecord[] = [
        { key: "skill-explorer", criteria: { type: "distinct_skills_attempted", value: 5 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("skill-explorer");
    });

    it("does not award when distinct skills < value", () => {
      const agg = createAggregates({ distinctSkills: 4 });
      const badges: BadgeRecord[] = [
        { key: "skill-explorer", criteria: { type: "distinct_skills_attempted", value: 5 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("skill-explorer");
    });
  });

  describe("accuracy_streak criterion (rolling window)", () => {
    it("awards badge when rolling accuracy >= minAccuracy and totalAttempts >= windowSize", () => {
      const rollingAccuracy = new Map([[10, 0.9]]);
      const agg = createAggregates({ rollingAccuracy, totalAttempts: 10 });
      const badges: BadgeRecord[] = [
        { key: "perfect-10", criteria: { type: "accuracy_streak", windowSize: 10, minAccuracy: 0.9 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("perfect-10");
    });

    it("does not award if rolling accuracy < minAccuracy", () => {
      const rollingAccuracy = new Map([[10, 0.85]]);
      const agg = createAggregates({ rollingAccuracy, totalAttempts: 10 });
      const badges: BadgeRecord[] = [
        { key: "perfect-10", criteria: { type: "accuracy_streak", windowSize: 10, minAccuracy: 0.9 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("perfect-10");
    });

    it("does not award if totalAttempts < windowSize", () => {
      const rollingAccuracy = new Map([[10, 0.9]]);
      const agg = createAggregates({ rollingAccuracy, totalAttempts: 5 });
      const badges: BadgeRecord[] = [
        { key: "perfect-10", criteria: { type: "accuracy_streak", windowSize: 10, minAccuracy: 0.9 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("perfect-10");
    });
  });

  describe("perfect_window_count criterion", () => {
    it("awards badge when perfect window count >= requiredCount", () => {
      const perfectWindowCount = new Map([[10, 3]]);
      const agg = createAggregates({ perfectWindowCount });
      const badges: BadgeRecord[] = [
        { key: "perfect-run", criteria: { type: "perfect_window_count", windowSize: 10, requiredCount: 3 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("perfect-run");
    });

    it("does not award when count < requiredCount", () => {
      const perfectWindowCount = new Map([[10, 2]]);
      const agg = createAggregates({ perfectWindowCount });
      const badges: BadgeRecord[] = [
        { key: "perfect-run", criteria: { type: "perfect_window_count", windowSize: 10, requiredCount: 3 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("perfect-run");
    });
  });

  describe("daily_goal_streak criterion", () => {
    it("awards badge when daily goal streak >= value", () => {
      const agg = createAggregates({ dailyGoalStreak: 10 });
      const badges: BadgeRecord[] = [{ key: "goal-getter", criteria: { type: "daily_goal_streak", value: 10 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("goal-getter");
    });

    it("does not award when daily goal streak < value", () => {
      const agg = createAggregates({ dailyGoalStreak: 9 });
      const badges: BadgeRecord[] = [{ key: "goal-getter", criteria: { type: "daily_goal_streak", value: 10 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("goal-getter");
    });
  });

  describe("topic_mastered criterion", () => {
    it("awards badge when mastered topics >= value", () => {
      const agg = createAggregates({ masteredTopicCount: 3 });
      const badges: BadgeRecord[] = [{ key: "topic-master", criteria: { type: "topic_mastered", value: 3 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("topic-master");
    });

    it("does not award when mastered topics < value", () => {
      const agg = createAggregates({ masteredTopicCount: 2 });
      const badges: BadgeRecord[] = [{ key: "topic-master", criteria: { type: "topic_mastered", value: 3 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("topic-master");
    });
  });

  describe("already owned badges", () => {
    it("does not re-award already owned badges", () => {
      const agg = createAggregates({
        totalCorrect: 100,
        ownedBadgeKeys: new Set(["century"]),
      });
      const badges: BadgeRecord[] = [{ key: "century", criteria: { type: "correct_count", value: 100 } }];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("century");
    });
  });

  describe("multiple badges", () => {
    it("awards multiple badges when criteria met", () => {
      const agg = createAggregates({
        totalCorrect: 100,
        consecutiveDays: 7,
      });
      const badges: BadgeRecord[] = [
        { key: "century", criteria: { type: "correct_count", value: 100 } },
        { key: "week-warrior", criteria: { type: "streak_days", value: 7 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("century");
      expect(result).toContain("week-warrior");
      expect(result.length).toBe(2);
    });

    it("awards only qualifying badges", () => {
      const agg = createAggregates({
        totalCorrect: 100,
        consecutiveDays: 6,
      });
      const badges: BadgeRecord[] = [
        { key: "century", criteria: { type: "correct_count", value: 100 } },
        { key: "week-warrior", criteria: { type: "streak_days", value: 7 } },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).toContain("century");
      expect(result).not.toContain("week-warrior");
      expect(result.length).toBe(1);
    });
  });

  describe("unknown criteria type", () => {
    it("skips unknown criteria types gracefully", () => {
      const agg = createAggregates();
      const badges: BadgeRecord[] = [
        { key: "unknown-badge", criteria: { type: "unknown_type", value: 10 } as unknown as BadgeRecord["criteria"] },
      ];

      const result = evaluateBadges(agg, badges);
      expect(result).not.toContain("unknown-badge");
      expect(result.length).toBe(0);
    });
  });
});
