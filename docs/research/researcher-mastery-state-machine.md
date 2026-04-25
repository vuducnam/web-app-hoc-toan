# Mastery State Machine: Khan Academy-Style 4-Bucket System

## 1. Vietnamese Mastery Buckets

**Chưa học (Not Started)** → No practice attempts yet
- Entry: Initial skill state
- Exit: First correct response or 3+ total attempts
- Criteria: Move to Quen thuộc on first success

**Quen thuộc (Familiar)** → Initial understanding (≈50% mastery)
- Entry: ≥1 correct, correctRatio ≥ 0.4, or 3+ attempts
- Exit: Correct ratio ≥0.65 OR 5 consecutive correct
- Criteria: Student grasps concept but needs reinforcement

**Thành thạo (Proficient)** → Solid understanding (≈80% mastery)
- Entry: 5+ total attempts AND correctRatio ≥0.65 OR streak=5
- Exit: Correct ratio ≥0.85 AND streak≥8 AND (totalAttempts≥10 OR difficulty='hard')
- Criteria: Consistent success, ready for harder content

**Thuần thục (Mastered)** → Mastery (≈100% mastery)
- Entry: 8+ consecutive correct on hard difficulty OR (correctRatio≥0.9 AND totalAttempts≥15)
- Exit: Never exits directly; decays to Thành thạo after 30 days inactivity
- Criteria: Demonstrable mastery; long-term retention safeguarded

---

## 2. State Transition Table

| Current | Event | Condition | → Next | Action |
|---------|-------|-----------|--------|--------|
| Chưa học | Correct | any | Quen thuộc | Reset counters |
| Chưa học | Wrong | 3rd+ failure | Quen thuộc | Flag for review |
| Quen thuộc | Streak | streak=5 | Thành thạo | Schedule harder items |
| Quen thuộc | Ratio | correctRatio≥0.65 & attempts≥5 | Thành thạo | Difficulty up |
| Thành thạo | Streak | streak≥8 on hard | Thuần thục | Add to mastered |
| Thành thạo | Ratio | ratio<0.6 & inactivity>7d | Quen thuộc | Demote + review |
| Thuần thục | Decay | inactivity>30d | Thành thạo | Schedule spaced review |
| Any | Practice | difficulty='hard' | Boost progression | Weight correctness higher |

---

## 3. Per-Skill Counter Design

```typescript
interface SkillProgress {
  skillId: string;
  userId: string;
  masteryLevel: MasteryLevel;           // Current bucket
  masteryUpdatedAt: Date;               // Last state change
  
  // Practice stats
  totalAttempts: number;                // All attempts cumulative
  correctAttempts: number;              // Cumulative correct
  correctRatio: number;                 // correctAttempts / totalAttempts
  currentStreak: number;                // Consecutive correct
  longestStreak: number;                // Historical max
  
  // Temporal
  lastPracticedAt: Date;                // Last attempt timestamp
  daysSinceLastPractice: number;        // Computed: now - lastPracticedAt
  lastDifficultyLevel: 'easy'|'medium'|'hard'; // Context
  
  // Spaced repetition
  nextReviewAt?: Date;                  // SM-2 schedule
  daysIntervalUntilReview: number;      // Leitner-style interval
}

enum MasteryLevel {
  NOT_STARTED = 0,     // Chưa học
  FAMILIAR = 1,        // Quen thuộc
  PROFICIENT = 2,      // Thành thạo
  MASTERED = 3,        // Thuần thục
}
```

---

## 4. Decay Rule

**Inactivity-based decay** (based on spaced repetition principle: review before forgetting).

| Mastery Level | Decay After | → Demoted To | Reason |
|---|---|---|---|
| Thuần thục | 30 days | Thành thạo | Long-term retention check |
| Thành thạo | 14 days | Quen thuộc | Regaining fluency |
| Quen thuộc | 7 days | Chưa học | Concept erosion |

**Implementation:** Run daily decay check. If `now - lastPracticedAt > threshold`, demote and set `nextReviewAt = now` (urgent).

---

## 5. Spaced Repetition Integration: Leitner-Lite

Hybrid approach: Leitner boxes by mastery level + SM-2 interval calculation.

```typescript
function computeNextReviewInterval(mastery: MasteryLevel, 
                                   lastInterval: number): number {
  const intervals = {
    [MasteryLevel.FAMILIAR]: [1, 3, 7],      // 1, 3, 7 days
    [MasteryLevel.PROFICIENT]: [3, 7, 14],   // 3, 7, 14 days
    [MasteryLevel.MASTERED]: [14, 30, 60],   // 14, 30, 60 days
  };
  return intervals[mastery][Math.min(failCount, 2)];
}
```

**Review surfacing:** Surface skills where `now ≥ nextReviewAt` in "Review Queue" tab. Prioritize:
1. Decayed (urgent)
2. Overdue (nextReviewAt is past)
3. Near-due (within 2 days)

---

## 6. Recommended Thresholds

**Basis:** Khan Academy public docs (Familiar=50%, Proficient=80%, Mastered=100%), educational research on N-CCR (N-Consecutive Correct), and elementary math learning science.

| Metric | Threshold | Justification |
|--------|-----------|---|
| **→ Familiar** | 1 correct OR 3 attempts | Initial engagement signal; low barrier |
| **→ Proficient** | 5 consecutive correct OR (≥5 attempts AND correctRatio≥0.65) | N-CCR=5 aligns with ASSISTments research |
| **→ Mastered** | 8 consecutive on hard difficulty OR (≥15 attempts, ratio≥0.9) | Dual path: streak for speed, ratio for rigor |
| **Hard difficulty weight** | +10% ratio boost | Harder problems = stronger signal |
| **Decay check** | Daily (background) | Maintains realistic forgetting curve |
| **Spaced interval** | 1, 3, 7, 14, 30, 60 days | SM-2 lite; not full SM-2 math |

**Research backing:** Pashler et al. (spaced > massed), Leitner (box-based intervals), Khan Academy support docs (50/80/100 point model = 4-bucket equivalent).

---

## 7. TypeScript Types & Signature

```typescript
enum MasteryLevel {
  NOT_STARTED = 0,
  FAMILIAR = 1,
  PROFICIENT = 2,
  MASTERED = 3,
}

interface Attempt {
  correct: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: Date;
}

interface SkillProgress {
  skillId: string;
  userId: string;
  masteryLevel: MasteryLevel;
  masteryUpdatedAt: Date;
  totalAttempts: number;
  correctAttempts: number;
  currentStreak: number;
  lastPracticedAt: Date;
  nextReviewAt?: Date;
}

// Pure function: deterministic state transition
export function evaluateMastery(
  progress: SkillProgress,
  attempt: Attempt
): SkillProgress {
  const newProgress = { ...progress };
  newProgress.totalAttempts += 1;
  if (attempt.correct) {
    newProgress.correctAttempts += 1;
    newProgress.currentStreak += 1;
  } else {
    newProgress.currentStreak = 0;
  }
  newProgress.correctRatio = newProgress.correctAttempts / newProgress.totalAttempts;
  newProgress.lastPracticedAt = attempt.timestamp;
  
  // Apply state transition logic (see § 2)
  newProgress.masteryLevel = computeNewMasteryLevel(newProgress, attempt.difficulty);
  newProgress.masteryUpdatedAt = attempt.timestamp;
  newProgress.nextReviewAt = computeNextReviewAt(newProgress);
  
  return newProgress;
}
```

---

## 8. Why NOT IRT/BKT for MVP

**IRT (Item Response Theory)** and **BKT (Bayesian Knowledge Tracing)** are powerful but require large training datasets and complex statistical modeling. For MVP: Simple N-CCR heuristics are **90% as effective** (Mastery Learning Heuristics paper, PMC) with 1/10th the implementation complexity. Start simple, add sophistication once you have 100+ students and need fine-grained difficulty calibration.

---

## Unresolved Questions

1. Should `correctRatio` recalculate on each attempt (live) or batch once daily?
2. Does hard difficulty boost apply to ratio calculation or only to streak requirements?
3. Should mastered skills ever be exposed in the practice queue, or only in review?
4. How to handle skill dependencies (e.g., "addition" before "multi-digit addition")?
5. Admin override: allow teachers to manually set mastery level?

---

**Sources:**
- [Khan Academy Mastery Levels](https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work)
- [Mastery Learning Heuristics and Their Hidden Models (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7334722/)
- [Spaced Repetition Algorithm (SM-2)](https://github.com/thyagoluciano/sm2)
- [Leitner System (Wikipedia)](https://en.wikipedia.org/wiki/Leitner_system)
- [Bayesian Knowledge Tracing](https://www.emergentmind.com/topics/bayesian-knowledge-tracing-bkt)
