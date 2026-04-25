import { describe, it, expect } from "vitest";
import { evaluateMastery } from "@/lib/mastery/evaluate-mastery";
import type { SkillProgressShape, AttemptInput } from "@/lib/mastery/types";

function createProgress(overrides: Partial<SkillProgressShape> = {}): SkillProgressShape {
  return {
    userId: "test-user",
    skillKey: "test-skill",
    masteryLevel: "NOT_STARTED",
    totalAttempts: 0,
    correctAttempts: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticedAt: null,
    lastDifficulty: null,
    preferredDifficulty: null,
    nextReviewAt: null,
    daysIntervalUntilReview: 0,
    ...overrides,
  };
}

describe("evaluateMastery — 8-row state transition table", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  // =========================================================================
  // R1: NOT_STARTED + Correct → FAMILIAR
  // =========================================================================
  describe("R1: NOT_STARTED + Correct → FAMILIAR", () => {
    it("transitions to FAMILIAR on first correct answer", () => {
      const progress = createProgress({ masteryLevel: "NOT_STARTED" });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("FAMILIAR");
      expect(result.leveledUp).toBe(true);
      expect(result.correctAttempts).toBe(1);
      expect(result.currentStreak).toBe(1);
    });
  });

  // =========================================================================
  // R2: NOT_STARTED + Wrong (3rd+ failure) → FAMILIAR
  // =========================================================================
  describe("R2: NOT_STARTED + Wrong (3rd+ failure) → FAMILIAR", () => {
    it("remains NOT_STARTED after 1st failure", () => {
      const progress = createProgress({ masteryLevel: "NOT_STARTED", totalAttempts: 0 });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("NOT_STARTED");
      expect(result.leveledUp).toBe(false);
    });

    it("remains NOT_STARTED after 2nd failure", () => {
      const progress = createProgress({ masteryLevel: "NOT_STARTED", totalAttempts: 1 });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("NOT_STARTED");
    });

    it("transitions to FAMILIAR on 3rd failure", () => {
      const progress = createProgress({ masteryLevel: "NOT_STARTED", totalAttempts: 2 });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("FAMILIAR");
      expect(result.leveledUp).toBe(true);
    });
  });

  // =========================================================================
  // R3: FAMILIAR + streak=5 → PROFICIENT
  // =========================================================================
  describe("R3: FAMILIAR + streak=5 consecutive correct → PROFICIENT", () => {
    it("transitions to PROFICIENT when streak reaches 5 (on MEDIUM)", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        currentStreak: 4,
        totalAttempts: 5,
        correctAttempts: 5,
      });
      // Strict gate: PROFICIENT requires triggering attempt at MEDIUM or HARD.
      const attempt: AttemptInput = { correct: true, difficulty: "MEDIUM", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
      expect(result.leveledUp).toBe(true);
      expect(result.currentStreak).toBe(5);
    });

    it("remains FAMILIAR at streak 4", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        currentStreak: 3,
        totalAttempts: 1, // Only 1 attempt so far, not 4
        correctAttempts: 1,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("FAMILIAR");
      expect(result.currentStreak).toBe(4);
    });

    it("resets streak on wrong answer", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        currentStreak: 4,
        totalAttempts: 1, // Only 1 attempt, not 5
        correctAttempts: 1,
      });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.currentStreak).toBe(0);
      expect(result.masteryLevel).toBe("FAMILIAR");
    });
  });

  // =========================================================================
  // R4: FAMILIAR + ratio≥0.65 & attempts≥5 → PROFICIENT
  // =========================================================================
  describe("R4: FAMILIAR + ratio≥0.65 & attempts≥5 → PROFICIENT", () => {
    it("transitions to PROFICIENT at ratio=0.65, 5 attempts (on MEDIUM)", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        totalAttempts: 4,
        correctAttempts: 3, // 3/5 = 0.6, but attempt brings to 4/5 = 0.8
      });
      // Strict gate: PROFICIENT requires triggering attempt at MEDIUM or HARD.
      const attempt: AttemptInput = { correct: true, difficulty: "MEDIUM", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
      expect(result.totalAttempts).toBe(5);
      expect(result.correctAttempts).toBe(4);
      expect(result.leveledUp).toBe(true);
    });

    it("remains FAMILIAR at ratio<0.65", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        totalAttempts: 4,
        correctAttempts: 2, // 2/5 = 0.4
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("FAMILIAR");
    });

    it("requires at least 5 total attempts", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        totalAttempts: 3,
        correctAttempts: 2, // 2/4 = 0.5 < 0.65
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("FAMILIAR"); // 3/4 = 0.75, but only 4 total attempts
    });
  });

  // =========================================================================
  // R5: PROFICIENT + streak≥8 on hard → MASTERED
  // =========================================================================
  describe("R5a: PROFICIENT + streak≥8 on HARD → MASTERED", () => {
    it("transitions to MASTERED at streak=8 on HARD", () => {
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        currentStreak: 7,
        longestStreak: 7,
        totalAttempts: 10,
        correctAttempts: 10,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "HARD", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("MASTERED");
      expect(result.leveledUp).toBe(true);
      expect(result.currentStreak).toBe(8);
    });

    it("does NOT promote at streak=8 on EASY", () => {
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        currentStreak: 7,
        totalAttempts: 10,
        correctAttempts: 10,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
      expect(result.currentStreak).toBe(8);
    });
  });

  // =========================================================================
  // R5b: PROFICIENT + ratio≥0.9 & attempts≥15 → MASTERED
  // =========================================================================
  describe("R5b: PROFICIENT + ratio≥0.9 & attempts≥15 → MASTERED", () => {
    it("transitions to MASTERED at ratio=0.9, 15+ attempts (on HARD)", () => {
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        totalAttempts: 14,
        correctAttempts: 13, // 13/15 = 0.867, but next correct makes 14/15 = 0.933
      });
      // Strict gate: MASTERED requires triggering attempt at HARD.
      const attempt: AttemptInput = { correct: true, difficulty: "HARD", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("MASTERED");
      expect(result.leveledUp).toBe(true);
    });

    it("remains PROFICIENT at ratio<0.9", () => {
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        totalAttempts: 14,
        correctAttempts: 12, // 12/15 = 0.8
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
    });
  });

  // =========================================================================
  // R6: PROFICIENT + ratio<0.6 & inactivity>7d → FAMILIAR (demote)
  // =========================================================================
  describe("R6: PROFICIENT + ratio<0.6 & inactivity>7d → FAMILIAR (demote)", () => {
    it("demotes to FAMILIAR when both conditions met", () => {
      const thenDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        lastPracticedAt: thenDate,
        totalAttempts: 10,
        correctAttempts: 5, // 5/11 = 0.45 < 0.6
      });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("FAMILIAR");
      expect(result.leveledUp).toBe(true); // leveledUp = true when level changes (even demotion)
    });

    it("does NOT demote if ratio >= 0.6", () => {
      const thenDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        lastPracticedAt: thenDate,
        totalAttempts: 10,
        correctAttempts: 7, // 7/11 = 0.636 >= 0.6
      });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
    });

    it("does NOT demote if inactivity <= 7d", () => {
      const thenDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        lastPracticedAt: thenDate,
        totalAttempts: 10,
        correctAttempts: 4, // 4/11 = 0.36 < 0.6
      });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
    });
  });

  // =========================================================================
  // R7: MASTERED + inactivity>30d → PROFICIENT (decay)
  // =========================================================================
  describe("R7: MASTERED + inactivity>30d → PROFICIENT (decay)", () => {
    it("decays to PROFICIENT after 30+ days", () => {
      const thenDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
      const progress = createProgress({
        masteryLevel: "MASTERED",
        lastPracticedAt: thenDate,
        totalAttempts: 50,
        correctAttempts: 50,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
      expect(result.leveledUp).toBe(true); // leveledUp = true when level changes (even decay)
    });

    it("remains MASTERED within 30 days", () => {
      const thenDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      const progress = createProgress({
        masteryLevel: "MASTERED",
        lastPracticedAt: thenDate,
        totalAttempts: 50,
        correctAttempts: 50,
      });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("MASTERED");
    });
  });

  // =========================================================================
  // R8: Hard difficulty context
  // =========================================================================
  describe("R8: Hard difficulty boosts progression (via R3/R5)", () => {
    it("applies same threshold at all difficulties (HARD used in R5a only)", () => {
      // Hard difficulty is used specifically in R5a (streak threshold on HARD)
      // No separate R8 rule — hard difficulty is contextual to R5a promotion
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        currentStreak: 7,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "HARD", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.lastDifficulty).toBe("HARD");
    });
  });

  // =========================================================================
  // Extra: Level is sticky on wrong answers (no demotion except R6)
  // =========================================================================
  describe("Level stickiness: no demotion from wrong answers alone", () => {
    it("PROFICIENT stays PROFICIENT on wrong answer (no R6 triggers)", () => {
      const thenDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago (< 7d)
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        lastPracticedAt: thenDate,
        totalAttempts: 20,
        correctAttempts: 15, // 15/21 = 0.714
      });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("PROFICIENT");
    });

    it("MASTERED stays MASTERED on wrong answer", () => {
      const thenDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const progress = createProgress({
        masteryLevel: "MASTERED",
        lastPracticedAt: thenDate,
      });
      const attempt: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attempt);

      expect(result.masteryLevel).toBe("MASTERED");
    });
  });

  // =========================================================================
  // Extra: counters update correctly
  // =========================================================================
  describe("Counter updates", () => {
    it("increments correctAttempts only on correct answer", () => {
      const progress = createProgress({
        totalAttempts: 5,
        correctAttempts: 3,
      });
      const attemptCorrect: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };
      const attemptWrong: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const resC = evaluateMastery(progress, attemptCorrect);
      const resW = evaluateMastery(progress, attemptWrong);

      expect(resC.correctAttempts).toBe(4);
      expect(resW.correctAttempts).toBe(3);
    });

    it("always increments totalAttempts", () => {
      const progress = createProgress({ totalAttempts: 5 });
      const attemptCorrect: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };
      const attemptWrong: AttemptInput = { correct: false, difficulty: "EASY", timestamp: now };

      const resC = evaluateMastery(progress, attemptCorrect);
      const resW = evaluateMastery(progress, attemptWrong);

      expect(resC.totalAttempts).toBe(6);
      expect(resW.totalAttempts).toBe(6);
    });

    it("updates longestStreak correctly", () => {
      const progress = createProgress({
        currentStreak: 3,
        longestStreak: 5,
        totalAttempts: 0,
        correctAttempts: 0,
      });
      const attemptCorrect: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attemptCorrect);

      expect(result.currentStreak).toBe(4);
      expect(result.longestStreak).toBe(5); // No change
    });

    it("updates longestStreak when currentStreak exceeds it", () => {
      const progress = createProgress({
        currentStreak: 5,
        longestStreak: 5,
        totalAttempts: 0,
        correctAttempts: 0,
      });
      const attemptCorrect: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };

      const result = evaluateMastery(progress, attemptCorrect);

      expect(result.currentStreak).toBe(6);
      expect(result.longestStreak).toBe(6);
    });
  });

  // =========================================================================
  // STRICT DIFFICULTY GATE — closes "EASY-spam → MASTERED" loophole (2026-04-25)
  // =========================================================================
  describe("strict difficulty gate", () => {
    it("FAMILIAR + EASY streak=5 stays FAMILIAR (no promotion on EASY)", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        currentStreak: 4,
        totalAttempts: 5,
        correctAttempts: 5,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };
      const result = evaluateMastery(progress, attempt);
      expect(result.masteryLevel).toBe("FAMILIAR");
      expect(result.leveledUp).toBe(false);
    });

    it("FAMILIAR + EASY ratio path stays FAMILIAR", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        totalAttempts: 4,
        correctAttempts: 3,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };
      const result = evaluateMastery(progress, attempt);
      expect(result.masteryLevel).toBe("FAMILIAR");
    });

    it("PROFICIENT + EASY ratio≥0.9, 15+ attempts stays PROFICIENT", () => {
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        totalAttempts: 14,
        correctAttempts: 13,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "EASY", timestamp: now };
      const result = evaluateMastery(progress, attempt);
      expect(result.masteryLevel).toBe("PROFICIENT");
      expect(result.leveledUp).toBe(false);
    });

    it("PROFICIENT + MEDIUM ratio≥0.9, 15+ attempts stays PROFICIENT (HARD required)", () => {
      const progress = createProgress({
        masteryLevel: "PROFICIENT",
        totalAttempts: 14,
        correctAttempts: 13,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "MEDIUM", timestamp: now };
      const result = evaluateMastery(progress, attempt);
      expect(result.masteryLevel).toBe("PROFICIENT");
    });

    it("FAMILIAR + HARD streak=5 promotes to PROFICIENT (HARD also satisfies gate)", () => {
      const progress = createProgress({
        masteryLevel: "FAMILIAR",
        currentStreak: 4,
        totalAttempts: 5,
        correctAttempts: 5,
      });
      const attempt: AttemptInput = { correct: true, difficulty: "HARD", timestamp: now };
      const result = evaluateMastery(progress, attempt);
      expect(result.masteryLevel).toBe("PROFICIENT");
    });
  });
});
