---
title: "Phase 13 — Exercise Generators (28 new live skills)"
description: "Convert 10/60 → ~44/60 live skill generators across 4 tiers (number sense → reviews); poolKey defers to Phase 14."
status: pending
priority: P1
effort: ~26h
branch: main
tags: [generators, curriculum, grade-4, grade-5, content]
created: 2026-04-25
---

## Goal

Implement **28 procedural generators** currently throwing `NotImplemented`. Lift live coverage from **10/60 (16.6%) → 44/60 (73%)**. poolKey skills (16) are out of scope — Phase 14.

## Source of Truth

- Brainstorm: `plans/reports/brainstorm-260425-1113-exercise-generation-rootcause-and-roadmap.md`
- Curriculum seed: `prisma/seed-data/grade-4.ts`, `prisma/seed-data/grade-5.ts`
- Registry: `src/lib/generators/registry.ts` (STUB_KEYS line 28-84)
- Exemplar: `src/lib/generators/arithmetic/add-sub-100k-carry.ts` (template for all)
- Exemplar test: `tests/unit/generators/add-sub-100k-carry.test.ts` (template for all)

## Locked Decisions

- Procedural-only generation (no static bank, no LLM)
- 3 difficulty levels D1/D2/D3 (no 4th tier; advanced ⇒ separate skill)
- Per-generator unit test required (determinism + range/format invariants)
- File ownership: 1 file per generator, kebab-case, `import "server-only"`, ≤200 lines
- Registry hygiene: as each tier ships, MOVE keys from `STUB_KEYS` → `liveGenerators` (no stale entries)

## Phases

| # | Phase | Skills | Status | Effort | Blockers |
|---|---|---|---|---|---|
| 01 | Tier 1 — Number sense + big arithmetic (G4) | 10 | pending | ~7h | none |
| 02 | Tier 2 — Fractions + decimals extensions (G5) | 12 | pending | ~8h | none (parallel to 01) |
| 03 | Tier 3 — Geometry + measurement | 7 | pending | ~5h | none (parallel to 01,02) |
| 04 | Tier 4 — Composite reviews | 5 | pending | ~4h | 01,02,03 (composes them) |
| 05 | Cleanup, validation, docs | — | pending | ~2h | 01,02,03,04 |

**Sequence:** 01/02/03 parallelizable (zero file overlap); 04 must follow because reviews compose other generators; 05 last.

## Phase Files

- [phase-01-tier1-number-sense-arithmetic.md](./phase-01-tier1-number-sense-arithmetic.md) — 10 generators
- [phase-02-tier2-fractions-decimals.md](./phase-02-tier2-fractions-decimals.md) — 12 generators (incl. 6 reclassified)
- [phase-03-tier3-geometry-measurement.md](./phase-03-tier3-geometry-measurement.md) — 7 generators
- [phase-04-tier4-composite-reviews.md](./phase-04-tier4-composite-reviews.md) — 5 generators
- [phase-05-cleanup-and-validation.md](./phase-05-cleanup-and-validation.md) — registry hygiene + integration

## Key Dependencies

- `seedrandom` (already vendored via `seeded-rng.ts`)
- `normalize/numeric.ts`, `normalize/fraction.ts`, `normalize/decimal.ts` (extend if needed; document deltas in phase files)
- Vitest 4 test runner (CI gate ≥90% coverage on `src/lib/generators/`)

## Out of Scope

- 16 `poolKey` skills (angle-measure, parallel-perpendicular, triangle-area, ratio-word-problems, etc.) → Phase 14
- Visual representations of fractions (bar/circle SVG) → Phase 15
- Spaced-rep cron, integration tests, OWASP audit → Phase 13b/14

## Success Criteria

- 44/60 generatorKey skills resolve to live generators (verified by `tests/integration/registry-coverage.test.ts`)
- 0 entries in `STUB_KEYS` for keys touched by tiers 1-4
- Unit tests pass for all 28 new files (determinism, validation, range invariants)
- Coverage on `src/lib/generators/` ≥90%
- No regressions: existing 161 tests still green
- `pnpm typecheck && pnpm lint && pnpm build` all pass
