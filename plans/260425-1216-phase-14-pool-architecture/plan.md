---
title: "Phase 14 — Pool Architecture (14 procedural conversions + 2 pool skills)"
description: "Convert 14 poolKey skills to procedural generators; build ProblemPool DB + Teacher CRUD UI for the 2 truly-data skills."
status: pending
priority: P1
effort: ~32h
branch: main
tags: [generators, pool, teacher, schema, curriculum]
created: 2026-04-25
---

## Goal

Two parallel deliverables:
1. **14a** — Convert 14 of 16 poolKey skills into procedural generators (lift live coverage 44→58/60 = 96.6%).
2. **14b** — Build full pool infrastructure (schema + runtime + Teacher CRUD UI) for the remaining 2 skills (`g4-data-collection`, `g5-data-tables-graphs`) which require pre-built data tables / graphs.

After Phase 14: 58 procedural + 2 pool-backed = 60/60 skills functional.

## Source of Truth

- Brainstorm origin: `plans/reports/brainstorm-260425-1113-exercise-generation-rootcause-and-roadmap.md`
- Predecessor plan: `plans/260425-1132-phase-13-exercise-generators/plan.md`
- Schema: `prisma/schema.prisma`
- Practice runtime: `src/app/actions/practice.ts`, `practice-submit-core.ts`, `practice-client-actions.ts`
- Seed: `prisma/seed-data/grade-4.ts:80,87,236,249,373,386` + `grade-5.ts:53,209,222,235,286,306,361,374,408,429`
- Generator exemplar: `src/lib/generators/measurement/rectangular-prism-volume.ts`
- Composite exemplar: `src/lib/generators/reviews/year-review-comprehensive.ts`

## Locked Decisions (from brainstorm 2026-04-25)

- Authoring role = new `TEACHER` enum (extend `Role` enum)
- Pool scope = HYBRID (`GLOBAL` + `PARENT_OVERRIDE`); union at runtime
- Pool item kind = extensible (`STATIC` | `TEMPLATE`); MVP ships STATIC only
- Difficulty = 3-tier (D1/D2/D3) — same as generators
- MVP seeds 5–10 sample problems per pool skill; teacher UI authors more
- Validation pattern: server re-fetches by id at submit; never trusts client `expectedAnswer`
- Naming: skills with `poolKey` keep poolKey; converted skills switch to `generatorKey`

## Phases

| # | Phase | Status | Effort | Blockers | Parallel |
|---|---|---|---|---|---|
| 01 | Procedural conversion — 14 skills (9 numeric/decimal + 4 MC + 1 composite) | pending | ~12h | none | with 02 |
| 02 | Schema migration — TEACHER role + ProblemPool table | pending | ~3h | none | with 01 |
| 03 | Pool runtime — server actions, validation, security | pending | ~5h | 02 | sequential |
| 04 | Teacher UI — auth flow, dashboard, CRUD pages | pending | ~8h | 02 | with 03 |
| 05 | Pool content seed + integration tests + security audit | pending | ~4h | 01,02,03,04 | sequential |

**Parallelization:** 01 ‖ 02 (zero file overlap). 03 ‖ 04 after 02. 05 last.

## Phase Files

- [phase-01-procedural-conversion-14-skills.md](./phase-01-procedural-conversion-14-skills.md) — 14 generators
- [phase-02-schema-teacher-role.md](./phase-02-schema-teacher-role.md) — Prisma migration
- [phase-03-pool-runtime-server-actions.md](./phase-03-pool-runtime-server-actions.md) — runtime + validation
- [phase-04-teacher-authoring-ui.md](./phase-04-teacher-authoring-ui.md) — `/teacher/*` routes + CRUD
- [phase-05-pool-content-and-validation.md](./phase-05-pool-content-and-validation.md) — seed, tests, audit

## Key Dependencies

- Phase 13 plan completed (44 live generators) — required reference for composites
- `seedrandom`, normalize utils — reused
- Prisma 7 migration pipeline (`prisma migrate dev`)
- Auth.js v5 dual-credentials — extend with TEACHER role only (no new provider)

## Out of Scope

- TEMPLATE pool items (interface defined; runtime throws "not yet supported") → Phase 15
- "Avoid recently shown" pool selection (track via Attempt) → Phase 15
- Bulk import CSV / image upload for pool problems → Phase 15
- Per-class assignment (teacher owns class) → Phase 17

## Success Criteria

- 58/60 skills resolve via procedural generators (was 44, +14)
- 2/60 skills resolve via pool with ≥5 sample problems each
- TEACHER user can sign in, list skills, CRUD problems, see live preview
- Submit-time security: verified client cannot inject `expectedAnswer` (test asserts)
- 0 regressions on existing 161+ tests; coverage on new code ≥90%
- `pnpm typecheck && pnpm lint && pnpm build` all pass
