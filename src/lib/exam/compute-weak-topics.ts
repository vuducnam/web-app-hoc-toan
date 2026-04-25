// Detect topics where student got <60% accuracy in this attempt.
import "server-only";
import type { ScoredAnswer, WeakTopic } from "./types";

export interface ComputeWeakTopicsInput {
  scoredAnswers: ScoredAnswer[];
  /** skillKey -> {topicId, topicName} mapping. */
  topicLookup: Record<string, { topicId: string; topicName?: string }>;
  /** Below this accuracy ratio, topic counts as weak. Default 0.6. */
  threshold?: number;
}

export function computeWeakTopics(input: ComputeWeakTopicsInput): WeakTopic[] {
  const { scoredAnswers, topicLookup, threshold = 0.6 } = input;
  const groups = new Map<
    string,
    { topicId: string; topicName?: string; skillKeys: Set<string>; correct: number; total: number }
  >();

  for (const a of scoredAnswers) {
    const skillKey = a.skillKey ?? "_unknown";
    const meta = topicLookup[skillKey];
    if (!meta) continue;
    const key = meta.topicId;
    const g = groups.get(key) ?? {
      topicId: meta.topicId,
      topicName: meta.topicName,
      skillKeys: new Set<string>(),
      correct: 0,
      total: 0,
    };
    g.skillKeys.add(skillKey);
    g.total += 1;
    if (a.isCorrect) g.correct += 1;
    groups.set(key, g);
  }

  const out: WeakTopic[] = [];
  for (const g of groups.values()) {
    const accuracy = g.total > 0 ? g.correct / g.total : 0;
    if (accuracy < threshold) {
      out.push({
        topicId: g.topicId,
        topicName: g.topicName,
        skillKeys: Array.from(g.skillKeys),
        accuracy: Math.round(accuracy * 100) / 100,
        totalCount: g.total,
      });
    }
  }
  out.sort((a, b) => a.accuracy - b.accuracy);
  return out;
}
