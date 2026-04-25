---
title: "Phase 01 — Infrastructure & DB Schema"
priority: P1
effort: 6h
status: completed
depends_on: []
completed: 2026-04-24
---

# Phase 01 — Infrastructure & DB Schema

## Context Links
- Scaffold: `docker-compose.yml`, `prisma/schema.prisma`, `prisma.config.ts`, `.env.example`
- Research: `docs/research/researcher-mastery-state-machine.md` §3 (SkillProgress fields)
- Research: `docs/research/researcher-curriculum-knt-k45.md` (Grade/Volume/Topic/Lesson/Skill hierarchy)
- Research: `docs/research/researcher-nextauth-v5-dual-provider.md` §1-2 (Account/Session models)

## Overview
Stand up Postgres 16, define full Prisma schema (auth + curriculum + progress + gamification), run initial migration. No seed yet (Phase 03). No app code uses these tables yet.

## Requirements
**Functional:**
- User can be STUDENT or PARENT; linked via `parentId` (1:N — one parent, many children for MVP).
- Curriculum: Grade → Volume → Topic → Lesson → Skill. Skill has `generatorKey` OR `poolKey` (one must be non-null).
- SkillProgress per (userId, skillKey): mastery bucket + counters + temporal + next-review.
- Attempt log per answer (for analytics + rate-limit + replay detection).
- Badge + UserBadge join. DailyGoal per (userId, date). Streak per userId.
- NextAuth models: Account, Session, VerificationToken (boilerplate).

**Non-functional:**
- All IDs `cuid()` strings.
- All timestamps `DateTime @default(now())`.
- Indexes on every FK + every query predicate the server actions will use.
- Compound unique: `(userId, skillKey)` on SkillProgress; `(userId, date)` on DailyGoal; `(userId, badgeKey)` on UserBadge.

## Architecture
**Prisma 7 quirk:** Generator is `"prisma-client"` (new ESM client) outputting to `src/generated/prisma`. Import path becomes `@/generated/prisma` — NOT `@prisma/client`. `src/lib/prisma.ts` singleton re-exports.

**Enum strategy:** `Role` (STUDENT, PARENT), `MasteryLevel` (NOT_STARTED, FAMILIAR, PROFICIENT, MASTERED), `Difficulty` (EASY, MEDIUM, HARD), `AnswerFormat` (NUMERIC, FRACTION, DECIMAL, TEXT, MULTIPLE_CHOICE). All stored as Postgres enums.

**Curriculum keys:** String slugs are canonical identifiers (e.g., `skill.key = "g4-add-sub-100k-carry"`). IDs used only for FK speed.

## Related Code Files
**Modify:**
- `prisma/schema.prisma` (currently 14-line stub)
- `package.json` scripts (add `db:generate` runs `prisma generate`)
- `.env.example` (ensure `DATABASE_URL` + `AUTH_SECRET` entries)

**Create:**
- `prisma/migrations/<timestamp>_init/migration.sql` (generated)
- `src/lib/prisma.ts` — singleton PrismaClient, dev HMR guard

## Implementation Steps
1. Start DB: `npm run db:up`. Wait for healthcheck green (`docker compose ps`).
2. Write `prisma/schema.prisma` models in this order (matches dependency topology):
   - `User` (id, username unique nullable, email unique nullable, pinHash nullable, passwordHash nullable, role, name, avatarUrl, parentId FK self, createdAt, updatedAt)
   - NextAuth: `Account`, `Session`, `VerificationToken` per `@auth/prisma-adapter` shape
   - Curriculum: `Grade` (key unique, name), `Volume` (gradeId FK, order, name), `Topic` (volumeId FK, order, nameVi), `Lesson` (topicId FK, order, nameVi), `Skill` (lessonId FK, key unique, nameVi, generatorKey?, poolKey?, answerFormat, timeEstimateSec)
   - Progress: `SkillProgress` (userId FK, skillKey FK→Skill.key, masteryLevel, totalAttempts, correctAttempts, currentStreak, longestStreak, lastPracticedAt, lastDifficulty, nextReviewAt?, daysIntervalUntilReview Int @default(0)); `@@unique([userId, skillKey])`
   - `Attempt` (userId FK, skillKey, seed, submittedAnswer, correct Bool, difficulty, elapsedMs, createdAt) — index `(userId, createdAt)` and `(userId, skillKey, seed)` for replay detection
   - Gamification: `Badge` (key unique, nameVi, descVi, tier, category, criteria Json), `UserBadge` (userId FK, badgeKey FK, earnedAt; `@@unique([userId, badgeKey])`), `DailyGoal` (userId FK, date Date, targetMin Int, completedMin Int, xpEarned Int; `@@unique([userId, date])`), `Streak` (userId FK unique, currentDays Int, longestDays Int, lastActiveDate Date)
3. Add indexes: every FK, plus `User.parentId`, `User.role`, `Attempt.createdAt`, `SkillProgress.nextReviewAt`.
4. Create `src/lib/prisma.ts`:
   ```ts
   import { PrismaClient } from "@/generated/prisma";
   const g = globalThis as unknown as { prisma?: PrismaClient };
   export const prisma = g.prisma ?? new PrismaClient();
   if (process.env.NODE_ENV !== "production") g.prisma = prisma;
   ```
5. Run `npm run db:generate && npm run db:migrate` with migration name `init`. Verify `src/generated/prisma/` populated.
6. Commit migration SQL; do NOT commit `src/generated/prisma/` (add to `.gitignore` if missing).
7. Run `npm run typecheck` — must pass with zero errors.

## Todo List
- [x] Update `.gitignore` excludes `src/generated/prisma/`
- [x] Write all 16 models to `schema.prisma`
- [x] Add all enums
- [x] Add compound unique + index directives
- [x] `src/lib/prisma.ts` singleton
- [x] Run migration, verify generated client exists
- [x] Typecheck green

## Success Criteria
- [x] `docker compose ps` shows `mathsgk-db` healthy
- [x] `npx prisma migrate status` shows init migration applied, no drift
- [x] `import { prisma } from "@/lib/prisma"` resolves in a scratch file
- [x] `psql` shows all 16 tables with correct FKs and unique constraints
- [x] `npm run typecheck` passes

## Risk Assessment
**R1 — Prisma 7 ESM client path (High likelihood / High impact):** New generator `"prisma-client"` outputs ESM to `src/generated/prisma`, not the classic `@prisma/client`. Every import in downstream phases depends on this path. *Mitigation:* Establish `@/lib/prisma` re-export NOW; enforce code review rule "no direct `@/generated/prisma` imports outside `src/lib/prisma.ts`".

**R2 — Migration drift when schema evolves in later phases (Medium/Medium):** Phases 05 and 11 may add columns to `SkillProgress` / `User` (e.g., `totalXp`). *Mitigation:* Each phase that modifies schema lists its migration name in its own success criteria; no phase modifies another phase's tables without naming a new migration.

## Rollback Plan
`npm run db:reset` drops and re-applies all migrations. Safe in dev.

## Next Steps
Unblocks Phase 02 (auth tables ready), 03 (curriculum tables ready), 04 (no DB dep but shared types), 06 (no DB dep).

## Completion Note
All 16 tables + enums + migrations created. Prisma 7 ESM client at `src/generated/prisma/`, re-exported via `src/lib/prisma.ts`. Docker Postgres healthy. All quality gates green.
