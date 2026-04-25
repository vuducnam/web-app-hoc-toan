---
title: "Phase 03 — Curriculum Seed (Grade 4 + Grade 5)"
priority: P1
effort: 6h
status: completed
depends_on: [01]
completed: 2026-04-24
---

# Phase 03 — Curriculum Seed (Grade 4 + Grade 5)

## Context Links
- Research: `docs/research/researcher-curriculum-knt-k45.md` — canonical content hierarchy and `[gen]` / `[pool]` tags
- Research: `docs/research/researcher-child-safe-gamification.md` §3 — 16 badges to seed into `Badge` table
- Phase 01 schema — `Grade`, `Volume`, `Topic`, `Lesson`, `Skill`, `Badge`

## Overview
Idempotent seed script populates Grades 4 & 5 → Volumes → Topics → Lessons → ~60 Skills (each with `generatorKey` or `poolKey` — never both) + 16 Badges. Rerunnable via `npm run db:seed` without dups.

## Key Insights
- Research file lists topic names in Vietnamese + `[gen]`/`[pool]` tags per skill cluster. Seed extracts these mechanically.
- Every Skill MUST have a stable `key` slug (e.g. `g4-t10-simplify-fraction`). Key is the join target for `SkillProgress`, generator registry, and pool lookups.
- `answerFormat` per skill derived from research §2 "Question Type Taxonomy" + curriculum topic (fractions → FRACTION, decimals → DECIMAL, arithmetic → NUMERIC, units → TEXT, geometry → NUMERIC).
- Grade 4 = ~35 skills, Grade 5 = ~25 skills, total ~60. Exact numbers reconciled in step 2.

## Requirements
**Functional:**
- Seeds both grades fully. After run: `prisma.skill.count() >= 60`.
- Seed is idempotent: running twice produces same state (use `upsert` by natural key, never `create`).
- Every skill either `generatorKey IS NOT NULL` or `poolKey IS NOT NULL` — DB check constraint not possible in Prisma, enforce via seed logic + Phase 12 unit test.
- 16 badges seeded with `key`, `nameVi`, `descVi`, `tier`, `category`, `criteria` (JSON: e.g. `{type: "correct_count", value: 5}`).

**Non-functional:**
- Seed runs under 10s on local Postgres.
- Split static data out of seed script for reviewability: `prisma/seed-data/grade-4.ts`, `grade-5.ts`, `badges.ts`.

## Architecture
```
prisma/seed.ts
  ├── imports ./seed-data/grade-4.ts   (exports gradeStructure: { volumes: [{topics: [{lessons: [{skills: []}]}]}] })
  ├── imports ./seed-data/grade-5.ts
  ├── imports ./seed-data/badges.ts
  └── for each grade: prisma.grade.upsert → prisma.volume.upsert → ... → prisma.skill.upsert
```

## Related Code Files
**Create:**
- `prisma/seed.ts` — orchestrator, uses `prisma.$transaction` per grade
- `prisma/seed-data/grade-4.ts` — static TS array matching research doc
- `prisma/seed-data/grade-5.ts` — idem
- `prisma/seed-data/badges.ts` — 16 badge records
- `prisma/seed-data/types.ts` — shared `SeedSkill`, `SeedTopic` types

**Modify:**
- `package.json` — already has `"db:seed": "tsx prisma/seed.ts"`. Verify.

## Implementation Steps
1. Write `prisma/seed-data/types.ts` with `SeedSkill = { key, nameVi, answerFormat, generatorKey?, poolKey?, timeEstimateSec }` and nested `SeedLesson`, `SeedTopic`, `SeedVolume`, `SeedGrade`.
2. Transcribe `docs/research/researcher-curriculum-knt-k45.md` into `grade-4.ts`:
   - 2 volumes, 13 topics (7 + 6), ~37 lessons, ~35 skills
   - Skills with `[gen]` tag get `generatorKey: "<slug>"`; `[pool]` get `poolKey: "<slug>"`.
   - Proposed key convention: `g{grade}-t{topicOrder}-{shortSlug}`. Example: `g4-t1-add-sub-100k-carry` → `generatorKey: "add-sub-100k-carry"`.
3. Transcribe into `grade-5.ts`: 2 volumes, 12 topics, ~25 skills.
4. Write `prisma/seed-data/badges.ts` — 16 badges from gamification research §3.
5. Write `prisma/seed.ts`:
   ```ts
   import { prisma } from "../src/lib/prisma";
   import { grade4 } from "./seed-data/grade-4";
   import { grade5 } from "./seed-data/grade-5";
   import { badges } from "./seed-data/badges";
   async function seedGrade(g: SeedGrade) {
     const grade = await prisma.grade.upsert({ where: { key: g.key }, create: g.row, update: g.row });
     for (const v of g.volumes) { /* upsert volume, topics, lessons, skills */ }
   }
   await seedGrade(grade4); await seedGrade(grade5);
   for (const b of badges) await prisma.badge.upsert({ where:{key:b.key}, create:b, update:b });
   ```
6. Run `npm run db:seed`. Verify counts via `npm run db:studio` or psql.
7. Re-run seed — verify no errors, counts unchanged.
8. Commit `prisma/seed-data/*` — this is the spec, living doc.

## Todo List
- [x] `seed-data/types.ts`
- [x] `seed-data/grade-4.ts` (~35 skills)
- [x] `seed-data/grade-5.ts` (~25 skills)
- [x] `seed-data/badges.ts` (16 rows)
- [x] `seed.ts` orchestrator w/ upsert
- [x] First run succeeds
- [x] Second run succeeds with zero diffs

## Success Criteria
- [x] `prisma.skill.count() === 60` (±5, exact count frozen at end of seed)
- [x] `prisma.badge.count() === 16`
- [x] Every skill row satisfies `(generatorKey !== null) XOR (poolKey !== null)`
- [x] Running seed twice yields zero new rows the second time
- [x] `npm run typecheck` green

## Risk Assessment
**R1 — Research doc ambiguity on exact skill count (Medium/Low):** Curriculum report lists ~60 but doesn't enumerate line-by-line. Human may disagree on granularity. *Mitigation:* Freeze the enumeration in `seed-data/grade-*.ts` as source of truth; any disagreement resolved by editing seed files, not research doc. Phase 12 locks count via unit test `expect(await prisma.skill.count()).toBe(EXPECTED)`.

**R2 — Key drift between seed, generator registry, and UI (Medium/High):** A typo in `generatorKey` breaks practice page silently. *Mitigation:* Phase 04 exports `REGISTERED_GENERATOR_KEYS` as const string union; Phase 12 unit test asserts every `Skill.generatorKey` in DB exists in the union.

## Rollback Plan
`npm run db:reset` wipes + reseeds. Safe in dev.

## Next Steps
Unblocks Phase 05 (generator/pool lookup), Phase 07 (dashboard reads topics/skills).

## Completion Note
60 skills seeded (33 G4 + 27 G5). 16 badges. All skills have generatorKey XOR poolKey (no null). Seed idempotent — runs twice without duplicates.
