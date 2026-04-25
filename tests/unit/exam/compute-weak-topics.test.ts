import { describe, it, expect } from "vitest";
import { computeWeakTopics } from "@/lib/exam/compute-weak-topics";
import type { ScoredAnswer } from "@/lib/exam/types";

function ans(slot: number, skill: string, correct: boolean): ScoredAnswer {
  return {
    slotNo: slot,
    skillKey: skill,
    difficulty: "M1",
    questionType: "NUMERIC",
    questionText: "Q",
    expectedAnswer: "1",
    studentAnswer: correct ? "1" : "0",
    pointWeight: 1,
    isCorrect: correct,
    pointEarned: correct ? 1 : 0,
  };
}

describe("computeWeakTopics", () => {
  const lookup = {
    "skill-a": { topicId: "topic-1", topicName: "Phép cộng" },
    "skill-b": { topicId: "topic-1", topicName: "Phép cộng" },
    "skill-c": { topicId: "topic-2", topicName: "Phân số" },
  };

  it("returns empty when all topics ≥60% accuracy", () => {
    const r = computeWeakTopics({
      scoredAnswers: [
        ans(1, "skill-a", true),
        ans(2, "skill-b", true),
      ],
      topicLookup: lookup,
    });
    expect(r).toEqual([]);
  });

  it("flags topic with <60% accuracy", () => {
    const r = computeWeakTopics({
      scoredAnswers: [
        ans(1, "skill-a", false),
        ans(2, "skill-b", false),
        ans(3, "skill-c", true),
      ],
      topicLookup: lookup,
    });
    expect(r).toHaveLength(1);
    expect(r[0].topicId).toBe("topic-1");
    expect(r[0].accuracy).toBe(0);
  });

  it("sorts ascending by accuracy", () => {
    const r = computeWeakTopics({
      scoredAnswers: [
        ans(1, "skill-a", true),
        ans(2, "skill-b", false),  // topic-1 = 50%
        ans(3, "skill-c", false),  // topic-2 = 0%
      ],
      topicLookup: lookup,
    });
    expect(r).toHaveLength(2);
    expect(r[0].topicId).toBe("topic-2");
    expect(r[1].topicId).toBe("topic-1");
  });

  it("ignores answers without topicLookup match", () => {
    const r = computeWeakTopics({
      scoredAnswers: [ans(1, "unknown-skill", false)],
      topicLookup: lookup,
    });
    expect(r).toEqual([]);
  });

  it("respects custom threshold", () => {
    const r = computeWeakTopics({
      scoredAnswers: [
        ans(1, "skill-a", true),
        ans(2, "skill-b", false), // 50% → still <80%
      ],
      topicLookup: lookup,
      threshold: 0.8,
    });
    expect(r).toHaveLength(1);
  });
});
