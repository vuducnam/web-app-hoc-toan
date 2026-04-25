import { describe, it, expect } from "vitest";
import { computeXpForAttempt } from "@/lib/gamification/compute-xp";

describe("computeXpForAttempt", () => {
  describe("wrong answer", () => {
    it("returns 0 XP for wrong answer regardless of other factors", () => {
      expect(computeXpForAttempt({ correct: false, elapsedMs: 5000, consecutiveCorrect: 0 })).toBe(0);
      expect(computeXpForAttempt({ correct: false, elapsedMs: 5000, consecutiveCorrect: 5 })).toBe(0);
    });
  });

  describe("correct answer base XP", () => {
    it("returns 10 XP for correct answer with no bonuses", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 40000, consecutiveCorrect: 0 });
      expect(xp).toBe(10);
    });
  });

  describe("speed bonus", () => {
    it("adds 5 XP if answered in under 30s", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 5000, consecutiveCorrect: 0 });
      expect(xp).toBe(15); // 10 + 5
    });

    it("no speed bonus at exactly 30s", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 30000, consecutiveCorrect: 0 });
      expect(xp).toBe(10);
    });

    it("no speed bonus if > 30s", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 35000, consecutiveCorrect: 0 });
      expect(xp).toBe(10);
    });
  });

  describe("streak bonus", () => {
    it("no streak bonus at 2 consecutive correct", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 40000, consecutiveCorrect: 2 });
      expect(xp).toBe(10);
    });

    it("adds 15 XP at 3 consecutive correct", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 40000, consecutiveCorrect: 3 });
      expect(xp).toBe(25); // 10 + 15
    });

    it("adds 15 XP at 5+ consecutive correct", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 40000, consecutiveCorrect: 10 });
      expect(xp).toBe(25); // 10 + 15
    });
  });

  describe("combined bonuses", () => {
    it("fast + 3+ streak = 30 XP", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 5000, consecutiveCorrect: 3 });
      expect(xp).toBe(30); // 10 + 5 + 15
    });

    it("fast + no streak = 15 XP", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 10000, consecutiveCorrect: 1 });
      expect(xp).toBe(15); // 10 + 5
    });

    it("slow + 3+ streak = 25 XP", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 45000, consecutiveCorrect: 5 });
      expect(xp).toBe(25); // 10 + 15
    });

    it("slow + no streak = 10 XP", () => {
      const xp = computeXpForAttempt({ correct: true, elapsedMs: 45000, consecutiveCorrect: 2 });
      expect(xp).toBe(10);
    });
  });
});
