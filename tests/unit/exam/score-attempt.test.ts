import { describe, it, expect } from "vitest";
import { scoreAttempt, groupByDifficulty } from "@/lib/exam/score-attempt";
import type { ExamAnswerInput } from "@/lib/exam/types";

function answer(
  slot: number,
  expected: string,
  student: string | null,
  weight: number,
  difficulty: "M1" | "M2" | "M3" | "M4" = "M1",
): ExamAnswerInput {
  return {
    slotNo: slot,
    skillKey: "skill" + slot,
    difficulty,
    questionType: "NUMERIC",
    questionText: "Q" + slot,
    expectedAnswer: expected,
    studentAnswer: student,
    pointWeight: weight,
  };
}

describe("scoreAttempt", () => {
  it("all correct sums to total points", () => {
    const r = scoreAttempt({
      answers: [
        answer(1, "5", "5", 1),
        answer(2, "10", "10", 1.5),
        answer(3, "20", "20", 2),
      ],
    });
    expect(r.totalScore).toBe(4.5);
    expect(r.correctCount).toBe(3);
    expect(r.totalCount).toBe(3);
  });

  it("all wrong scores zero", () => {
    const r = scoreAttempt({
      answers: [
        answer(1, "5", "1", 1),
        answer(2, "10", "1", 1.5),
      ],
    });
    expect(r.totalScore).toBe(0);
    expect(r.correctCount).toBe(0);
  });

  it("partial scoring", () => {
    const r = scoreAttempt({
      answers: [
        answer(1, "5", "5", 1),
        answer(2, "10", "9", 1.5),
        answer(3, "20", "20", 2),
      ],
    });
    expect(r.totalScore).toBe(3);
    expect(r.correctCount).toBe(2);
  });

  it("skipped (null) is wrong with 0 points", () => {
    const r = scoreAttempt({ answers: [answer(1, "5", null, 1)] });
    expect(r.answers[0].isCorrect).toBe(false);
    expect(r.answers[0].pointEarned).toBe(0);
  });

  it("groupByDifficulty produces M1-M4 buckets", () => {
    const r = scoreAttempt({
      answers: [
        answer(1, "1", "1", 1, "M1"),
        answer(2, "1", "0", 1, "M1"),
        answer(3, "1", "1", 1, "M2"),
        answer(4, "1", "1", 1, "M3"),
        answer(5, "1", "0", 1, "M4"),
      ],
    });
    const g = groupByDifficulty(r.answers);
    expect(g.M1).toEqual({ correct: 1, total: 2 });
    expect(g.M2).toEqual({ correct: 1, total: 1 });
    expect(g.M3).toEqual({ correct: 1, total: 1 });
    expect(g.M4).toEqual({ correct: 0, total: 1 });
  });

  it("rounds totalScore to 2 decimals", () => {
    const r = scoreAttempt({
      answers: [
        answer(1, "5", "5", 0.33),
        answer(2, "5", "5", 0.33),
        answer(3, "5", "5", 0.34),
      ],
    });
    expect(r.totalScore).toBe(1);
  });
});
