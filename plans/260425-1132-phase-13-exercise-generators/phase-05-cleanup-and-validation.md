# Phase 05 — Cleanup, Validation, Docs

## Context Links

- Plan: [plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260425-1113-exercise-generation-rootcause-and-roadmap.md`
- Registry: `src/lib/generators/registry.ts`
- Practice flow: `src/app/actions/practice.ts:45-81`
- Submit core: `src/app/actions/practice-submit-core.ts`
- Docs to update: `docs/codebase-summary.md`, `docs/project-changelog.md`, `docs/development-roadmap.md`

## Overview

- **Priority:** P2 (essential hygiene; no new generators but locks the gains)
- **Status:** pending — **BLOCKED until Phases 01-04 ship**
- **Description:** Registry hygiene, cross-phase integration test, docs sync, smoke test of all 44 live generators end-to-end.

## Key Insights

- Original Phase 03 STUB_KEYS contains **13 keys not used by current seed** (lines 30-48 in `registry.ts`):
  - `round-to-nearest-10k`, `compare-multi-digit`, `convert-units-length`, `convert-units-mass`, `convert-units-time`, `area-rectangle`, `perimeter-rectangle`, `mixed-number-conversion`, `percent-find-percent`, `percent-find-base`, `add-sub-decimals-vertical`, `multiply-by-10-100-1000`, `divide-by-10-100-1000`
- After Tiers 1-4 ship, remaining `STUB_KEYS` should be **empty** for keys used by seed. The 13 unused legacy aliases are dead code.
- **Decision:** DELETE 13 unused legacy aliases (clean) — none are referenced by DB or any code. Verify with grep before delete.

## Requirements

### Functional

- All registry stubs reconciled
- Integration test asserting **every `Skill.generatorKey` in DB resolves to a live generator** (not stub)
- Smoke test for all 44 live generators (call `generate` once with fixed seed; assert no throw, format consistent)

### Non-functional

- Zero unused exports in registry
- Docs reflect new state: `10/60 → 44/60` live; 16 poolKey skills still pending Phase 14
- Coverage maintained ≥90% on `src/lib/generators/`

## Architecture

### Cleanup Targets

1. **Delete 13 legacy-alias entries from STUB_KEYS** — registry.ts lines 30-48
2. **Verify STUB_KEYS is empty for all `Skill.generatorKey` in DB** (after deletes; should be 0)
3. **Optional:** rename `STUB_KEYS` array — semantic now is "keys whose generators are NotImplemented but exist in DB seed". After Phase 13 it should be empty. **Decision:** keep array (will refill with future skills); don't rename.

### Integration Test

```ts
// tests/integration/generator-coverage.test.ts (NEW)
describe("generator coverage", () => {
  it("every Skill.generatorKey in DB resolves to a LIVE generator", async () => {
    const skills = await prisma.skill.findMany({ where: { generatorKey: { not: null } } });
    for (const skill of skills) {
      const gen = getGenerator(skill.generatorKey!);
      // Must NOT be a stub: stub generate() throws "NotImplemented"
      expect(() => gen.generate({ seed: "smoke", difficulty: 1, skillKey: skill.key })).not.toThrow();
    }
  });

  it("44 generatorKey skills are live", async () => {
    const skills = await prisma.skill.findMany({ where: { generatorKey: { not: null } } });
    expect(skills.length).toBe(44);
    let liveCount = 0;
    for (const skill of skills) {
      try {
        const gen = getGenerator(skill.generatorKey!);
        gen.generate({ seed: "smoke", difficulty: 1, skillKey: skill.key });
        liveCount++;
      } catch (err) {
        if (!(err instanceof Error && err.message.startsWith("NotImplemented"))) throw err;
      }
    }
    expect(liveCount).toBe(44);
  });

  it("16 poolKey skills resolve as stubs (graceful)", async () => {
    const skills = await prisma.skill.findMany({ where: { poolKey: { not: null } } });
    expect(skills.length).toBe(16);
    // poolKey path returns `{ error: 'stub' }` from getNextQuestion, not throws.
    // No registry lookup expected; this test is documentation.
  });
});
```

### Smoke Test (manual, post-deploy)

- Login student account (PIN 123456 dev)
- For each of 44 live skills: navigate to `/student/practice/<skillKey>`, expect Q renders
- For each of 16 poolKey skills: expect "Bài đang được chuẩn bị" placeholder
- Random pick 5 sessions: complete 1-2 questions, verify XP awarded

### Docs Updates

- `docs/codebase-summary.md` § "src/lib/generators/" — bump live count `10 → 44`; add new directories `number-sense/`, `measurement/`, `reviews/`
- `docs/project-changelog.md` — new entry: `Phase 13 — Exercise Generators` with bullet list of 28 new generators
- `docs/development-roadmap.md` — mark Phase 13 status `In Progress → Complete`; bump Phase 14 (poolKey + spaced-rep) start date

## Related Code Files

### To modify

- `src/lib/generators/registry.ts`:
  - Verify all Tier 1-4 keys removed from STUB_KEYS (cross-check against this plan)
  - Delete 13 legacy aliases (lines 30-48 — old Phase 03 stubs not in seed)
- `docs/codebase-summary.md`
- `docs/project-changelog.md`
- `docs/development-roadmap.md`

### To create

- `tests/integration/generator-coverage.test.ts`

### To delete

None (just lines within registry.ts).

## Implementation Steps

1. Verify Phases 01-04 fully merged. Run `git log --oneline plans/260425-1132-phase-13-exercise-generators/` and check phase status table in `plan.md`.
2. **Pre-flight grep** before deleting legacy aliases:
   ```bash
   for key in round-to-nearest-10k compare-multi-digit convert-units-length convert-units-mass convert-units-time area-rectangle perimeter-rectangle mixed-number-conversion percent-find-percent percent-find-base add-sub-decimals-vertical multiply-by-10-100-1000 divide-by-10-100-1000; do
     grep -r "$key" src/ prisma/ tests/ docs/ --include="*.ts" --include="*.tsx" --include="*.md" || echo "$key: unused"
   done
   ```
   Confirm zero hits outside `registry.ts` STUB_KEYS array. If any DB use found, KEEP the key.
3. Delete confirmed-unused legacy aliases from STUB_KEYS array.
4. Run `pnpm typecheck && pnpm lint && pnpm test:unit`.
5. Write `tests/integration/generator-coverage.test.ts`. Run `pnpm test:int` (or whatever integration test command is wired — verify in `package.json` scripts).
6. Run full test suite: `pnpm test && pnpm test:cov`. Ensure coverage ≥90% on `src/lib/generators/`.
7. Manual smoke test (10 min): login → click 5 skills across grades → verify rendering.
8. Update three docs files with new generator counts and folder structure.
9. Commit: `feat(generators): complete Phase 13 — 44/60 live skills (Tiers 1-4)`.

## Todo List

- [ ] Pre-flight grep for legacy alias references
- [ ] Delete 13 unused legacy aliases from STUB_KEYS
- [ ] Verify STUB_KEYS empty for all DB generatorKey values
- [ ] Write `tests/integration/generator-coverage.test.ts`
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:cov` — all green
- [ ] Manual smoke test: 5 skills across G4+G5 render and validate answers
- [ ] Update `docs/codebase-summary.md` (live count + new dirs)
- [ ] Update `docs/project-changelog.md` (Phase 13 entry)
- [ ] Update `docs/development-roadmap.md` (mark Phase 13 complete)

## Success Criteria

- `STUB_KEYS` array contains zero keys present in `Skill.generatorKey` DB column
- `tests/integration/generator-coverage.test.ts` passes; asserts 44 live + 16 poolKey
- Manual smoke test: 5/5 randomly-picked live skills render real questions
- `pnpm test:cov` ≥90% on `src/lib/generators/`
- 3 docs files updated and reflect post-Phase-13 state
- Single bundled commit `feat(generators): ...`

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| Legacy alias still referenced somewhere (DB seed update from another branch) | L × H | Pre-flight grep mandatory; refuse to delete if any hit |
| Integration test requires DB → may fail in CI without Postgres | M × M | Add to `tests/integration/` (separate runner that spins up Postgres or skips); confirm CI matrix includes integration tier |
| Docs drift if Phase 13 effort spans multiple PRs | M × L | Single PR rule for cleanup phase; or update docs incrementally per phase |
| Manual smoke test misses non-functional regression | L × M | Use existing 161 unit tests + new integration test as primary gate; manual is sanity only |
| 44 live count off-by-one (counting error) | L × M | Test asserts exact 44 — fails fast |

## Rollback Plan

- If integration test fails: identify specific generator failing; revert that generator's commit; re-add to `STUB_KEYS` until fixed.
- If docs got out of sync: docs are markdown — easy to revert to pre-phase state.
- Registry rollback: each tier added itself in a separate commit; revert tier-level commit cleanly removes its imports + entries.
- No DB changes in this phase → zero data risk.

## Security Considerations

- No new attack surface (cleanup phase only)
- Verify `import "server-only"` still present in every generator file (lint rule or grep)
- Re-verify `expectedAnswer` stripped before wire — covered by existing `stripAnswer` in `practice.ts:71`

## Next Steps

- Phase 14: poolKey architecture (16 skills)
- Phase 14b: spaced-repetition cron (deferred from Phase 13 brainstorm)
- Phase 15: visual upgrades for `fraction-concept` / `decimal-concept`

## Unresolved Questions

- Does `pnpm test:int` command exist? Verify package.json scripts during implementation. If absent, integration test runs under `pnpm test`.
- Should integration test seed a fresh test DB or reuse dev DB? Recommended: fresh test DB (deterministic). Confirm CI infra supports.
- After Phase 13, should `STUB_KEYS` array be removed entirely (replaced by single `STUB_KEYS: []`)? Recommended: keep array structure for forward-compat; will refill with Phase 14+ stubs.
