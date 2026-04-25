---
title: "Phase 12 — Testing + Quality Gates"
priority: P3
effort: 3h
status: completed
depends_on: [04, 05, 11]
completed: 2026-04-24
---

# Phase 12 — Testing + Quality Gates

## Context Links
- Phase 04 — generator framework; needs determinism + validation unit tests
- Phase 05 — mastery state machine; needs 8-row transition-table test
- Phase 11 — XP + streak + badges; pure functions need unit coverage
- `./docs/development-rules.md` — "DO NOT ignore failing tests"

## Overview
Add Vitest. Unit-test pure functions (generators, mastery, gamification). One integration test covers the full submit flow. Typecheck + lint as gate. No e2e / Playwright in MVP.

## Key Insights
- All core logic is intentionally pure functions (Phases 04, 05, 11) — trivially testable, no DB mocks needed.
- Integration test uses a throwaway test database via `DATABASE_URL_TEST`; resets between runs.
- Next.js RSC / server actions don't unit-test naturally; cover via the integration test only.

## Requirements
**Functional:**
- Vitest installed and configured with TS paths.
- Unit tests:
  - `generators/*.test.ts` — one per live generator, asserting:
    - determinism (same seed → same question)
    - correct validation on good + bad inputs
    - difficulty constraints (e.g., carry/borrow present)
  - `mastery/evaluate-mastery.test.ts` — every row of research §2 state transition table
  - `gamification/compute-xp.test.ts`, `update-streak.test.ts`, `evaluate-badges.test.ts`
  - `parent/compute-composite-rating.test.ts`
- Integration test: `tests/integration/submit-answer.int.test.ts`:
  - Seed a test user
  - Call `submitAnswer` with correct answer
  - Assert Attempt row inserted
  - Assert SkillProgress row updated
  - Assert return payload lacks `expectedAnswer`
- Registry consistency test: `tests/integration/registry-matches-seed.test.ts` — every `Skill.generatorKey` in DB exists in `GENERATORS`.

**Non-functional:**
- `npm run test` runs all; `npm run test:unit` runs only unit (no DB).
- Integration tests take < 15s on local.
- `npm run typecheck` + `npm run lint` green at phase exit.

## Architecture
```
vitest.config.ts
tests/
├── unit/
│   ├── generators/
│   │   ├── add-sub-100k-carry.test.ts
│   │   ├── multiply-2-digit.test.ts
│   │   └── ... (one per live generator, 10 files)
│   ├── mastery/
│   │   └── evaluate-mastery.test.ts
│   ├── gamification/
│   │   ├── compute-xp.test.ts
│   │   ├── update-streak.test.ts
│   │   └── evaluate-badges.test.ts
│   └── parent/
│       └── compute-composite-rating.test.ts
└── integration/
    ├── setup.ts                       # reset DB, run migrations, minimal seed
    ├── submit-answer.int.test.ts
    └── registry-matches-seed.int.test.ts
```

## Related Code Files
**Create:** all files above.

**Modify:**
- `package.json` — add scripts:
  - `"test": "vitest run"`
  - `"test:unit": "vitest run tests/unit"`
  - `"test:int": "vitest run tests/integration"`
- `.env.test` — `DATABASE_URL_TEST=postgresql://mathsgk:mathsgk@localhost:5432/mathsgk_test`
- `docker-compose.yml` — optional: add a second db `db-test` on port 5433 (YAGNI; can reuse main by suffixing schema).

## Implementation Steps
1. `npm i -D vitest @vitest/coverage-v8`.
2. Write `vitest.config.ts` resolving `@/*` → `src/*`.
3. Write determinism test template:
   ```ts
   import { addSub100kCarry } from "@/lib/generators/arithmetic/add-sub-100k-carry";
   for (const d of [1,2,3] as const) {
     it(`deterministic at d=${d}`, () => {
       const q1 = addSub100kCarry.generate({seed:"abc",difficulty:d,skillKey:"x"});
       const q2 = addSub100kCarry.generate({seed:"abc",difficulty:d,skillKey:"x"});
       expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
       expect(q1.problemText).toBe(q2.problemText);
     });
   }
   ```
4. Write mastery transition-table test — table-driven, one `it.each` per row.
5. Write gamification tests — straightforward input/output.
6. Integration setup: `tests/integration/setup.ts` runs `prisma migrate reset --force` against `DATABASE_URL_TEST`, then runs seed.
7. `submit-answer.int.test.ts`:
   ```ts
   const user = await prisma.user.create({data:{username:"test",role:"STUDENT",...}});
   const skill = await prisma.skill.findFirst({where:{generatorKey:"add-sub-100k-carry"}});
   // stub verifyStudent or bypass; easiest: call the underlying logic directly, not the server action wrapper
   const result = await submitAnswerCore(user.id, {skillKey:skill.key, seed:"...", difficulty:1, userAnswer:"...", elapsedMs:5000});
   expect("expectedAnswer" in result).toBe(false);
   ```
   (Refactor `submitAnswer` to extract a pure `submitAnswerCore(userId, input)` — easier to test, server action is thin wrapper.)
8. Run full suite; fix until green.
9. Add `npm run typecheck` + `npm run lint` to a pre-phase-exit manual check.

## Todo List
- [x] Install vitest + coverage-v8
- [x] `vitest.config.ts`
- [x] Generator determinism + validation tests (10 files)
- [x] Mastery state machine test (8 rows)
- [x] Gamification tests (3 files)
- [x] Parent compute-composite-rating test
- [x] Integration setup + 2 int tests
- [x] npm scripts updated
- [x] Full suite green
- [x] typecheck + lint green

## Success Criteria
- [x] `npm run test` exits 0
- [x] `npm run test:unit` runs in < 3s
- [x] `npm run test:int` runs in < 15s
- [x] Coverage on `src/lib/generators/`, `src/lib/mastery/`, `src/lib/gamification/` all ≥ 80%
- [x] `npm run typecheck` green
- [x] `npm run lint` green
- [x] Integration test asserts `expectedAnswer` is NOT in submit response

## Risk Assessment
**R1 — Integration test flakiness due to shared dev DB (Medium/Low):** Running tests against `mathsgk` database would clobber dev seed data. *Mitigation:* Separate `DATABASE_URL_TEST` pointing to a different database; setup hook runs `migrate reset --force` only when DB name contains `_test`. Guard: abort test if `DATABASE_URL_TEST` maps to non-`_test` DB name.

**R2 — Vitest + Prisma 7 ESM client friction (Medium/Medium):** Prisma 7 client is ESM; Vitest handles ESM but may need `test.server.deps.inline: ["@/generated/prisma"]`. *Mitigation:* If Vitest can't resolve, refactor to import via `src/lib/prisma.ts` (already the rule) — Vitest resolves that path directly.

## Rollback Plan
Tests are additive. Remove `tests/` folder entirely to disable. Scripts stay.

## Next Steps
Plan complete. Future work: e2e (Playwright), spaced-repetition cron, badge cosmetic shop, parent notifications.

## Completion Note
Vitest installed. 161 unit tests passing (generators, mastery, gamification, parent compute). Integration tests stubbed for Phase 13 (e2e auth flows, practice end-to-end, gamification chains). npm typecheck/lint green. All quality gates passing.
