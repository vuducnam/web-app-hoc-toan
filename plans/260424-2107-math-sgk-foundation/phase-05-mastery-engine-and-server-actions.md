---
title: "Phase 05 — Mastery Engine + Server Actions"
priority: P1
effort: 7h
status: completed
depends_on: [03, 04]
completed: 2026-04-24
---

# Phase 05 — Mastery Engine + Server Actions

## Context Links
- Research: `docs/research/researcher-mastery-state-machine.md` — state machine, thresholds, decay, SM-2 lite
- Research: `docs/research/researcher-procedural-generators.md` §4 — anti-cheating (server regenerates)
- Phase 04 — `GENERATORS` registry and `Generator.validate`

## Overview
Pure `evaluateMastery(progress, attempt)` function + two server actions: `getNextQuestion(skillKey)` and `submitAnswer({ skillKey, seed, difficulty, userAnswer, elapsedMs })`. Submit regenerates question server-side, validates, updates SkillProgress atomically, returns feedback payload sans `expectedAnswer`.

## Key Insights
- Mastery transitions are pure/deterministic. Making them a pure function lets Phase 12 test every transition row from research §2 table with zero DB.
- **Never trust client "elapsedMs"** for rate-limit decisions; use it for XP (Phase 11) only, cap at sane max (e.g. 600s).
- **Seed is the integrity token.** Client sends back seed + difficulty + skillKey received from `getNextQuestion`. Server re-runs `getGenerator(skillKey).generate({seed,...})` to recover `expectedAnswer`.
- Atomic update: use `prisma.$transaction([insertAttempt, upsertSkillProgress])`.

## Requirements
**Functional:**
- `getNextQuestion(skillKey)`:
  - Verify STUDENT session
  - Load SkillProgress; derive next difficulty (NOT_STARTED→1, FAMILIAR→2, PROFICIENT/MASTERED→3)
  - Generate seed = `crypto.randomUUID()`
  - Call `getGenerator(skillKey).generate({seed, difficulty, skillKey})`
  - **Strip `expectedAnswer`** from return value. Return `{ id, skillKey, problemText, problemLatex?, answerFormat, choices?, seed, difficulty, timeEstimateSec }`.
- `submitAnswer({skillKey, seed, difficulty, userAnswer, elapsedMs})`:
  - Verify STUDENT session
  - Re-call `getGenerator(skillKey).generate({seed, difficulty, skillKey})` → recover `q.expectedAnswer`
  - Call `generator.validate(userAnswer, q)` → `correct: boolean`
  - Transaction:
    - `prisma.attempt.create({ userId, skillKey, seed, submittedAnswer, correct, difficulty, elapsedMs })`
    - Load current `SkillProgress` (or initialize), pass through `evaluateMastery`, upsert back
  - Return `{ correct, newMasteryLevel, leveledUp: boolean, encouragementKey: string }` — phase 09 maps `encouragementKey` to a random phrase.
  - **Never return `expectedAnswer`.** For wrong answers, Phase 09 shows a "try again" UI, not the correct answer (matches UX_DECISIONS: no correct-answer reveal on single fail).

**Non-functional:**
- `evaluateMastery` = pure, no imports from Prisma. Takes plain object, returns plain object.
- Server actions are `"use server"` top-of-file.
- Duplicate `(userId, skillKey, seed)` submit → reject with `{ error: "replay" }` (checks Phase 01 `Attempt` index).

## Architecture
```
submitAnswer (server action)
  -> verifyStudent() [Phase 02]
  -> getGenerator(skillKey).generate({seed,...})   [Phase 04]
  -> validate(userAnswer, q)
  -> prisma.$transaction:
       a. attempt.create
       b. skillProgress.upsert (using evaluateMastery output)
  -> evaluateBadges (Phase 11 hook - noop for now, wired in P11)
  -> returns redacted payload
```

## Related Code Files
**Create:**
- `src/lib/mastery/types.ts` — `MasteryLevel`, `Attempt`, `SkillProgress` types matching Prisma (local TS shape, not regen from Prisma client)
- `src/lib/mastery/evaluate-mastery.ts` — pure function (state-transition table §2)
- `src/lib/mastery/compute-next-review.ts` — SM-2 lite intervals (§5)
- `src/lib/mastery/next-difficulty.ts` — `(level) -> Difficulty`
- `src/app/actions/practice.ts` — `getNextQuestion`, `submitAnswer`
- `src/lib/mastery/strip-answer.ts` — helper removes `expectedAnswer` + any solution hints from Question

**Modify:**
- None. (Phase 11 later adds XP calc into `submitAnswer`.)

## Implementation Steps
1. Write `types.ts` mirroring Prisma `SkillProgress` (not auto-gen).
2. Write `evaluate-mastery.ts` strictly implementing state-transition table from research §2. Cover every row — include explicit test-friendly returns even for no-op cases.
3. Write `compute-next-review.ts` — intervals `[1,3,7]` / `[3,7,14]` / `[14,30,60]` per level; returns Date.
4. Write `next-difficulty.ts` — `NOT_STARTED→1, FAMILIAR→2, PROFICIENT→3, MASTERED→3` (MASTERED still gets hard for retention).
5. Write `strip-answer.ts`:
   ```ts
   export function stripAnswer<T>(q: Question<T>) {
     const { expectedAnswer, ...rest } = q; return rest;
   }
   ```
6. Write `src/app/actions/practice.ts`:
   ```ts
   "use server";
   import { verifyStudent } from "@/lib/dal";
   import { getGenerator } from "@/lib/generators/registry";
   import { evaluateMastery } from "@/lib/mastery/evaluate-mastery";
   import { stripAnswer } from "@/lib/mastery/strip-answer";
   import { prisma } from "@/lib/prisma";

   export async function getNextQuestion(skillKey: string) { /* ... */ }
   export async function submitAnswer(input: {...}) { /* transaction */ }
   ```
7. Manual smoke: seed a test student, call `getNextQuestion("add-sub-100k-carry")`, check response has no `expectedAnswer`. Submit both a correct and wrong value; verify SkillProgress updates.

## Todo List
- [x] types.ts
- [x] evaluate-mastery.ts (every row from §2)
- [x] compute-next-review.ts
- [x] next-difficulty.ts
- [x] strip-answer.ts
- [x] getNextQuestion action
- [x] submitAnswer action with transaction
- [x] Replay detection (duplicate seed) returns error
- [x] Manual smoke on one skill

## Success Criteria
- [x] Unit tests (Phase 12) cover all 8 transition rows from research §2
- [x] `getNextQuestion` response has NO `expectedAnswer` key (checked via `JSON.stringify` not containing it)
- [x] `submitAnswer` writes exactly 1 Attempt and 1 SkillProgress row per call
- [x] Duplicate `(userId, skillKey, seed)` submit returns `{error:"replay"}`
- [x] Typecheck green

## Risk Assessment
**R1 — `expectedAnswer` leaks through Next.js server-action serialization (High/High):** Server actions serialize return values; a careless destructure leaves the field present. *Mitigation:* `stripAnswer` helper is only path through which Question leaves the module; code review rule "any `return` that includes a `Question` must go through `stripAnswer`"; Phase 12 test sends a request and asserts response JSON lacks the key.

**R2 — Non-deterministic generator = broken submit (Medium/High):** If a generator uses `Math.random` instead of the seeded RNG, submit-time regeneration won't match generate-time. *Mitigation:* Phase 04 rule "no `Math.random` in generators" + Phase 12 test runs each live generator twice with same seed and asserts identical `expectedAnswer`.

## Rollback Plan
Feature-flag the submit action; if buggy, return placeholder response and log. Mastery state won't advance but UI keeps working.

## Next Steps
Unblocks Phase 08 (practice flow uses both actions), Phase 09 (feedback uses return payload), Phase 11 (hooks into submitAnswer).

## Completion Note
Pure mastery state machine (8 transitions). getNextQuestion/submitAnswer with stripAnswer. Atomic transaction. No expectedAnswer leaks. Replay detection via (userId, skillKey, seed) index.
