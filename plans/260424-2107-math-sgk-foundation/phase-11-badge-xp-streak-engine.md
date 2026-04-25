---
title: "Phase 11 — Badge / XP / Streak Engine"
priority: P3
effort: 4h
status: completed
depends_on: [05]
completed: 2026-04-24
---

# Phase 11 — Badge / XP / Streak Engine

## Context Links
- Research: `docs/research/researcher-child-safe-gamification.md` §2 (XP rules), §3 (16 badges), §5 (anti-Duolingo streak)
- `UX_DECISIONS.md` — streak reset is transparent, no guilt notifications
- Phase 03 — 16 badges seeded with `criteria` JSON
- Phase 05 — `submitAnswer` is the hook site

## Overview
Three pure helpers + wire them into `submitAnswer`:
1. `computeXpForAttempt(attempt, context) → xp: number`
2. `evaluateBadges(user, progress, recentAttempts) → newlyEarnedBadges[]`
3. `updateStreakOnAttempt(streak, today, timezone) → newStreak`

Plus daily goal accumulator. All Asia/Saigon TZ.

## Key Insights
- **XP rules (research §2):** +10 base, +5 if elapsedMs < 30s, +15 per extra consecutive correct (3+), +50 on daily-goal completion.
- **Streak = days-active count**, reset to 0 after 1 missed day. No "you lost your streak" alert (§5 anti-pattern).
- **Badge evaluation is data-driven**: each `Badge.criteria` JSON is interpreted generically:
  - `{type:"correct_count", value:N}` — trigger when `correctAttempts ≥ N`
  - `{type:"consecutive_days", value:N}` — trigger when `streak.currentDays ≥ N`
  - `{type:"fast_correct", fastThresholdMs:20000, count:N}` — need helper to count fast corrects
  - `{type:"variety_skills", count:N}` — distinct skills practiced
  - `{type:"accuracy_rate", ratio:0.9, minAttempts:10}`
  - `{type:"consistency", value:5}` — 5 daily-goals streak
  - `{type:"topic_unlock", topicKey:"..."}` — per-topic mastery milestone
- **Timezone**: store `Streak.lastActiveDate` as DATE in Asia/Saigon. Use `Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh"})` to get YYYY-MM-DD today.

## Requirements
**Functional:**
- `computeXpForAttempt({correct, elapsedMs, consecutiveCorrect})` returns base + speed + consecutive bonus.
- `updateStreakOnAttempt(streak, todayDate)`:
  - If `lastActiveDate === todayDate`: no-op
  - If `lastActiveDate === todayDate - 1`: increment `currentDays`
  - Else: reset `currentDays = 1`
  - `longestDays = max(longest, current)`
- `evaluateBadges` returns list of badge keys to award (not already in `UserBadge`).
- `submitAnswer` (Phase 05) extended:
  - Add XP into `DailyGoal.xpEarned` (upsert by userId+today)
  - Update streak
  - Insert `UserBadge` rows for newly earned
  - Return `xpEarned`, `newBadges`, `dailyGoalCompleted`

**Non-functional:**
- All helpers pure; testable without DB (Phase 12).
- Badge evaluation runs synchronously on submit for MVP. If perf degrades (>50ms), move to a queue.

## Architecture
```
src/lib/gamification/
├── compute-xp.ts                 # pure
├── update-streak.ts              # pure
├── evaluate-badges.ts            # pure; takes pre-loaded aggregates
├── badge-criteria-types.ts       # TS discriminated union matching Badge.criteria JSON shapes
├── vietnam-today.ts              # Asia/Saigon date helper
└── daily-goal.ts                 # upsert + detect completion
```

## Related Code Files
**Create:** files above.

**Modify:**
- `src/app/actions/practice.ts` — extend `submitAnswer` transaction to include XP + streak + badges.
- `prisma/seed-data/badges.ts` — ensure `criteria` shape matches `badge-criteria-types.ts`.

## Implementation Steps
1. Write `badge-criteria-types.ts`:
   ```ts
   export type BadgeCriteria =
     | {type:"correct_count"; value:number}
     | {type:"consecutive_days"; value:number}
     | {type:"fast_correct"; fastThresholdMs:number; count:number}
     | {type:"variety_skills"; count:number}
     | {type:"accuracy_rate"; ratio:number; minAttempts:number}
     | {type:"consistency"; value:number}
     | {type:"topic_unlock"; topicKey:string};
   ```
2. Back-fill Phase 03 `seed-data/badges.ts` if rows don't already match. (If Phase 03 shipped with plain text criteria, update the seed JSONs to the shape above.)
3. Write `vietnam-today.ts`:
   ```ts
   export function vietnamToday(now = new Date()) {
     return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh"}).format(now); // YYYY-MM-DD
   }
   ```
4. Write `compute-xp.ts`:
   ```ts
   export function computeXpForAttempt(a: {correct:boolean; elapsedMs:number; consecutiveCorrect:number}) {
     if (!a.correct) return 0;
     let xp = 10;
     if (a.elapsedMs < 30_000) xp += 5;
     if (a.consecutiveCorrect >= 3) xp += 15;
     return xp;
   }
   ```
5. Write `update-streak.ts` — pure function per spec in §2.
6. Write `evaluate-badges.ts`:
   ```ts
   export function evaluateBadges(aggregates: UserAggregates, badges: Badge[]): string[] {
     return badges.filter(b => !aggregates.ownedBadgeKeys.has(b.key) && matches(b.criteria as BadgeCriteria, aggregates)).map(b => b.key);
   }
   ```
   with `matches` as a switch over the discriminated union.
7. Write `daily-goal.ts`:
   - `upsertDailyGoal(userId, todayDate, xpDelta, minutesDelta)` → returns `{completed: boolean, wasAlreadyCompleted: boolean}`. Target = 10 minutes (research §2). Completion = `completedMin >= targetMin`.
   - If newly completed: caller adds +50 bonus XP, `newBadges` picker will pick up consistency streak.
8. Extend `submitAnswer` in `src/app/actions/practice.ts`:
   ```ts
   const today = vietnamToday();
   const xp = computeXpForAttempt({correct, elapsedMs, consecutiveCorrect: newProgress.currentStreak});
   const streak = await prisma.streak.findUnique({where:{userId}}) ?? initialStreak;
   const newStreak = updateStreakOnAttempt(streak, today);
   const goal = await upsertDailyGoal(userId, today, xp, elapsedMin);
   const bonusXp = goal.completed && !goal.wasAlreadyCompleted ? 50 : 0;
   const aggs = await loadUserAggregates(userId);
   const newBadgeKeys = evaluateBadges(aggs, allBadges);
   // persist in same transaction
   return {correct, leveledUp, newMasteryLevel, xpEarned: xp + bonusXp, newBadges: newBadgeKeys, dailyGoalCompleted: goal.completed};
   ```
9. Update Phase 09 summary to show `xpEarned` + `newBadges` from this response (store in session state).

## Todo List
- [x] `badge-criteria-types.ts`
- [x] Back-fill badge seed criteria
- [x] `vietnam-today.ts`
- [x] `compute-xp.ts`
- [x] `update-streak.ts`
- [x] `evaluate-badges.ts` + `matches` switch
- [x] `daily-goal.ts`
- [x] Extend `submitAnswer` transaction
- [x] Phase 09 summary shows new fields

## Success Criteria
- [x] Correct answer in 10s with 3+ consecutive → +30 XP (10+5+15)
- [x] First daily-goal completion → +50 bonus on that submit only
- [x] Streak increments by 1 on a new day, resets on missed day
- [x] "Khởi Đầu" badge awarded on 5th correct answer; not re-awarded on 6th
- [x] `evaluateBadges` is O(badges) and pure — no DB inside
- [x] Typecheck green

## Risk Assessment
**R1 — Badge criteria drift between seed JSON and TS union (Medium/High):** `Badge.criteria` is `Json` in Prisma; TS union isn't enforced at DB level. A typo in seed breaks `matches()`. *Mitigation:* Seed file imports `BadgeCriteria` type and declares each badge with `criteria: BadgeCriteria`. `as const` + explicit annotation surface mismatches at compile.

**R2 — Streak timezone edge (Medium/Medium):** User practices at 23:55 Vietnam then 00:05 next day — should count as 2 days, not 1. *Mitigation:* `vietnamToday()` uses ICU formatter; `update-streak.ts` compares DATE strings, not Date objects. Phase 12 test covers DST and TZ boundaries.

## Rollback Plan
`evaluateBadges` returning `[]` is the no-op fallback. Remove the call from `submitAnswer` to disable; core mastery still works.

## Next Steps
Unblocks Phase 12 — full quality gate run.

## Completion Note
Pure XP/streak/badge helpers. Asia/Saigon timezone-aware streak. Badge criteria via discriminated union. Extended submitAnswer with gamification. +10 base XP, +5 speed, +15 consecutive, +50 daily goal. 16 badges evaluated synchronously.
